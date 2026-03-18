export type VideoItem = {
  id: string;
  title: string;
  desc: string;
  duration: string;
  views: string;
  date: string;
  level: string;
  tag: string;
  thumb: string;
};

export const videos: VideoItem[] = [
  {
    id: "rr-101",
    title: "Resina epoxica desde cero: mezcla, burbujas y curado",
    desc: "Bases claras para evitar errores comunes y lograr piezas cristalinas.",
    duration: "18:42",
    views: "2.4K",
    date: "hace 2 semanas",
    level: "Basico",
    tag: "Resina epoxica",
    thumb: "/sliderImg_1.svg",
  },
  {
    id: "rr-102",
    title: "Moldes de silicona: desmolde perfecto y cuidado del molde",
    desc: "Aprende tiempos, desmolde y tips para que duren mas.",
    duration: "24:10",
    views: "1.1K",
    date: "hace 1 mes",
    level: "Intermedio",
    tag: "Moldes",
    thumb: "/sliderImg_6.svg",
  },
  {
    id: "rr-103",
    title: "Pigmentos y efectos: nacarado, glitter y transparentes",
    desc: "Como dosificar color y crear capas que brillen.",
    duration: "15:03",
    views: "3.8K",
    date: "hace 5 dias",
    level: "Basico",
    tag: "Pigmentos",
    thumb: "/sliderImg_2.svg",
  },
  {
    id: "rr-104",
    title: "Ecoresina: mezcla correcta y acabado mate premium",
    desc: "Proporciones, desmolde y sellado.",
    duration: "20:55",
    views: "980",
    date: "hace 3 semanas",
    level: "Intermedio",
    tag: "Ecoresina",
    thumb: "/sliderImg_3.svg",
  },
  {
    id: "rr-105",
    title: "Pulido y acabado espejo en piezas de resina",
    desc: "Lijado por etapas y pulido final.",
    duration: "12:18",
    views: "5.2K",
    date: "hace 4 meses",
    level: "Avanzado",
    tag: "Acabados",
    thumb: "/sliderImg_6.svg",
  },
  {
    id: "rr-106",
    title: "Accesorios y herrajes: armado rapido y seguro",
    desc: "Herramientas, pegado y montaje.",
    duration: "09:44",
    views: "1.9K",
    date: "hace 2 meses",
    level: "Basico",
    tag: "Accesorios",
    thumb: "/sliderImg_1.svg",
  },
  {
    id: "rr-107",
    title: "Resina UV: curado rapido y tips para brillo",
    desc: "Cuando usar UV y como evitar capas pegajosas.",
    duration: "11:27",
    views: "2.1K",
    date: "hace 6 dias",
    level: "Basico",
    tag: "Resina UV",
    thumb: "/sliderImg_2.svg",
  },
  {
    id: "rr-108",
    title: "Diseno de moldes personalizados para pedidos",
    desc: "Como tomar medidas, prototipar y entregar.",
    duration: "19:05",
    views: "740",
    date: "hace 1 mes",
    level: "Intermedio",
    tag: "Personalizados",
    thumb: "/sliderImg_3.svg",
  },
];
