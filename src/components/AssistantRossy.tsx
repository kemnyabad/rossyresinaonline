import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon } from "@heroicons/react/24/outline";

type Message = { role: "assistant" | "user"; text: string; time: string; imageUrl?: string };

const RESINY_IMAGE = "/resiny.png";

const now = () => new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

const formatText = (text: string) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\n/g, "<br/>");
};

const isImageRequest = (text: string) =>
  /\b(imagen|dibuja|dibujar|genera|generar|crea|crear|diseña|disena|ilustra|visual|foto|boceto|idea visual)\b/i.test(text);

const getVisitorId = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("rr_visitor_id") || "";
};

export default function AssistantRossy() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hola, soy **Resiny**. Puedo ayudarte con resina, materiales, moldes, pigmentos, técnicas, compras y capacitaciones. ¿Qué quieres crear hoy?",
      time: "",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const send = async (text: string) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setInput("");
    const newMessages = [...messages, { role: "user" as const, text: msg, time: now() }];
    setMessages(newMessages);
    setLoading(true);

    try {
      if (isImageRequest(msg)) {
        const res = await fetch("/api/resiny-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: msg }),
        });
        const data = await res.json();
        if (!res.ok || !data?.imageUrl) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              text: data?.error || "No pude generar la imagen en este momento. Intenta con una descripción más específica.",
              time: now(),
            },
          ]);
          return;
        }
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

      const history = newMessages.slice(1).map((m) => ({ role: m.role, text: m.text }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: history.slice(0, -1), visitorId: getVisitorId() }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.answer || "Lo siento, no pude procesar tu pregunta.", time: now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Hubo un error al conectar. Por favor intenta de nuevo.", time: now() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isInitial = messages.length <= 1 && !loading;

  if (isInitial) {
    return (
      <section className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-white px-4 py-10">
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
        <div className="w-full max-w-4xl -translate-y-8" style={{ animation: "resiny-enter 480ms ease-out both" }}>
          <div className="mx-auto mb-5 h-32 w-28">
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
            className="mx-auto mt-8 flex h-16 max-w-3xl items-center gap-3 rounded-full border border-gray-200 bg-white px-5 shadow-[0_16px_42px_rgba(17,24,39,0.10)] transition-shadow focus-within:border-amazon_blue/50 focus-within:shadow-[0_18px_46px_rgba(203,41,158,0.14)]"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a Resiny"
              className="min-w-0 flex-1 bg-transparent text-base text-slate-900 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center text-amazon_blue transition hover:-translate-y-0.5 hover:text-amazon_light disabled:translate-y-0 disabled:text-gray-300"
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
          min-height: 100vh;
          animation: resiny-page-in 360ms ease-out both;
        }
        .chatMessages {
          padding: 0 16px 140px;
        }
      `}</style>

      <main className="chatMessages">
        <div className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between py-5">
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-12 shrink-0 transition-transform duration-300 hover:scale-105">
              <Image src={RESINY_IMAGE} alt="Resiny" fill className="object-contain" priority />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-950">Resiny</p>
              <p className="text-xs font-medium text-green-700">En línea</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 pb-24 pt-5">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex max-w-[78%] gap-3 ${m.role === "user" ? "flex-row-reverse text-right" : "flex-row text-left"}`}>
                  {m.role === "assistant" ? (
                    <div className="relative mt-0.5 h-10 w-9 shrink-0 transition-transform duration-300">
                      <Image src={RESINY_IMAGE} alt="Resiny" fill className="object-contain" />
                    </div>
                  ) : null}
                  <div>
                    <div
                      className={`text-[15px] leading-7 ${m.role === "user" ? "font-semibold text-amazon_blue" : "text-slate-800"}`}
                      dangerouslySetInnerHTML={{ __html: formatText(m.text) }}
                    />
                    {m.imageUrl ? (
                      <div className="relative mt-4 aspect-square w-full max-w-sm overflow-hidden border border-gray-200 bg-gray-50">
                        <Image src={m.imageUrl} alt="Imagen generada por Resiny" fill className="object-cover" />
                      </div>
                    ) : null}
                    {m.time ? <span className="mt-1 block text-[10px] text-gray-400">{m.time}</span> : null}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex max-w-[78%] gap-3">
                  <div className="relative mt-0.5 h-10 w-9 shrink-0">
                    <Image src={RESINY_IMAGE} alt="Resiny" fill className="object-contain" />
                  </div>
                  <div className="pt-1.5">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                      <span>Pensando en cómo ayudarte</span>
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-amazon_blue" style={{ animation: "resiny-thinking-dot 1.1s infinite" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-amazon_blue" style={{ animation: "resiny-thinking-dot 1.1s infinite 140ms" }} />
                        <span className="h-1.5 w-1.5 rounded-full bg-amazon_blue" style={{ animation: "resiny-thinking-dot 1.1s infinite 280ms" }} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
                background: "linear-gradient(to top, white 75%, rgba(255,255,255,0))",
                padding: "20px 16px 24px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <form
                onSubmit={(e) => { e.preventDefault(); send(input); }}
                className="flex h-14 items-center gap-3 rounded-full border border-gray-200 bg-white px-5 shadow-[0_12px_34px_rgba(17,24,39,0.10)] transition-shadow focus-within:border-amazon_blue/50 focus-within:shadow-[0_14px_36px_rgba(203,41,158,0.14)]"
                style={{ width: "min(820px, calc(100vw - 32px))" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregúntale a Resiny"
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-amazon_blue transition hover:-translate-y-0.5 hover:text-amazon_light disabled:translate-y-0 disabled:text-gray-300"
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
