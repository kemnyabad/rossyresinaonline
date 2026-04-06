import { z } from "zod";

const cloudinaryUrl = z.string().url();

export const ProductSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres").optional(),
  title: z.string().min(3, "El título debe tener al menos 3 caracteres").optional(),
  price: z.union([z.number(), z.string()]).transform((v) => Number(v)).pipe(
    z.number().positive("El precio debe ser mayor a 0")
  ),
  description: z.string().default(""),
  category: z.string().default(""),
  stock: z.union([z.number(), z.string()])
    .transform((v) => Math.floor(Number(v) || 0))
    .pipe(z.number().int().nonnegative("El stock no puede ser negativo")),
  images: z.union([
    cloudinaryUrl,
    z.array(cloudinaryUrl),
    z.string(),
    z.array(z.string()),
  ]).optional(),
}).refine((data) => data.name || data.title, {
  message: "Se requiere name o title",
  path: ["title"],
});

export type ProductInput = z.infer<typeof ProductSchema>;
