import { useSelector } from "react-redux";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { StateProps } from "../../type";
import { useDispatch } from "react-redux";
import { removeUser } from "@/store/nextSlice";
import {
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const { userInfo } = useSelector((state: StateProps) => state.next);
  const dispatch = useDispatch();
  const isAuthenticated = Boolean(session?.user?.email || userInfo?.email);
  const name = userInfo?.name || session?.user?.name || userInfo?.email || session?.user?.email || "Usuario";
  const avatar = userInfo?.image || session?.user?.image || "";
  const handleSignOut = () => {
    signOut();
    dispatch(removeUser());
  };

  if (status === "loading") {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-white border border-gray-200 rounded-xl p-6 text-sm text-gray-600">
          Cargando cuenta...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-screen-2xl mx-auto px-4 py-6 md:py-10">
        <div className="text-sm text-gray-500 mb-4">Inicio / Cuenta</div>
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Inicia sesión para ver tu cuenta</h1>
          <p className="mt-2 text-sm text-gray-600">
            Accede o regístrate para ver tus pedidos, dirección de envío y mensajes.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/sign-in?callbackUrl=/account" className="rounded-full bg-amazon_blue px-5 py-2 text-sm font-semibold text-white hover:brightness-95">
              Iniciar sesión
            </Link>
            <Link href="/register?callbackUrl=/account" className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
              Registrarme
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <div className="mb-4 text-sm text-gray-500">Inicio / Cuenta</div>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 p-5 md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                {avatar ? (
                  <Image src={avatar} alt="Avatar" width={64} height={64} className="rounded-full object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-semibold">
                    {String(name).slice(0, 1)}
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Bienvenida/o</p>
                  <h1 className="text-2xl font-semibold text-gray-900">{name}</h1>
                  <p className="mt-1 text-sm text-gray-500">{userInfo?.email || session?.user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 px-4 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="grid gap-0 md:grid-cols-3">
            <AccountAction
              href="/track-orders"
              icon={<ClipboardDocumentListIcon className="h-6 w-6" />}
              title="Mis pedidos"
              description="Consulta el estado de tus compras y datos de envío."
            />
            <AccountAction
              href="/shipping-address"
              icon={<HomeIcon className="h-6 w-6" />}
              title="Dirección de envío"
              description="Guarda tus datos para completar pedidos más rápido."
            />
            <AccountAction
              href="/messages"
              icon={<UserCircleIcon className="h-6 w-6" />}
              title="Centro de mensajes"
              description="Revisa comunicaciones importantes de tu cuenta."
            />
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5 md:p-7">
          <h2 className="text-lg font-semibold text-gray-900">Resumen</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Desde aquí puedes revisar tus pedidos y mantener actualizada tu dirección. Más adelante se pueden activar
            cupones, créditos, valoraciones y otras opciones cuando ya estén listas para usarse.
          </p>
          <div className="mt-5">
            <Link
              href="/productos"
              className="inline-flex h-10 items-center justify-center rounded-md bg-amazon_blue px-4 text-sm font-semibold text-white hover:brightness-95"
            >
              Seguir comprando
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function AccountAction({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[150px] flex-col justify-between border-b border-gray-100 p-5 transition-colors hover:bg-gray-50 md:border-b-0 md:border-r md:last:border-r-0"
    >
      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 text-amazon_blue">
          {icon}
        </div>
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm leading-5 text-gray-600">{description}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-amazon_blue">
        Abrir
        <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
