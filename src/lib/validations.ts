import { z } from "zod";

const cloudinaryUrl = z.string().url();
const nonEmptyString = (message: string) => z.string().trim().min(1, message);

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

export const OrderItemSchema = z.object({
  _id: z.union([z.string(), z.number()]).optional(),
  productId: z.union([z.string(), z.number()]).optional(),
  code: z.string().optional(),
  quantity: z.union([z.number(), z.string()])
    .transform((v) => Number(v))
    .pipe(z.number().int().positive("La cantidad debe ser mayor a 0"))
    .optional(),
});

export const OrderCustomerSchema = z.object({
  name: nonEmptyString("Nombre completo requerido"),
  dni: z.string().trim().min(6, "DNI requerido"),
  phone: nonEmptyString("Teléfono o WhatsApp requerido"),
  email: z.string().trim().email("Correo invalido").optional().or(z.literal("")),
  locationLine: nonEmptyString("Departamento, provincia y distrito requeridos"),
  notes: z.string().optional(),
  shippingCarrier: z.string().optional(),
  shalomAgency: z.string().optional(),
  olvaAddress: z.string().optional(),
  olvaReference: z.string().optional(),
  paymentMethod: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  customer: OrderCustomerSchema,
  items: z.array(OrderItemSchema).min(1, "Carrito vacio"),
  shippingCarrier: z.string().optional(),
  shalomAgency: z.string().optional(),
  olvaAddress: z.string().optional(),
  olvaReference: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentImage: nonEmptyString("Debes adjuntar comprobante de pago"),
});

export const AdminUserCreateSchema = z.object({
  name: z.string().optional(),
  email: z.string().trim().email("Correo invalido"),
  password: z.string().trim().min(6, "La contrasena debe tener al menos 6 caracteres"),
  role: z.enum(["ADMIN", "EDITOR", "CUSTOMER"]).optional(),
});

export const AdminUserUpdateSchema = z.object({
  id: nonEmptyString("ID requerido"),
  name: z.string().optional(),
  role: z.enum(["ADMIN", "EDITOR", "CUSTOMER"]).optional(),
});

export const AdminUserDeleteSchema = z.object({
  id: nonEmptyString("ID requerido"),
});
