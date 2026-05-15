import prisma from "@/lib/prisma";

type KnowledgeChunk = {
  title: string;
  keywords: string[];
  body: string;
};

const normalize = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const sanitize = (value: any, max = 500) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

const KNOWLEDGE: KnowledgeChunk[] = [
  {
    title: "Artesania para principiantes",
    keywords: ["principiante", "empezar", "inicio", "manualidad", "artesania", "materiales", "basico"],
    body:
      "Para empezar en artesania conviene elegir un proyecto pequeno, repetible y con pocos materiales: llaveros, dijes, aretes, jabones decorativos, velas, piezas en resina o detalles personalizados. La ruta recomendada es practicar tecnica, calcular costos, tomar buenas fotos y luego vender piezas simples antes de pasar a proyectos grandes.",
  },
  {
    title: "Resina epoxica",
    keywords: ["resina", "epoxica", "epoxi", "endurecedor", "catalizador", "mezcla", "curado"],
    body:
      "La resina epoxica se trabaja mezclando resina base y endurecedor en la proporcion indicada por el fabricante. Mezclar lento 3 a 5 minutos, raspar paredes y fondo, trabajar entre 22 y 28 grados y dejar curar sin mover. Si queda pegajosa suele ser por mala proporcion, mezcla incompleta, frio o exceso de pigmento.",
  },
  {
    title: "Resina UV",
    keywords: ["uv", "resina uv", "lampara", "joyeria", "dijes", "capa fina"],
    body:
      "La resina UV cura con lampara UV o sol directo y sirve para piezas pequenas, joyeria, dijes, reparaciones y detalles. No conviene para piezas gruesas porque la luz no penetra bien. Si queda pegajosa, la capa pudo ser muy gruesa, la lampara debil o el pigmento demasiado opaco.",
  },
  {
    title: "Eco resina",
    keywords: ["eco resina", "ecoresina", "yeso", "jesmonite", "decoracion", "bandeja"],
    body:
      "La eco resina se usa mucho para decoracion, bandejas, portavelas decorativos y piezas con acabado tipo piedra o ceramica. Es buena para moldes, pigmentos minerales y piezas decorativas, pero no reemplaza a la epoxica cuando se busca transparencia tipo vidrio.",
  },
  {
    title: "Moldes de silicona",
    keywords: ["molde", "moldes", "silicona", "desmolde", "cuidado"],
    body:
      "Los moldes de silicona deben lavarse con jabon suave, secarse bien y guardarse lejos del calor y sol directo. No usar objetos cortantes para desmoldar. Para principiantes convienen moldes pequenos porque gastan menos material y permiten practicar color, burbujas y acabado.",
  },
  {
    title: "Pigmentos y color",
    keywords: ["pigmento", "mica", "colorante", "glitter", "escarcha", "color", "perlado"],
    body:
      "En resina se puede usar mica en polvo, pigmento en pasta, colorante liquido, glitter o inclusiones secas. No conviene exceder 6% de pigmento total porque puede afectar el curado. Para efecto perlado usa mica; para color transparente usa colorante liquido; para color solido usa pasta.",
  },
  {
    title: "Burbujas",
    keywords: ["burbuja", "burbujas", "soplete", "pistola de calor", "aire"],
    body:
      "Las burbujas aparecen por mezclar rapido, trabajar con frio, verter desde muy alto o usar moldes con detalles profundos. Mezclar lento, dejar reposar, calentar suavemente el molde o la resina y pasar pistola de calor o soplete a distancia ayuda. Evitar quemar el molde.",
  },
  {
    title: "Pulido y acabados",
    keywords: ["pulir", "lijar", "brillo", "opaco", "acabado", "lija", "barniz"],
    body:
      "Para recuperar brillo se lija progresivamente en humedo: 400, 800, 1200 y 2000. Luego se usa pasta pulidora para plasticos o una capa fina de resina/barniz compatible. Si la pieza esta pegajosa, primero resolver curado; no pulir resina blanda.",
  },
  {
    title: "Flores e inclusiones",
    keywords: ["flor", "flores", "encapsulado", "inclusion", "hojas", "foto"],
    body:
      "Para encapsular flores o papeles deben estar completamente secos y sellados si son porosos. Las flores frescas liberan humedad y pueden manchar o arruinar la pieza. Trabajar por capas ayuda a controlar flotacion y burbujas.",
  },
  {
    title: "Emprendimiento artesanal",
    keywords: ["emprender", "vender", "precio", "costear", "negocio", "ganancia", "feria"],
    body:
      "Para vender artesania calcula materiales, merma, empaque, comision, delivery y tiempo de trabajo. Un precio sano no solo cubre material: tambien paga mano de obra y ganancia. Conviene iniciar con productos repetibles: llaveros, aretes, dijes, lapiceros, detalles personalizados y kits de regalo.",
  },
  {
    title: "Velas y jabones artesanales",
    keywords: ["vela", "velas", "jabon", "jabones", "aroma", "molde"],
    body:
      "En velas y jabones artesanales importan temperatura, fragancia, colorante compatible y molde adecuado. No mezclar reglas de resina con velas o jabones: cada material tiene temperaturas y seguridad distintas. Para vender, cuidar etiquetado, aroma estable y presentacion.",
  },
  {
    title: "Bisuteria artesanal",
    keywords: ["bisuteria", "arete", "aretes", "collar", "pulsera", "dije", "joyeria"],
    body:
      "En bisuteria artesanal cuida peso, bordes suaves, herrajes de buena calidad y acabado uniforme. Para resina, piezas pequenas con buen pulido y combinaciones de color suelen vender mejor. Probar resistencia del aro o gancho antes de entregar.",
  },
  {
    title: "Seguridad",
    keywords: ["seguridad", "guantes", "mascarilla", "toxico", "ventilacion", "olor"],
    body:
      "Trabajar con guantes de nitrilo, ventilacion y proteccion ocular. Para resina epoxica, una mascarilla con filtro para vapores organicos es mejor que una quirurgica. No botar resina liquida al desague. Mantener materiales lejos de ninos y mascotas.",
  },
  {
    title: "Compras Rossy Resina",
    keywords: ["rossy", "comprar", "compra", "pedido", "envio", "pago", "yape", "shalom", "olva"],
    body:
      "Rossy Resina vende materiales para resina y artesania en Peru. Los pagos se coordinan por Yape o transferencia bancaria. Los envios pueden coordinarse por Shalom u Olva Courier. Para una compra exacta, conviene revisar producto, stock y ciudad de envio.",
  },
];

const scoreChunk = (chunk: KnowledgeChunk, text: string) => {
  let score = 0;
  for (const keyword of chunk.keywords) {
    if (text.includes(normalize(keyword))) score += 3;
  }
  for (const word of text.split(/\s+/).filter((w) => w.length > 4)) {
    if (normalize(chunk.body).includes(word)) score += 1;
  }
  return score;
};

const getStaticKnowledge = (message: string) => {
  const text = normalize(message);
  return KNOWLEDGE.map((chunk) => ({ chunk, score: scoreChunk(chunk, text) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => `### ${item.chunk.title}\n${item.chunk.body}`)
    .join("\n\n");
};

const queryWords = (message: string) =>
  normalize(message)
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 4)
    .slice(0, 8);

const getProductContext = async (message: string) => {
  const words = queryWords(message);
  if (words.length === 0) return "";

  try {
    const db = prisma as any;
    const products = await db.product.findMany({
      where: {
        OR: words.flatMap((word) => [
          { title: { contains: word } },
          { description: { contains: word } },
          { category: { contains: word } },
          { brand: { contains: word } },
        ]),
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: {
        title: true,
        category: true,
        brand: true,
        price: true,
        stock: true,
        description: true,
      },
    });

    if (!products?.length) return "";

    return products
      .map((p: any) => {
        const stock = Number(p.stock || 0);
        return `- ${sanitize(p.title, 90)} | Categoria: ${sanitize(p.category, 60)} | Precio: S/ ${Number(p.price || 0).toFixed(2)} | Stock: ${stock > 0 ? stock : "consultar"} | ${sanitize(p.description, 140)}`;
      })
      .join("\n");
  } catch (error) {
    console.warn("resiny.knowledge.products_failed", String((error as any)?.message || error));
    return "";
  }
};

const getCourseContext = async (message: string) => {
  const text = normalize(message);
  if (!/curso|taller|capacitacion|clase|aprender|ensenar|enseñar/.test(text)) return "";

  try {
    const db = prisma as any;
    const courses = await db.curso.findMany({
      orderBy: { createdAt: "desc" },
      take: 4,
      select: {
        nombre: true,
        nivel: true,
        modalidad: true,
        ciudad: true,
        precio: true,
        descripcion: true,
      },
    });

    if (!courses?.length) return "";

    return courses
      .map((c: any) => {
        return `- ${sanitize(c.nombre, 90)} | Nivel: ${sanitize(c.nivel, 30)} | Modalidad: ${sanitize(c.modalidad, 40)} | Ciudad: ${sanitize(c.ciudad, 40) || "consultar"} | Precio: S/ ${Number(c.precio || 0).toFixed(2)} | ${sanitize(c.descripcion, 140)}`;
      })
      .join("\n");
  } catch (error) {
    console.warn("resiny.knowledge.courses_failed", String((error as any)?.message || error));
    return "";
  }
};

const getBlogContext = async (message: string) => {
  const words = queryWords(message);
  if (words.length === 0) return "";

  try {
    const db = prisma as any;
    const posts = await db.blogPost.findMany({
      where: {
        OR: words.flatMap((word) => [
          { title: { contains: word } },
          { excerpt: { contains: word } },
        ]),
      },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: {
        title: true,
        slug: true,
        excerpt: true,
      },
    });

    if (!posts?.length) return "";

    return posts
      .map((p: any) => `- ${sanitize(p.title, 100)} (/blog/${sanitize(p.slug, 80)}): ${sanitize(p.excerpt, 180)}`)
      .join("\n");
  } catch (error) {
    console.warn("resiny.knowledge.blog_failed", String((error as any)?.message || error));
    return "";
  }
};

export async function getResinyKnowledgeContext(message: string) {
  const [staticKnowledge, productContext, courseContext, blogContext] = await Promise.all([
    Promise.resolve(getStaticKnowledge(message)),
    getProductContext(message),
    getCourseContext(message),
    getBlogContext(message),
  ]);

  const sections = [
    staticKnowledge ? `GUIAS INTERNAS DE ARTESANIA Y RESINA:\n${staticKnowledge}` : "",
    productContext ? `PRODUCTOS REALES DE ROSSY RESINA RELACIONADOS:\n${productContext}` : "",
    courseContext ? `CURSOS/TALLERES REALES RELACIONADOS:\n${courseContext}` : "",
    blogContext ? `CONTENIDO PROPIO RELACIONADO:\n${blogContext}` : "",
  ].filter(Boolean);

  if (sections.length === 0) return "";

  return `CONOCIMIENTO PROPIO DE RESINY:
${sections.join("\n\n")}

Instrucciones:
- Usa primero este conocimiento propio antes de responder.
- Si mencionas productos, precios o stock, aclara con naturalidad que puede confirmarse antes de comprar.
- Si no hay producto exacto, recomienda por categoria o pregunta que pieza quiere hacer.
- Mantente en artesania general, artesania resinera, compras, cursos o emprendimiento artesanal.`;
}
