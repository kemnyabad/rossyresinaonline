import prisma from "@/lib/prisma";

type LearningRow = {
  topic: string;
  question: string;
  answer: string;
};

const piiPatterns = [
  /\b[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g,
  /\b(?:\+?51)?\s?9\d{2}\s?\d{3}\s?\d{3}\b/g,
  /\b\d{8}\b/g,
];

const sanitize = (value: string, max = 500) => {
  let text = String(value || "").replace(/\s+/g, " ").trim();
  for (const pattern of piiPatterns) {
    text = text.replace(pattern, "[dato privado]");
  }
  return text.slice(0, max);
};

const detectTopic = (message: string) => {
  const text = message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (/burbuja|burbujas|calor|soplete|pistola/.test(text)) return "burbujas";
  if (/molde|moldes|silicona/.test(text)) return "moldes";
  if (/pigmento|mica|color|colorante|glitter|escarcha/.test(text)) return "pigmentos";
  if (/envio|envios|shalom|olva|delivery|provincia/.test(text)) return "envios";
  if (/pago|yape|transferencia|bcp|deposito/.test(text)) return "pagos";
  if (/curso|taller|capacitacion|clase|aprender/.test(text)) return "capacitaciones";
  if (/emprender|vender|precio|costear|negocio/.test(text)) return "emprendimiento";
  if (/imagen|dibuja|genera|crear|disena|visual/.test(text)) return "ideas visuales";
  if (/resina|epoxi|epoxica|uv|eco resina|curar|mezcla/.test(text)) return "resina";
  return "general";
};

const ensureTable = async () => {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS ResinyLearning (
      id VARCHAR(191) NOT NULL PRIMARY KEY,
      topic VARCHAR(80) NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      visitorId VARCHAR(191) NULL,
      createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      INDEX ResinyLearning_topic_idx (topic),
      INDEX ResinyLearning_createdAt_idx (createdAt)
    )
  `);
};

export async function recordResinyLearning(input: {
  question: string;
  answer: string;
  visitorId?: string;
}) {
  const question = sanitize(input.question, 500);
  const answer = sanitize(input.answer, 700);
  if (!question || !answer) return;

  try {
    await ensureTable();
    await prisma.$executeRawUnsafe(
      `
        INSERT INTO ResinyLearning (id, topic, question, answer, visitorId)
        VALUES (?, ?, ?, ?, ?)
      `,
      `rl_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
      detectTopic(question),
      question,
      answer,
      sanitize(input.visitorId || "", 120) || null
    );
  } catch (error) {
    console.warn("resiny.learning.record_failed", String((error as any)?.message || error));
  }
}

export async function getResinyLearningContext() {
  try {
    await ensureTable();
    const topTopics = await prisma.$queryRawUnsafe<Array<{ topic: string; total: bigint | number }>>(`
      SELECT topic, COUNT(*) AS total
      FROM ResinyLearning
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 90 DAY)
      GROUP BY topic
      ORDER BY total DESC
      LIMIT 6
    `);
    const recent = await prisma.$queryRawUnsafe<LearningRow[]>(`
      SELECT topic, question, answer
      FROM ResinyLearning
      ORDER BY createdAt DESC
      LIMIT 8
    `);

    const topics = topTopics
      .map((row) => `${row.topic} (${String(row.total)})`)
      .join(", ");
    const examples = recent
      .map((row) => `- [${row.topic}] Cliente preguntó: "${sanitize(row.question, 160)}"`)
      .join("\n");

    if (!topics && !examples) return "";

    return `
APRENDIZAJE DE RESINERAS (usa esto como contexto agregado, no como datos personales):
Temas frecuentes recientes: ${topics || "sin datos suficientes"}.
Preguntas recientes anonimizadas:
${examples || "- Sin preguntas recientes."}

Instrucción: cuando respondas, prioriza los temas y dudas frecuentes de las resineras, pide detalles si falta información y no menciones datos privados ni digas que tienes datos personales.
`;
  } catch (error) {
    console.warn("resiny.learning.context_failed", String((error as any)?.message || error));
    return "";
  }
}
