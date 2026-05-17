import type { NextApiRequest, NextApiResponse } from "next";

const buildPrompt = (prompt: string) => `
Imagen para una clienta de Rossy Resina.
Tema solicitado: ${prompt}

Estilo: fotografía o render limpio de producto artesanal en resina, estética moderna, fondo claro, buena iluminación, composición útil para inspirar un proyecto real.
Evita texto ilegible, logos inventados, marcas externas y resultados recargados.
`;

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
      return res.status(response.status).json({ error: message });
    }

    const b64 = data?.data?.[0]?.b64_json;
    if (!b64) return res.status(500).json({ error: "La API no devolvió una imagen válida." });

    return res.status(200).json({ imageUrl: `data:image/png;base64,${b64}` });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "No se pudo generar la imagen." });
  }
}
