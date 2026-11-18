import type { Metadata } from "next";
import { BRAND_NAME, CONTACT } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Política de privacidad — ${BRAND_NAME}`,
  description: "Qué datos pide KingPark, para qué los usa y cómo ejercer tus derechos.",
};

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: "Quién es responsable de tus datos",
    body: (
      <p>
        KingPark es un servicio de Border&apos;s Parking SRL, con operación en BA Ferial (ex Costa Salguero), Ciudad
        Autónoma de Buenos Aires. Por cualquier consulta sobre tus datos, escribinos a{" "}
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>.
      </p>
    ),
  },
  {
    title: "Qué datos pedimos",
    body: (
      <ul>
        <li>Nombre, apellido, mail y teléfono.</li>
        <li>Patente, marca y modelo del vehículo.</li>
        <li>CUIT y razón social, si pedís factura A.</li>
        <li>Fechas y horarios de la reserva, cantidad de pasajeros y datos del vuelo o del crucero.</li>
        <li>
          El estado y el importe del pago. Los datos de tu tarjeta los carga y los guarda Mercado Pago: nosotros no los
          vemos.
        </li>
        <li>Datos de navegación: páginas visitadas, dispositivo y el anuncio por el que llegaste.</li>
      </ul>
    ),
  },
  {
    title: "Para qué los usamos",
    body: (
      <ul>
        <li>Crear tu reserva, cobrarla y enviarte el código QR.</li>
        <li>Coordinar el ingreso, el traslado y el retiro del vehículo.</li>
        <li>Responder consultas y gestionar cambios, extensiones o devoluciones.</li>
        <li>Medir el uso del sitio y el resultado de nuestros anuncios.</li>
        <li>Cumplir obligaciones legales y contables.</li>
      </ul>
    ),
  },
  {
    title: "Con quién los compartimos",
    body: (
      <>
        <p>No vendemos tus datos. Sólo los comparten los proveedores que necesitamos para dar el servicio:</p>
        <ul>
          <li>Mercado Pago, para procesar el pago.</li>
          <li>Vercel y Neon, para alojar el sitio y la base de datos.</li>
          <li>Google, para el envío de mails, la medición del sitio y los anuncios.</li>
          <li>Meta, para la medición de anuncios en Instagram y Facebook.</li>
        </ul>
        <p>Algunos de estos proveedores guardan la información en servidores fuera de la Argentina.</p>
      </>
    ),
  },
  {
    title: "Cookies",
    body: (
      <p>
        Usamos cookies de medición y de publicidad de Google y Meta. Podés rechazarlas en el aviso que aparece al entrar
        al sitio: la reserva funciona igual. Si cambiás de opinión, borrá los datos de este sitio en tu navegador y el
        aviso vuelve a aparecer.
      </p>
    ),
  },
  {
    title: "Cuánto tiempo los guardamos",
    body: <p>Mientras dure la reserva y durante el plazo que exijan las obligaciones legales y contables.</p>,
  },
  {
    title: "Tus derechos",
    body: (
      <>
        <p>
          Podés pedir acceder a tus datos, corregirlos, actualizarlos o eliminarlos escribiendo a{" "}
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. El acceso es gratuito a intervalos no inferiores a
          seis meses, salvo que acredites un interés legítimo, conforme al artículo 14, inciso 3, de la Ley 25.326.
        </p>
        <p>
          La Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326, atiende las denuncias y los
          reclamos por incumplimiento de las normas sobre protección de datos personales.
        </p>
      </>
    ),
  },
];

export default function PrivacidadPage() {
  return (
    <section className="bg-gradient-to-b from-brand-50/70 via-white to-white px-4 py-12 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-extrabold tracking-[-0.03em] text-brand-950 sm:text-5xl">
          Política de privacidad
        </h1>
        <p className="mt-3 text-sm text-brand-500">Última actualización: 18 de noviembre de 2026</p>

        <div className="mt-10 space-y-9">
          {SECTIONS.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-xl font-bold text-brand-900">{s.title}</h2>
              <div className="mt-2 space-y-3 text-base leading-relaxed text-brand-700 [&_a]:font-semibold [&_a]:text-brand-600 [&_a]:underline [&_a]:underline-offset-2 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
