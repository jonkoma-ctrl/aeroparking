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
import fsSync from "node:fs";
import path from "node:path";

// Cargar .env manualmente (tsx no lo hace automático y no queremos sumar deps).
function loadDotEnv(file: string) {
  if (!fsSync.existsSync(file)) return;
  const content = fsSync.readFileSync(file, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Sacar comillas
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}
loadDotEnv(path.join(process.cwd(), ".env"));
loadDotEnv(path.join(process.cwd(), ".env.local"));

interface MigrationItem {
  oldUrl: string;
  folder: string;
  filename: string;
  label: string;
}

const ITEMS: MigrationItem[] = [
  // Re-generadas con uniforme correcto: chomba naranja + pantalón cargo negro.
  // Mismos filenames del Blob → sobreescriben las anteriores (allowOverwrite: true).
  // El sitio no requiere cambios de código: las URLs de Blob ya quedaron escritas.
  {
    oldUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_202826_8349fb8a-d5ec-4cd0-8652-bfbcc8d43f33.png",
    folder: "hero",
    filename: "costa-salguero-valet.png",
    label: "Hero — valet caminando (uniforme naranja+cargo)",
  },
  {
    oldUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_202841_fd33064f-97ca-457f-9a6d-ffa362a7c63b.png",
    folder: "facility",
    filename: "recepcion-valet.png",
    label: "Facility — recepción (uniforme naranja+cargo)",
  },
  {
    oldUrl: "https://d8j0ntlcm91z4.cloudfront.net/user_3DMiggj4xA2M0vqbzgDi4u6xSTm/hf_20260516_202855_e050c5d8-7189-4c8d-a90b-936181c005f4.png",
    folder: "facility",
    filename: "furgoneta-traslado.png",
    label: "Facility — furgoneta (uniforme naranja+cargo)",
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
