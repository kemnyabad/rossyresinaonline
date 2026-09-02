const HEIC_EXTENSION_RE = /\.(heic|heif)$/i;
const HEIC_MIME_RE = /^image\/hei[cf]$/i;

export const isHeicFile = (file: File): boolean =>
  HEIC_MIME_RE.test(file.type || "") || HEIC_EXTENSION_RE.test(file.name || "");

export const readUploadError = async (res: Response, fallback: string): Promise<string> => {
  const text = await res.text().catch(() => "");
  if (!text) return fallback;
  try {
    const json = JSON.parse(text);
    return String(json?.error || json?.message || fallback);
  } catch {
    if (res.status === 413 || text.includes("Request Entity Too Large")) {
      return "El archivo es demasiado grande. Comprímelo o súbelo en partes más pequeñas.";
    }
    return text.slice(0, 180);
  }
};

// HEIC/HEIF (fotos de iPhone) no se puede mostrar en la mayoria de navegadores,
// asi que forzamos a Cloudinary a convertirlas a JPG al momento de subirlas.
export const uploadImageToCloudinary = async (file: File, folder: string): Promise<string> => {
  const forceJpg = isHeicFile(file);
  const signUrl = `/api/admin/rifas/cloudinary-sign?folder=${encodeURIComponent(folder)}${
    forceJpg ? "&format=jpg" : ""
  }`;
  const signRes = await fetch(signUrl);
  if (!signRes.ok) {
    throw new Error(await readUploadError(signRes, "No se pudo preparar la subida de imagen."));
  }

  const signData = await signRes.json();
  const body = new FormData();
  body.append("file", file);
  body.append("api_key", signData.apiKey);
  body.append("timestamp", String(signData.timestamp));
  body.append("folder", folder);
  if (forceJpg) body.append("format", "jpg");
  body.append("signature", signData.signature);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`, {
    method: "POST",
    body,
  });
  if (!uploadRes.ok) {
    throw new Error(await readUploadError(uploadRes, "No se pudo subir la imagen a Cloudinary."));
  }

  const json = await uploadRes.json();
  const url = String(json.secure_url || "").trim();
  if (!url) throw new Error("Cloudinary no devolvió la URL de la imagen.");
  return url;
};
