/**
 * Migra las imágenes IA del CDN de Higgsfield al Vercel Blob propio.
 *
 * Por qué: las URLs del CDN externo pueden expirar/cambiar. Mejor tenerlas
 * en nuestro Blob (controlamos nosotros).
 *
 * Requiere: BLOB_READ_WRITE_TOKEN en el entorno.
 *   vercel env pull .env --environment=production --yes
 *   npx tsx scripts/migrate-ai-images-to-blob.ts
 *
 * El script:
 *  1. Baja cada imagen del CDN viejo.
 *  2. Sube a Vercel Blob (folder: hero/ y facility/).
 *  3. Imprime las URLs nuevas.
 *  4. Reescribe los archivos del repo que las usan.
 */
import { put } from "@vercel/blob";
import fs from "node:fs/promises";
import path from "node:path";

interface MigrationItem {
  oldUrl: string;
  folder: string;
  filename: string;
  label: string;
}

const ITEMS: MigrationItem[] = [
  {
    oldUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_201400_7a608f99-659e-4589-bb74-d77d945a6b55.png",
    folder: "hero",
    filename: "costa-salguero-valet.png",
    label: "Hero — valet caminando",
  },
  {
    oldUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_201448_2e8f18c6-fbde-475d-9de8-c4c65b41f850.png",
    folder: "facility",
    filename: "sector-cubierto.png",
    label: "Facility — sector cubierto",
  },
  {
    oldUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_201434_4ea87a18-d30f-42d0-bf34-902166bd4d97.png",
    folder: "facility",
    filename: "recepcion-valet.png",
    label: "Facility — recepción",
  },
  {
    oldUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_201414_bc793123-9149-4c3e-866c-7acf19d24d04.png",
    folder: "facility",
    filename: "furgoneta-traslado.png",
    label: "Facility — furgoneta",
  },
];

async function downloadAndUpload(item: MigrationItem): Promise<string> {
  console.log(`  ↓ Descargando ${item.label}...`);
  const res = await fetch(item.oldUrl);
  if (!res.ok) throw new Error(`Falló descarga ${item.oldUrl}: ${res.status}`);
  const blob = await res.blob();

  console.log(`  ↑ Subiendo a Vercel Blob (${item.folder}/${item.filename})...`);
  const pathname = `${item.folder}/${item.filename}`;
  const uploaded = await put(pathname, blob, {
    access: "public",
    addRandomSuffix: false,
    contentType: "image/png",
    allowOverwrite: true,
  });
  return uploaded.url;
}

async function rewriteFiles(mapping: Record<string, string>) {
  const filesToUpdate = [
    "src/lib/site-settings.ts",
    "src/components/landing/OurFacility.tsx",
  ];

  for (const rel of filesToUpdate) {
    const abs = path.join(process.cwd(), rel);
    let content = await fs.readFile(abs, "utf-8");
    let changes = 0;
    for (const [oldUrl, newUrl] of Object.entries(mapping)) {
      if (content.includes(oldUrl)) {
        content = content.split(oldUrl).join(newUrl);
        changes++;
      }
    }
    if (changes > 0) {
      await fs.writeFile(abs, content, "utf-8");
      console.log(`  ✓ ${rel} — ${changes} URL${changes === 1 ? "" : "s"} reemplazada(s)`);
    } else {
      console.log(`  · ${rel} — sin cambios`);
    }
  }
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error("❌ Falta BLOB_READ_WRITE_TOKEN en el entorno.");
    console.error("   Corré primero: vercel env pull .env --environment=production --yes");
    process.exit(1);
  }

  console.log("Migrando imágenes IA → Vercel Blob...\n");

  const mapping: Record<string, string> = {};
  for (const item of ITEMS) {
    try {
      const newUrl = await downloadAndUpload(item);
      mapping[item.oldUrl] = newUrl;
      console.log(`  ✓ ${item.label}\n    → ${newUrl}\n`);
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.error(`  ✗ Falló ${item.label}: ${(e as any)?.message}\n`);
    }
  }

  console.log("\nReescribiendo archivos del repo...\n");
  await rewriteFiles(mapping);

  console.log("\n✓ Listo. Revisá los archivos modificados y commiteá.");
  console.log("\nMapping completo:");
  console.log(JSON.stringify(mapping, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
