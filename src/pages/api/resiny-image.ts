import type { NextApiRequest, NextApiResponse } from "next";

const normalize = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const looksLikeExternalInspiration = (prompt: string) =>
  /\b(pinterest|google|instagram|tiktok|referencia|inspiracion|inspiración|foto|imagen)\b/.test(normalize(prompt));

const buildPrompt = (prompt: string) => `
Diseño visual original para una clienta de Rossy Resina, tienda peruana de materiales para resina.
Solicitud de la clienta: ${prompt}

Objetivo:
- Crear una propuesta inspiradora y realizable para un proyecto de resina artesanal.
- Debe servir como idea para moldes de silicona, dijes, llaveros, aretes, lapiceros shaker, bandejas, portavasos, encapsulados, flores secas, glitter, micas o pigmentos.
- Si la clienta menciona Pinterest, Google u otra referencia, NO copies una imagen exacta ni reproduzcas un diseño protegido; crea una variación original con estética similar, adaptada a resina.

Dirección visual:
- Fotografía de producto o render realista limpio.
- Fondo claro, iluminación suave de estudio, composición ordenada.
- Mostrar textura de resina transparente o pigmentada, brillo controlado, detalles artesanales y escala creíble.
- Estilo moderno, femenino, vendible para emprendimiento artesanal.

Evita:
- Logos, marcas externas, texto ilegible, manos deformes, exceso de objetos, fondos oscuros o resultado de baja calidad.
- Diseños imposibles de fabricar con resina o moldes.

${looksLikeExternalInspiration(prompt) ? "Trabaja como moodboard original inspirado en la descripción, no como copia literal de ninguna imagen externa." : ""}
`;

const toFriendlyOpenAiImageError = (message: string) => {
  const text = normalize(message);
  if (text.includes("billing hard limit") || text.includes("quota") || text.includes("billing")) {
    return "La creación de imágenes está pausada porque la cuenta de IA llegó a su límite de facturación. Activa o aumenta el límite de billing de OpenAI para volver a generar imágenes.";
  }
  if (text.includes("organization verification") || text.includes("verify")) {
    return "La cuenta de OpenAI necesita verificación de organización para usar generación de imágenes. Completa la verificación en el panel de OpenAI.";
  }
  if (text.includes("content policy") || text.includes("safety")) {
    return "No pude crear esa imagen por políticas de seguridad. Prueba describiendo un diseño artesanal original, sin copiar una imagen exacta.";
  }
  return "No pude generar la imagen en este momento. Intenta con una descripción más específica del proyecto de resina.";
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const prompt = String(req.body?.prompt || "").trim();
  if (!prompt) return res.status(400).json({ error: "Describe la imagen que quieres generar." });

  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Todavía no tengo activa la creación de imágenes aquí. Puedo ayudarte a armar la idea visual con colores, estilo y materiales para que tengas una guía clara.",
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: buildPrompt(prompt),
        size: "1024x1024",
        quality: "medium",
        n: 1,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      const message = data?.error?.message || "No se pudo generar la imagen.";
      return res.status(response.status).json({ error: toFriendlyOpenAiImageError(message) });
    }

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return res.status(500).json({ error: "La API no devolvió una imagen válida." });

    return res.status(200).json({ imageUrl: `data:image/png;base64,${b64}` });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "No se pudo generar la imagen." });
  }
}
