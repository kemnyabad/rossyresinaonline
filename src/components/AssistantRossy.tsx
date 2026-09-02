import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import {
  createResinyConversationId,
  ensureResinyVisitorId,
  getResinyOwnerKey,
  rememberResinyConversation,
} from "@/lib/resinyConversationClient";

type Message = { role: "assistant" | "user"; text: string; time: string; imageUrl?: string };

const RESINY_IMAGE = "/resiny.png";

const now = () => new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const thinkingDelayFor = (text: string) => {
  const length = String(text || "").length;
  const base = 900;
  const byLength = Math.min(2600, length * 12);
  const jitter = Math.floor(Math.random() * 450);
  return base + byLength + jitter;
};

const escapeHtml = (text: string) =>
  String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const formatText = (text: string) => {
  const anchors: string[] = [];
  const withMarkdownLinks = escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g,
      (_match, label, href) => {
        const token = `@@RR_LINK_${anchors.length}@@`;
        anchors.push(
          `<a href="${href}" target="_blank" rel="noopener noreferrer" class="font-semibold underline">${label}</a>`
        );
        return token;
      }
    );

  return withMarkdownLinks
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="font-semibold underline">$1</a>'
    )
    .replace(/@@RR_LINK_(\d+)@@/g, (_match, index) => anchors[Number(index)] || "")
    .replace(/\n/g, "<br/>");
};

const isImageRequest = (text: string) =>
  /\b(imagen|dibuja|dibujar|genera|generar|crea|crear|diseña|disena|diseño|diseno|ilustra|visual|foto|boceto|idea visual|moodboard)\b/i.test(text);

const isReferenceRequest = (text: string) =>
  /\b(referencia|referencias|links?|enlaces?|ideas?|inspiracion|inspiración|pinterest|google|youtube|ver ejemplos|modelos?)\b/i.test(text);

const buildReferenceAnswer = (text: string) => {
  const clean = text
    .replace(/\b(referencia|referencias|links?|enlaces?|ideas?|inspiracion|inspiración|pinterest|google|youtube|ver ejemplos|modelos?)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const query = clean || text || "llavero baby shower resina";
  const resinQuery = `${query} resina artesanal`;
  const encoded = encodeURIComponent(resinQuery);
  const storeQuery = encodeURIComponent(query);

  return `Claro. Te dejo referencias para inspirarte en un diseño original de resina:

[Ver ideas en Pinterest](https://www.pinterest.com/search/pins/?q=${encoded})
[Ver imágenes en Google](https://www.google.com/search?tbm=isch&q=${encoded})
[Ver tutoriales en YouTube](https://www.youtube.com/results?search_query=${encoded})
[Buscar materiales en Rossy Resina](/search?q=${storeQuery})

Tip de Resiny: usa esas referencias como moodboard, no como copia exacta. Para un llavero de baby shower funcionaría bien una paleta pastel, nombre del bebé, fecha, glitter fino y molde pequeño tipo dije o llavero.`;
};

const getVisitorId = () => {
  if (typeof window === "undefined") return "";
  return ensureResinyVisitorId();
};

const getStorageKey = (email?: string | null, conversationId?: string) => {
  if (typeof window === "undefined") return "";
  const convo = String(conversationId || "default").trim() || "default";
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (normalizedEmail) return `rr_resiny_chat:user:${normalizedEmail}:conversation:${convo}`;
  return `rr_resiny_chat:visitor:${getVisitorId()}:conversation:${convo}`;
};

const readStoredMessages = (key: string): Message[] => {
  if (!key || typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((m) => m && (m.role === "assistant" || m.role === "user") && typeof m.text === "string")
      .map((m) => ({
        role: m.role,
        text: String(m.text || ""),
        time: String(m.time || ""),
        imageUrl: m.imageUrl ? String(m.imageUrl) : undefined,
      }))
      .slice(-80);
  } catch {
    return [];
  }
};

const writeStoredMessages = (key: string, messages: Message[]) => {
  if (!key || typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(messages.slice(-80)));
  } catch {
    // El chat debe seguir funcionando aunque el navegador bloquee storage.
  }
};

export default function AssistantRossy({ conversationId = "default" }: { conversationId?: string }) {
  const { data: session } = useSession();
  const userEmail = String(session?.user?.email || "").trim().toLowerCase();
  const initialConversationId = conversationId && conversationId !== "default" ? conversationId : "";
  const [activeConversationId, setActiveConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [storageKey, setStorageKey] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const justCreatedConversationRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflowY = "";
    document.documentElement.style.height = "";
    document.body.style.overflowY = "";
    document.body.style.height = "";
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!activeConversationId) {
      setStorageKey("");
      setMessages([]);
      setHistoryLoaded(true);
      return;
    }
    const key = getStorageKey(userEmail, activeConversationId);
    setStorageKey(key);
    if (justCreatedConversationRef.current) {
      justCreatedConversationRef.current = false;
    } else {
      setMessages(readStoredMessages(key));
    }
    setHistoryLoaded(true);
  }, [mounted, userEmail, activeConversationId]);

  useEffect(() => {
    if (!historyLoaded || !storageKey) return;
    writeStoredMessages(storageKey, messages);
  }, [historyLoaded, messages, storageKey]);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    };
    const first = window.setTimeout(scrollToBottom, 30);
    const second = window.setTimeout(scrollToBottom, 220);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [messages, loading]);

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;

    let conversationForRequest = activeConversationId;
    if (!conversationForRequest) {
      const ownerKey = getResinyOwnerKey(userEmail);
      conversationForRequest = createResinyConversationId();
      rememberResinyConversation(ownerKey, conversationForRequest);
      justCreatedConversationRef.current = true;
      setActiveConversationId(conversationForRequest);
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", `/resiny/${encodeURIComponent(conversationForRequest)}`);
      }
    }

    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: msg, time: now() }];
    setMessages(newMessages);
    setLoading(true);

    try {
      if (isReferenceRequest(msg) && !isImageRequest(msg)) {
        const answer = buildReferenceAnswer(msg);
        await wait(thinkingDelayFor(answer));
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: answer,
            time: now(),
          },
        ]);
        return;
      }

      if (isImageRequest(msg)) {
        const res = await fetch("/api/resiny-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: msg }),
        });
        const data = await res.json();
        if (!res.ok || !data?.imageUrl) {
          const errorText = data?.error || "No pude generar la imagen en este momento. Intenta con una descripción más específica.";
          await wait(thinkingDelayFor(errorText));
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: errorText,
              time: now(),
            },
          ]);
          return;
        }
        await wait(thinkingDelayFor("Aquí tienes una propuesta visual para tu proyecto:"));
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: "Aquí tienes una propuesta visual para tu proyecto:",
            imageUrl: data.imageUrl,
            time: now(),
          },
        ]);
        return;
      }

      const history = newMessages.map((m) => ({ role: m.role, text: m.text }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: history.slice(0, -1),
          visitorId: getVisitorId(),
          conversationId: conversationForRequest,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const errorText =
          data?.error ||
          "Resiny no pudo conectar con su proveedor de IA en este momento. Revisa la configuración del servidor.";
        await wait(thinkingDelayFor(errorText));
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: errorText,
            time: now(),
          },
        ]);
        return;
      }
      const fallbackAnswer =
        "Resiny no recibió una respuesta válida del proveedor de IA. Revisa la configuración de Groq o ChatGPT.";
      const answerText = data.answer || data.error || fallbackAnswer;
      await wait(thinkingDelayFor(answerText));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answerText, time: now() },
      ]);
    } catch {
      const errorText = "Hubo un error al conectar. Por favor intenta de nuevo.";
      await wait(thinkingDelayFor(errorText));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: errorText, time: now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isInitial = messages.length === 0 && !loading;

  if (isInitial) {
    return (
      <section className="flex min-h-[calc(100svh-76px)] items-start justify-center bg-white px-4 pb-28 pt-20 md:items-center md:py-10">
        <style jsx global>{`
          @keyframes resiny-enter {
            from { opacity: 0; transform: translateY(14px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes resiny-float-soft {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
        `}</style>
        <div className="w-full max-w-4xl md:-translate-y-8" style={{ animation: "resiny-enter 480ms ease-out both" }}>
          <div className="mx-auto mb-5 h-36 w-32 md:h-40 md:w-36">
            <div className="relative h-full w-full">
              <Image
                src={RESINY_IMAGE}
                alt="Resiny"
                fill
                className="object-contain drop-shadow-[0_14px_26px_rgba(203,41,158,0.18)]"
                style={{ animation: "resiny-float-soft 3.6s ease-in-out infinite" }}
                priority
              />
            </div>
          </div>
          <h1 className="text-center text-2xl font-medium leading-tight text-slate-950 md:text-3xl">
            ¿En qué puedo ayudarte?
          </h1>
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="mx-auto mt-8 flex h-16 max-w-3xl items-center gap-3 rounded-full border border-slate-300 bg-white px-5 shadow-[0_16px_42px_rgba(17,24,39,0.10)] transition-shadow focus-within:border-slate-900 focus-within:shadow-[0_18px_46px_rgba(0,0,0,0.14)]"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a Resiny"
              className="min-w-0 flex-1 bg-transparent text-base font-medium text-slate-950 outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a84ff] text-white transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-slate-200 disabled:text-slate-500"
              aria-label="Enviar pregunta"
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <div className="resinyPage bg-white">
      <style jsx global>{`
        @keyframes resiny-page-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes resiny-thinking-dot {
          0%, 80%, 100% { opacity: 0.35; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-3px); }
        }
        .resinyPage {
          min-height: 100svh;
          animation: resiny-page-in 360ms ease-out both;
        }
        .chatMessages {
          padding: 34px 14px 130px;
        }
        @media (min-width: 768px) {
          .chatMessages {
            padding-top: 42px;
          }
        }
      `}</style>

      <main className="chatMessages">
        <div className="mx-auto w-full max-w-4xl">
        <div className="space-y-3 pb-24 pt-2 md:space-y-4 md:pt-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[86%] items-end gap-2 md:max-w-[72%] ${m.role === "user" ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
                  {m.role === "assistant" ? (
                    <div className="relative h-14 w-14 shrink-0">
                      <Image src={RESINY_IMAGE} alt="Resiny" fill className="object-contain" />
                    </div>
                  ) : null}
                  <div className={m.role === "user" ? "flex flex-col items-end" : "flex flex-col items-start"}>
                    <div
                      className={
                        "rounded-[22px] px-4 py-2.5 text-[15px] leading-6 md:text-base md:leading-7 " +
                        (m.role === "user"
                          ? "bg-[#0a84ff] font-medium text-white"
                          : "bg-[#f0f0f2] text-slate-950")
                      }
                      dangerouslySetInnerHTML={{ __html: formatText(m.text) }}
                    />
                    {m.imageUrl ? (
                      <div className="relative mt-2 aspect-square w-full max-w-sm overflow-hidden rounded-[22px] border border-gray-200 bg-gray-50">
                        <Image src={m.imageUrl} alt="Imagen generada por Resiny" fill className="object-cover" />
                      </div>
                    ) : null}
                    {m.time ? <span className="mt-1 block px-1 text-[10px] text-gray-400">{m.time}</span> : null}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex max-w-[86%] items-end gap-2 md:max-w-[72%]">
                  <div className="relative h-14 w-14 shrink-0">
                    <Image src={RESINY_IMAGE} alt="Resiny" fill className="object-contain" />
                  </div>
                  <div className="rounded-[22px] bg-[#f0f0f2] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                      <span>Pensando</span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" style={{ animation: "resiny-thinking-dot 1.1s infinite" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" style={{ animation: "resiny-thinking-dot 1.1s infinite 140ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" style={{ animation: "resiny-thinking-dot 1.1s infinite 280ms" }} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-1" />
        </div>
        </div>
      </main>

      {mounted
        ? createPortal(
            <div
              style={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9999,
                background: "white",
                borderTop: "1px solid #d1d5db",
                padding: "12px 12px 14px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex h-12 items-center gap-2 rounded-full border border-slate-300 bg-white px-4 transition-colors focus-within:border-slate-900"
                style={{ width: "min(820px, calc(100vw - 32px))" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent text-base text-slate-950 outline-none placeholder:text-slate-400 disabled:opacity-70"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0a84ff] text-white transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:bg-slate-200 disabled:text-slate-500"
                  aria-label="Enviar pregunta"
                >
                  <PaperAirplaneIcon className="h-6 w-6" />
                </button>
              </form>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

export function ResinyInvite() {
  return (
    <section className="group overflow-hidden rounded-lg border border-pink-100 bg-white px-3.5 py-4 shadow-[0_1px_3px_rgba(17,24,39,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-pink-200 hover:shadow-[0_12px_28px_rgba(203,41,158,0.12)]">
      <style jsx global>{`
        @keyframes resiny-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes resiny-pulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.35); }
        }
      `}</style>
      <div className="grid grid-cols-[72px_minmax(0,1fr)] items-center gap-2.5">
        <div className="relative -ml-1 h-[104px] w-[82px] justify-self-start">
          <span className="absolute inset-x-3 bottom-2 h-11 rounded-full bg-amazon_blue/12 blur-xl transition-opacity duration-300 group-hover:opacity-90" />
          <Image
            src={RESINY_IMAGE}
            alt="Resiny"
            fill
            className="object-contain drop-shadow-[0_10px_18px_rgba(203,41,158,0.18)]"
            style={{ animation: "resiny-float 3.4s ease-in-out infinite" }}
          />
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="mb-2.5 flex">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-semibold leading-none text-green-700">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600" style={{ animation: "resiny-pulse 1.8s ease-in-out infinite" }} />
              En línea
            </span>
          </div>
          <h2 className="text-[17px] font-bold leading-[1.15] text-slate-950">
            Resiny
            <span className="block text-amazon_blue">te ayuda</span>
          </h2>
          <p className="mt-2 max-w-[140px] text-[12px] font-medium leading-[1.35] text-slate-500">
            Pregúntale sobre tu proyecto
          </p>
        </div>
      </div>
      <div className="mt-4">
        <Link
          href="/resiny"
          className="inline-flex h-10 w-full min-w-0 items-center justify-center gap-2 rounded-lg bg-amazon_blue px-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(203,41,158,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-amazon_light hover:shadow-[0_12px_24px_rgba(203,41,158,0.26)]"
        >
          <ChatBubbleLeftRightIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">Abrir chat</span>
        </Link>
      </div>
    </section>
  );
}
