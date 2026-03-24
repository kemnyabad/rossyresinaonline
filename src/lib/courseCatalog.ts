export type CourseMode = "Presencial" | "Virtual" | "Hibrido";
export type CourseLevel = "Basico" | "Intermedio" | "Avanzado";

export type CourseItem = {
  id: string;
  title: string;
  summary: string;
  cover: string;
  mode: CourseMode;
  level: CourseLevel;
  city: string;
  venue: string;
  startAt: string;
  durationHours: number;
  totalSeats: number;
  soldSeats: number;
  price: number;
  oldPrice?: number;
  tags: string[];
};

export const courseCatalog: CourseItem[] = [
  {
    id: "resina-ep?xica-desde-cero",
    title: "Resina Epoxica Desde Cero",
    summary: "Aprende mezclas, pigmentacion, burbujas y acabados para vender piezas con calidad comercial.",
    cover: "/banner/banner1.jpg",
    mode: "Presencial",
    level: "Basico",
    city: "Lima",
    venue: "Studio Rossy Resina - Los Olivos",
    startAt: "2026-04-12T10:00:00-05:00",
    durationHours: 4,
    totalSeats: 30,
    soldSeats: 22,
    price: 89,
    oldPrice: 120,
    tags: ["Certificado", "Incluye materiales", "Proyecto final"],
  },
  {
    id: "moldes-y-desmolde-pro",
    title: "Moldes y Desmolde Pro",
    summary: "Domina moldes de silicona, desmolde limpio y acabados premium para piezas de alto valor.",
    cover: "/banner/banner2.jpg",
    mode: "Hibrido",
    level: "Intermedio",
    city: "Lima",
    venue: "Studio + Zoom en vivo",
    startAt: "2026-04-19T19:00:00-05:00",
    durationHours: 3,
    totalSeats: 40,
    soldSeats: 14,
    price: 69,
    tags: ["Grabaci?n 30 d?as", "Plantillas de trabajo"],
  },
  {
    id: "resina-uv-joyeria",
    title: "Resina UV para Joyeria",
    summary: "T?cnicas para dije, aretes y llaveros con curado UV r?pido y acabado brillante.",
    cover: "/banner/banner3.jpg",
    mode: "Virtual",
    level: "Basico",
    city: "Online",
    venue: "Zoom + soporte por WhatsApp",
    startAt: "2026-04-26T20:00:00-05:00",
    durationHours: 2.5,
    totalSeats: 120,
    soldSeats: 88,
    price: 49,
    oldPrice: 75,
    tags: ["Acceso inmediato", "Checklist de insumos"],
  },
];

export const getCourseAvailability = (course: CourseItem) => {
  const remaining = Math.max(0, course.totalSeats - course.soldSeats);
  if (remaining === 0) return { label: "Agotado", tone: "soldout" as const };
  if (remaining <= 6) return { label: "?ltimas vacantes", tone: "warning" as const };
  return { label: "Disponible", tone: "available" as const };
};

export const findCourseById = (id: string) =>
  courseCatalog.find((item) => String(item.id) === String(id));

