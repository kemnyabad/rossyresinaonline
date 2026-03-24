import Link from "next/link";
import { FaFacebook, FaInstagram, FaWhatsapp, FaTiktok } from "react-icons/fa";
import { FormEvent, useState } from "react";

const Footer = () => {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.trim()) {
      setFeedback("Ingresa un correo valido.");
      return;
    }

    try {
      setSending(true);
      setFeedback("");
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback(data?.error || "No se pudo completar la suscripción.");
        return;
      }
      setFeedback(data?.message || "Suscripción completada.");
      setEmail("");
    } catch {
      setFeedback("Error de conexion. Intenta nuevamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <footer className="w-full border-t border-white/10 bg-amazon_blue text-white">
      <div className="mx-auto max-w-screen-2xl px-4 py-10 md:px-6 md:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-[1.2fr_.8fr_.8fr_1.2fr]">
          <section className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold leading-tight">Rossy Resina</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-gray-200">
                Insumos y kits para resina epoxi, pigmentos, moldes y talleres para emprendedores en Perú.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                aria-label="Facebook"
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
              >
                <FaFacebook />
              </a>
              <a
                aria-label="Instagram"
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
              >
                <FaInstagram />
              </a>
              <a
                aria-label="WhatsApp"
                href="https://wa.me/900000000"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
              >
                <FaWhatsapp />
              </a>
              <a
                aria-label="TikTok"
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 transition hover:bg-white/20"
              >
                <FaTiktok />
              </a>
            </div>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Ayuda</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-200">
              <li>
                <Link className="transition hover:text-white" href="/faq">
                  Preguntas frecuentes
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/contact">
                  Contacto
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/checkout">
                  Checkout
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/cart">
                  Carrito
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Categorías</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-200">
              <li>
                <Link className="transition hover:text-white" href="/categoria/resina">
                  Resina
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/categoria/moldes-de-silicona">
                  Moldes de silicona
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/categoria/pigmentos">
                  Pigmentos
                </Link>
              </li>
              <li>
                <Link className="transition hover:text-white" href="/categoria/accesorios">
                  Accesorios
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h4 className="text-sm font-semibold uppercase tracking-wide text-white">Suscríbete</h4>
            <p className="mt-2 text-sm leading-6 text-gray-200">
              Recibe novedades, lanzamientos y promociones por correo.
            </p>

            <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={onSubmit}>
              <input
                type="email"
                placeholder="Tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 w-full rounded-lg border border-white/20 bg-white px-3 text-sm text-black placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={sending}
                className="h-10 rounded-lg bg-amazon_yellow px-4 text-sm font-semibold text-black transition hover:brightness-95 disabled:opacity-60"
              >
                {sending ? "Enviando..." : "Enviar"}
              </button>
            </form>

            {feedback ? <p className="mt-2 text-xs text-gray-100">{feedback}</p> : null}
          </section>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-screen-2xl flex-col items-center justify-between gap-2 px-4 py-4 text-sm text-gray-200 md:flex-row md:px-6">
          <p className="text-center md:text-left">
            Todos los derechos reservados Rossy Resina Perú {year}
          </p>
          <div className="flex items-center gap-4">
            <Link className="transition hover:text-white" href="/about-us">
              Sobre nosotros
            </Link>
            <Link className="transition hover:text-white" href="/faq">
              Ayuda
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
