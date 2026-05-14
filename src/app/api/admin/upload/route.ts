import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/admin/upload — multipart/form-data con campo "file" + (opcional) "folder"
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string | null) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "Falta archivo" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Tipo no permitido: ${file.type}. Usá JPG, PNG, WebP o GIF.` },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `Archivo muy grande (${Math.round(file.size / 1024 / 1024)}MB). Máximo 5MB.` },
        { status: 400 }
      );
    }

    // Sanitize folder name
    const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").toLowerCase().slice(0, 32) || "uploads";

    // Build a unique path: folder/<timestamp>-<originalName>
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80);
    const pathname = `${safeFolder}/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    console.error("Upload error:", error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const err = error as any;
    const message = err?.message || "Error al subir el archivo";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
