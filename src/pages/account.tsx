import { useSelector } from "react-redux";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { StateProps } from "../../type";
import { useDispatch } from "react-redux";
import { removeUser } from "@/store/nextSlice";

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
    <div className="max-w-screen-2xl mx-auto px-4 py-6 md:py-10">
      <div className="text-sm text-gray-500 mb-4">Inicio / Cuenta</div>
      <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-6">
        <aside className="bg-white border border-gray-200 rounded-xl p-4 h-fit">
          <h2 className="text-lg font-semibold mb-3">Cuenta</h2>
          <nav className="flex flex-col gap-2 text-sm text-gray-700">
            <span className="px-2 py-1 rounded bg-gray-50 font-semibold">General</span>
            <Link href="/track-orders" className="px-2 py-1 rounded hover:bg-gray-50">Pedidos</Link>
            <span className="px-2 py-1 rounded hover:bg-gray-50">Pago</span>
            <span className="px-2 py-1 rounded hover:bg-gray-50">Reembolsos y devoluciones</span>
            <span className="px-2 py-1 rounded hover:bg-gray-50">Valoraciones</span>
            <span className="px-2 py-1 rounded hover:bg-gray-50">Ajustes</span>
            <Link href="/shipping-address" className="px-2 py-1 rounded hover:bg-gray-50">Dirección de envío</Link>
            <Link href="/messages" className="px-2 py-1 rounded hover:bg-gray-50">Centro de mensajes</Link>
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-4">
              {avatar ? (
                <Image src={avatar} alt="Avatar" width={64} height={64} className="rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-semibold">
                  {String(name).slice(0, 1)}
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Bienvenido</p>
                <h1 className="text-xl font-semibold text-gray-900">{name}</h1>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="border border-gray-200 rounded-lg p-4 text-center">Lista de deseos</div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">Visitas</div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">Cupones</div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">Créditos</div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm text-amazon_blue hover:underline"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pedidos</h2>
              <Link href="/track-orders" className="text-sm text-amazon_blue hover:underline">
                Ver todo
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="border border-gray-200 rounded-lg p-4 text-center">Pendientes de pago</div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">Pendientes de envío</div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">Enviados</div>
              <div className="border border-gray-200 rounded-lg p-4 text-center">Pendientes</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
