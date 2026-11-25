import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { ADMIN_NOTIFY_EMAIL } from "@/lib/reservation-payment";
import { checkWebTariffs } from "@/lib/tariff-alarm";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/tariff-check — alarma de tarifas (cada 6 h, ver vercel.json).
 *
 * Origen: el 25-nov-2026 la tarifa puerto/cruceros quedó apagada y sin grilla
 * y la web cotizaba $0: nadie pudo reservar cruceros. Esto cotiza cada destino
 * activo como lo hace la web y, si alguno da $0, avisa por mail. Mientras siga
 * roto, avisa en cada corrida.
 *
 * Sin datos de clientes: sólo destino, tarifa y fechas de prueba.
 * Vercel manda Authorization: Bearer $CRON_SECRET.
 */
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!CRON_SECRET || auth !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const checks = await checkWebTariffs();
  const broken = checks.filter((c) => c.total <= 0);

  const alerts: { slug: string; sent: boolean }[] = [];
  for (const c of broken) {
    try {
      await sendEmail({
        to: ADMIN_NOTIFY_EMAIL,
        subject: `KingPark: ${c.label} no tiene tarifa — no se puede reservar`,
        html: `
          <p><strong>La web no puede cotizar ${c.label}.</strong> Un cliente que quiera reservar ve
          «No hay tarifa para esas fechas» y no puede pagar.</p>
          <p>Probamos una estadía del ${c.startDate} al ${c.endDate} (10:00 a 10:00) y la tarifa que
          usa la web (<code>${c.slug} / ${c.serviceType}</code>) dio <strong>$0</strong>.</p>
          <p>Qué revisar en <strong>/admin/tarifas</strong>: la fila que dice «La usa la web» para ese
          destino tiene que estar <strong>Activa</strong> y tener precio o grilla cargada.</p>
          <p style="color:#888;font-size:12px">Alarma automática, corre cada 6 horas. Sigue avisando mientras no se arregle.</p>
        `,
      });
      alerts.push({ slug: c.slug, sent: true });
    } catch (err) {
      console.error("[cron/tariff-check] alert failed for", c.slug, err);
      alerts.push({ slug: c.slug, sent: false });
    }
  }

  return NextResponse.json({
    ok: broken.length === 0,
    timestamp: new Date().toISOString(),
    checks: checks.map(({ slug, serviceType, total }) => ({ slug, serviceType, total })),
    alerts,
  });
}
