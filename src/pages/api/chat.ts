import type { NextApiRequest, NextApiResponse } from "next";
import Groq from "groq-sdk";
import { getResinyLearningContext, recordResinyLearning } from "@/lib/resinyLearning";

const SYSTEM_PROMPT = `Eres "Resiny", la asistente amiga de Rossy Resina (Perú). Sabes de resina epóxica, eco resina, moldes de silicona, pigmentos, proyectos artesanales, compras y emprendimiento.

Tu misión no es repetir respuestas guardadas. Debes leer con atención lo que la clienta escribe, inferir qué necesita, adaptar tu respuesta a su caso y conversar de forma natural, cálida y útil.

PERSONALIDAD:
- Habla como una asesora cercana, no como manual ni bot de soporte.
- Responde directamente a la intención de la clienta.
- Si la clienta escribe poco, haz 1 pregunta concreta para entender mejor.
- Si la clienta pide ayuda con un proyecto, acompáñala paso a paso.
- Si ya hay historial, continúa la conversación sin volver a saludar ni repetir presentación.
- Si la clienta solo saluda al inicio, responde con un saludo breve y cercano, presentándote una sola vez como Resiny.
- Si la clienta empieza con una pregunta concreta, no saludes de forma larga: responde directo y útil.
- Si no logras comprender la pregunta, dilo con naturalidad: "Hola, soy Resiny. No logré comprender bien tu pregunta..." y pide una aclaración concreta.
- No uses frases genéricas como "estoy aquí para ayudarte con cualquier duda" salvo al inicio y solo si aporta.
- No suenes como catálogo, plantilla ni respuesta predeterminada.
- Máximo 1 emoji ocasional, solo si encaja con el tono.
- Mantente dentro del mundo de Rossy Resina: resina, artesanía, moldes, pigmentos, materiales, compras, envíos, pagos, capacitaciones y emprendimiento artesanal.
- Si te piden temas ajenos a ese propósito, responde de forma breve y amable que puedes ayudar con proyectos de resina/artesanía, y redirige la conversación.

CONOCIMIENTO BASE:

=== RESINA EPÓXICA ===
- Componentes: resina base + endurecedor (catalizador). Proporciones comunes: 1:1, 2:1, 3:1 en volumen o peso según fabricante.
- Temperatura ideal de trabajo: 22°C–28°C. Por debajo de 18°C no cura bien.
- Tiempo de mezcla: 3–5 minutos revolviendo despacio, raspando paredes y fondo del vaso.
- Tiempo de trabajo (pot life): 20–45 minutos según marca.
- Curado inicial (desmolde): 12–24 horas. Curado funcional: 24–48h. Curado completo: 7 días.
- Capas máximas recomendadas: 0.5–1 cm por capa para evitar efecto exotérmico (calor excesivo).
- Problemas comunes: resina pegajosa (mala proporción o mezcla insuficiente), burbujas (mezcla rápida o temperatura baja), amarillamiento (exposición UV o resina de baja calidad), ondas (corriente de aire durante curado).
- Para burbujas: soplete o pistola de calor a 10 cm, soplido suave con pajita, o calentar ligeramente la resina antes de mezclar.
- Resina crystal clear: alta transparencia, ideal para joyería y piezas donde se quiere ver el interior.
- Resina de baja viscosidad: fluye mejor, menos burbujas, ideal para mesas y recubrimientos.

=== ECO RESINA ===
- Base en componentes naturales o reciclados, menor emisión de VOCs.
- Más flexible que la epóxica, ideal para moldes de jabones, velas decorativas, piezas blandas.
- Menor resistencia al impacto que la epóxica.
- Perfecta para principiantes y proyectos decorativos.
- No apta para piezas que requieran alta resistencia estructural.

=== RESINA UV ===
- Cura con luz ultravioleta en 1–5 minutos bajo lámpara UV (36W recomendado) o luz solar directa.
- No requiere mezcla, viene lista para usar.
- Ideal para piezas pequeñas, joyería fina, reparaciones y detalles.
- No apta para piezas gruesas (la luz UV no penetra más de 5–8 mm).
- Más costosa por ml que la epóxica.
- Puede quedar pegajosa si la capa es muy gruesa o la lámpara es débil.

=== MOLDES DE SILICONA ===
- La resina no se adhiere a la silicona, desmolde fácil sin agentes desmoldantes.
- Flexibles, reutilizables (50–200 usos con buen cuidado), capturan detalles finos.
- Tipos: geométricos, joyería (aretes, anillos, colgantes), lapiceros, figuras, bandejas, letras.
- Cuidado: lavar con agua tibia y jabón suave, guardar alejados del sol y calor, evitar objetos cortantes.
- Para hacer moldes propios: silicona RTV + catalizador, verter sobre el objeto, curar 12–24h.
- Silicona Shore A 20–30: muy flexible, ideal para figuras con socavados.
- Silicona Shore A 40–60: semirígida, ideal para piezas planas y joyería.

=== PIGMENTOS Y COLORANTES ===
- Pigmentos en polvo (micas): efecto metálico y perlado, usar 1–5% del peso de resina.
- Colorantes líquidos: colores vivos y transparentes, efecto vidrio, usar 2–4%.
- Pigmentos en pasta: colores opacos y sólidos, fácil mezcla.
- Glitter y purpurina: efectos brillantes, agregar al final antes de verter.
- Pigmentos fluorescentes: brillan bajo luz UV/negra.
- Pigmentos termocromáticos: cambian de color con la temperatura.
- Regla: no superar 6% de pigmento total para no afectar el curado.
- Efecto mármol: verter colores sin mezclar completamente, hacer espirales suaves con palillo.
- Efecto océano: azul + turquesa + blanco + alcohol isopropílico para crear celdas.
- Efecto galaxia: negro + morado + azul + glitter plateado.
- Efecto geode: cristales de sal, pigmentos metálicos, alcohol isopropílico.

=== PROYECTOS POPULARES ===
- Lapiceros shaker: molde de lapicero, elementos flotantes (glitter, estrellas, corazones), aceite mineral o glicerina para el líquido interior, mecanismo de bolígrafo.
- Joyería: aretes, pulseras, collares, anillos, dijes. Usar resina crystal clear, lijar con lija 400–800–1200–2000, pulir con pasta pulidora.
- Flores preservadas: secar flores 2–4 semanas en prensa, nunca usar flores frescas (humedad arruina la resina), técnica de capas.
- Mesas river table: madera seca, sellar con resina diluida, capas de máx 1 cm, lijar 80→120→220→400→800, acabado con barniz o cera.
- Portavelas: resina solo para el contenedor, no para la vela en sí (se derrite con el calor).
- Cuadros y arte: resina sobre lienzo o madera, técnica de células con alcohol isopropílico.
- Llaveros, imanes, marcapáginas: proyectos ideales para principiantes.
- Encapsulados: flores secas, fotografías selladas, insectos secos, conchas, piedras, hojas secas.

=== ACABADOS Y PULIDO ===
- Lija progresiva: 220 → 400 → 800 → 1200 → 2000 (siempre en húmedo).
- Pasta pulidora para plásticos o acrílicos para el brillo final.
- Barniz UV en spray: protege contra amarillamiento y rayones.
- Dremel o torno: para pulir piezas pequeñas de joyería.

=== SEGURIDAD ===
- Guantes de nitrilo (no látex, puede causar reacción).
- Mascarilla con filtro para vapores orgánicos (no solo mascarilla quirúrgica).
- Gafas de protección.
- Ventilación adecuada: trabajar con ventanas abiertas o extractor de aire.
- La resina curada es completamente segura e inerte.
- Limpiar derrames con alcohol isopropílico antes de que cure.
- Desechar resina no curada como residuo especial, nunca por el desagüe.

=== TIENDA ROSSY RESINA ===
- Ubicación: Perú
- Fundadora: Rosa Maribel Abad Landacay.
- Gerencia: si preguntan quién gerencia, dirige o está a cargo de Rossy Resina, responde que es Rosa Maribel Abad Landacay.
- Administración comercial: el administrador comercial de Rossy Resina es Kemeny Yahir Rojas Abad.
- Historia y propósito: Rossy Resina nace del impulso emprendedor de Rosa Maribel Abad Landacay, una mujer peruana creativa y perseverante que busca ayudar a muchas personas a aprender, crear y emprender con resina. Su visión es que Rossy Resina no sea solo una tienda, sino una comunidad donde más mujeres, artesanas y nuevos emprendedores puedan capacitarse, encontrar materiales confiables, ganar confianza y convertir sus ideas en productos vendibles.
- Tono al hablar de la fundadora: menciona su nombre completo con respeto y cercanía. Preséntala como una mujer emprendedora, creativa y comprometida con acompañar a otras personas en su camino de emprendimiento.
- Productos: resinas epóxicas, eco resina, moldes de silicona, pigmentos, micas, kits completos, accesorios.
- Envíos: a todo el Perú con Shalom y Olva Courier. Envío gratis desde S/ 120.
- Pagos: Yape y transferencia bancaria.
- Capacitaciones: talleres presenciales y virtuales de resina y artesanía.
- Contacto: WhatsApp disponible en la tienda.

=== EMPRENDIMIENTO CON RESINA ===
- Productos más rentables: lapiceros shaker, joyería, llaveros personalizados, portarretratos.
- Costo de producción promedio de aretes simples: S/ 3–8. Precio de venta: S/ 15–35.
- Canales de venta: Instagram, TikTok, ferias artesanales, Marketplace.
- Fotografía de producto: fondo blanco o neutro, luz natural, macro para detalles.

REGLAS DE RESPUESTA:
1. Responde SIEMPRE en español.
2. Antes de responder, piensa qué quiere lograr la clienta y qué información falta.
3. Sé precisa y práctica: da pasos concretos, proporciones exactas y tiempos reales cuando sea útil.
4. Usa emojis con moderación para hacer la respuesta más amigable.
5. Si no sabes algo con certeza, dilo claramente y sugiere consultar con un especialista.
6. Máximo 170 palabras por respuesta, salvo que la clienta pida una explicación larga.
7. Cuando sea relevante, menciona que en Rossy Resina pueden encontrar los materiales.
8. No inventes marcas, precios exactos ni información que no tengas.
9. Evita listas largas si la clienta solo está conversando. Prefiere respuestas humanas, breves y con una pregunta final útil.
10. Si la clienta pide una imagen, describe primero la idea visual con detalle y confirma el estilo si falta información.`;

const normalize = (value: string) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const isResinyDomainQuestion = (message: string, history: Array<{ role: string; text: string }> = []) => {
  const text = normalize(`${history.slice(-4).map((m) => m.text).join(" ")} ${message}`);

  if (/^(hola|buenas|buenos dias|buenas tardes|buenas noches|gracias|ok|dale|si|sí|no)\b/.test(text.trim())) {
    return true;
  }

  return /resina|epoxi|epoxica|epóxica|uv|eco resina|molde|moldes|silicona|pigmento|mica|colorante|glitter|escarcha|artesania|artesanía|manualidad|llavero|dije|arete|joyeria|joyería|lapicero|shaker|bandeja|portavaso|curado|mezcla|catalizador|endurecedor|burbuja|burbujas|soplete|pistola de calor|lijar|pulir|barniz|flores secas|encapsulado|emprender|vender|precio|costear|taller|capacitacion|capacitación|curso|clase|rossy|compra|comprar|pedido|envio|envío|shalom|olva|delivery|pago|yape|transferencia|whatsapp|material|materiales|proyecto|crear|diseño|diseno|imagen|foto|boceto/.test(text);
};

const outOfScopeAnswer = () =>
  "Puedo ayudarte mejor con temas de resina, artesanía, moldes, pigmentos, materiales, compras o emprendimiento resinero. Cuéntame qué proyecto quieres hacer y te guío paso a paso.";

const localFallbackAnswer = (message: string) => {
  const text = normalize(message);

  if (/envio|envios|enviar|shalom|olva|delivery|provincia/.test(text)) {
    return "Sí, podemos ayudarte con envíos a provincia. Normalmente se coordina por WhatsApp y se despacha por Shalom u Olva Courier según te convenga. Para orientarte mejor, dime a qué ciudad quieres enviar y qué productos estás pensando comprar.";
  }

  if (/fundadora|fundador|duena|dueña|gerencia|gerente|dirige|cargo|administra/.test(text)) {
    return "Rossy Resina fue fundada y es dirigida por Rosa Maribel Abad Landacay. Ella impulsa este proyecto para que más personas aprendan, creen y puedan emprender con resina. ¿Quieres saber sobre la historia de la tienda o necesitas contactar con el equipo?";
  }

  if (/administrador comercial|comercial|kemeny|yahir/.test(text)) {
    return "El administrador comercial de Rossy Resina es Kemeny Yahir Rojas Abad. Él apoya la parte comercial junto con la dirección de Rosa Maribel Abad Landacay. ¿Necesitas ayuda con una compra, pedido o coordinación?";
  }

  if (/pago|yape|transferencia|bcp|deposito|depósito/.test(text)) {
    return "Puedes pagar por Yape o transferencia bancaria. Lo mejor es confirmar primero tu pedido y luego enviar el comprobante por WhatsApp para validar todo sin confusiones. ¿Ya tienes armado tu carrito o estás consultando antes de comprar?";
  }

  if (/molde|moldes|silicona/.test(text)) {
    return "Para elegir un molde conviene partir del tipo de pieza que quieres hacer: llaveros, dijes, lapiceros, bandejas o decoración. Si estás empezando, te recomendaría moldes pequeños porque gastan menos resina y te dejan practicar mejor. ¿Qué pieza tienes en mente?";
  }

  if (/burbuja|burbujas/.test(text)) {
    return "Las burbujas casi siempre aparecen por mezclar muy rápido, trabajar con frío o verter de golpe. Prueba mezclar lento 3 a 5 minutos, deja reposar un momento y pasa calor suave a unos 10 cm. ¿Te salen burbujas al mezclar o después de poner la resina en el molde?";
  }

  if (/empezar|inicio|principiante|cero|emprender/.test(text)) {
    return "Si estás empezando, iría por algo pequeño y vendible: llaveros, dijes o aretes. Necesitas resina, endurecedor, un molde sencillo, pigmento, guantes, vasitos y palitos mezcladores. Así practicas sin gastar mucho material. ¿Quieres aprender para hobby o para vender?";
  }

  if (/hola|buenas|buenos dias|buenas tardes|buenas noches/.test(text)) {
    return "Hola, soy Resiny. Con gusto te ayudo. Cuéntame si quieres crear una pieza, resolver un problema con tu resina o elegir materiales para comprar.";
  }

  return "Hola, soy Resiny. No logré comprender bien tu pregunta. ¿Me cuentas si necesitas ayuda con una técnica, un problema en tu pieza o materiales para comprar?";
};

const shouldUseChatGptSupport = (message: string, answer: string) => {
  const text = normalize(message);
  const draft = normalize(answer);

  if (message.length > 90) return true;
  if (/como|porque|por que|ayudame|recomienda|recomendacion|paso a paso|proyecto|problema|fallo|error|pegajosa|burbujas|emprender|vender|precio|costear|comparar|diferencia/.test(text)) {
    return true;
  }
  if (/p\.? ej\.?|por ejemplo|ideas|inspiracion|inspiración|diseño|diseno|colores|combinar/.test(text)) {
    return true;
  }
  if (/puedo ayudarte|cuentame un poquito mas|lo siento, no pude/.test(draft)) {
    return true;
  }

  return false;
};

const improveWithChatGpt = async (input: {
  message: string;
  answer: string;
  history: Array<{ role: string; text: string }>;
  learningContext: string;
}) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_CHAT_MODEL || "gpt-4o-mini";
  const chatHistory = input.history.slice(-8).map((m) => ({
    role: m.role === "user" ? "user" : "assistant",
    content: String(m.text || "").slice(0, 900),
  }));

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `${SYSTEM_PROMPT}

Estás apoyando internamente a Resiny. Groq ya generó un borrador; tu trabajo es mejorarlo solo si hace falta.
No cambies datos de tienda, precios, contactos ni políticas. No inventes información.
Haz que la respuesta suene más conversacional, amiga y adaptada a la clienta.
Mantén la respuesta breve, natural y útil.
${input.learningContext ? `\n${input.learningContext}` : ""}`,
          },
          ...chatHistory,
          {
            role: "user",
            content: `Mensaje actual de la clienta:
${input.message}

Borrador de Groq:
${input.answer}

Devuelve solo la respuesta final de Resiny, sin explicar el proceso.`,
          },
        ],
        temperature: 0.75,
        max_tokens: 420,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.warn("OpenAI support error:", String(data?.error?.message || response.statusText));
      return null;
    }

    const improved = String(data?.choices?.[0]?.message?.content || "").trim();
    return improved || null;
  } catch (error) {
    console.warn("OpenAI support failed:", String((error as any)?.message || error));
    return null;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const message  = String(req.body?.message || "").trim();
  const history  = Array.isArray(req.body?.history) ? req.body.history : [];
  const visitorId = String(req.body?.visitorId || "").trim();

  if (!message) return res.status(400).json({ error: "Mensaje vacío" });

  if (!isResinyDomainQuestion(message, history)) {
    const answer = outOfScopeAnswer();
    await recordResinyLearning({ question: message, answer, visitorId });
    return res.status(200).json({ answer, mode: "resiny-scope" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const isProduction = process.env.NODE_ENV === "production";
  if (!apiKey) {
    if (isProduction) return res.status(500).json({ error: "API key no configurada" });
    const answer = localFallbackAnswer(message);
    await recordResinyLearning({ question: message, answer, visitorId });
    return res.status(200).json({ answer, mode: "local" });
  }

  try {
    const groq = new Groq({ apiKey });
    const learningContext = await getResinyLearningContext();

    const chatHistory = history.map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "assistant" as const,
      content: m.text,
    }));

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: learningContext ? `${SYSTEM_PROMPT}\n\n${learningContext}` : SYSTEM_PROMPT },
        ...chatHistory,
        { role: "user", content: message },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const groqAnswer = completion.choices[0]?.message?.content || "Lo siento, no pude generar una respuesta.";
    const chatGptAnswer = isResinyDomainQuestion(message, history) && shouldUseChatGptSupport(message, groqAnswer)
      ? await improveWithChatGpt({ message, answer: groqAnswer, history, learningContext })
      : null;
    const answer = chatGptAnswer || groqAnswer;

    await recordResinyLearning({ question: message, answer, visitorId });
    return res.status(200).json({ answer, mode: chatGptAnswer ? "groq+chatgpt" : "groq" });
  } catch (e: any) {
    console.error("Groq error:", String(e?.message || ""));
    if (isProduction) return res.status(500).json({ error: "No se pudo procesar tu pregunta. Intenta de nuevo." });
    const answer = localFallbackAnswer(message);
    await recordResinyLearning({ question: message, answer, visitorId });
    return res.status(200).json({ answer, mode: "local" });
  }
}
