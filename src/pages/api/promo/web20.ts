import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      code: "WEB20",
      active: false,
      minimumSubtotal: 100,
      discountValue: 20,
      startsAt: "",
      endsAt: "",
    });
  }

  if (req.method === "POST") {
    return res.status(410).json({
      error: "El cupón WEB20 ya no está disponible.",
      discount: 0,
    });
  }

  return res.status(405).json({ error: "Método no permitido" });
}
