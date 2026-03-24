import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  return res.status(410).json({
    error: "Checkout con pasarela deshabilitado. Usa /checkout con pedido manual.",
  });
}
