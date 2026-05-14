import type { Metadata } from "next";
import fs from "node:fs/promises";
import path from "node:path";
import { marked, type Tokens } from "marked";
import { BRAND_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Manual interno — ${BRAND_NAME}`,
  robots: { index: false, follow: false }, // No indexar en buscadores
};

export const dynamic = "force-dynamic";

async function loadManual(): Promise<string> {
  try {
    const filePath = path.join(process.cwd(), "MANUAL.md");
    return await fs.readFile(filePath, "utf-8");
  } catch (e) {
    console.error("Error reading MANUAL.md:", e);
    return "# Manual no disponible\n\nEl archivo no se encontró.";
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default async function ManualPage() {
  const raw = await loadManual();

  // Custom renderer para agregar IDs a los headings (TOC anclas)
  const renderer = new marked.Renderer();
  renderer.heading = ({ tokens, depth }: Tokens.Heading) => {
    const text = tokens.map((t) => ("text" in t ? t.text : "")).join("");
    const id = slugify(text);
    return `<h${depth} id="${id}">${text}</h${depth}>`;
  };

  marked.setOptions({
    gfm: true,
    breaks: false,
    renderer,
  });

  const html = await marked.parse(raw);

  return (
    <div className="min-h-screen bg-brand-50">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
              Documentación interna · No listada
            </p>
            <h1 className="font-display text-3xl font-bold text-brand-900 sm:text-4xl">
              Manual de la plataforma
            </h1>
          </div>
          <a
            href="/admin/dashboard"
            className="hidden text-sm text-brand-500 hover:text-brand-700 sm:block"
          >
            ← Volver al admin
          </a>
        </div>

        <article
          className="manual-prose rounded-2xl border border-brand-200 bg-white p-6 shadow-sm sm:p-10"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <p className="mt-8 text-center text-xs text-brand-400">
          Para actualizar este manual: editar <code className="rounded bg-brand-100 px-1.5 py-0.5 font-mono text-[11px]">MANUAL.md</code> en el repo y hacer commit. Se refleja después del deploy.
        </p>
      </div>
    </div>
  );
}
