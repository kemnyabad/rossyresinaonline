import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { requireAdminPage } from "@/lib/adminAuth";
import {
  AcademicCapIcon,
  ArrowPathIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  KeyIcon,
  TrashIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "CUSTOMER";
  createdAt: string;
  studentProfile?: {
    id: string;
    handle: string;
    status: string;
  } | null;
}

interface CreatedCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRow["role"];
  studentProfile?: UserRow["studentProfile"];
}

const roleLabel: Record<UserRow["role"], string> = {
  CUSTOMER: "Alumno",
  EDITOR: "Editor",
  ADMIN: "Admin",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRow["role"]>("CUSTOMER");
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedCredentials | null>(null);

  const load = async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await res.json().catch(() => []);
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) =>
      [user.name, user.email, user.role, user.studentProfile?.handle || ""].join(" ").toLowerCase().includes(q)
    );
  }, [query, users]);

  const create = async () => {
    setError(null);
    setNotice(null);
    setCreated(null);
    setCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || "No se pudo crear el usuario.");
        return;
      }
      setCreated({
        name: data.name,
        email: data.email,
        password,
        role: data.role,
        studentProfile: data.studentProfile || null,
      });
      setName("");
      setEmail("");
      setPassword("");
      setRole("CUSTOMER");
      setNotice("Usuario creado correctamente.");
      await load();
    } finally {
      setCreating(false);
    }
  };

  const updateRole = async (id: string, nextRole: UserRow["role"]) => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, role: nextRole }),
    });
    await load();
  };

  const remove = async (id: string) => {
    const ok = window.confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.");
    if (!ok) return;
    await fetch(`/api/admin/users?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    await load();
  };

  const copyCredentials = async () => {
    if (!created) return;
    const text = [
      "Credenciales Escuela Rossy Resina",
      `Alumno: ${created.name}`,
      `Usuario: ${created.email}`,
      `Contraseña: ${created.password}`,
      `Acceso: ${window.location.origin}/escuela`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setNotice("Credenciales copiadas.");
  };

  return (
    <div className="mx-auto max-w-screen-2xl">
      <Head>
        <title>Admin - Alumnos y usuarios</title>
      </Head>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amazon_blue">Escuela y cuentas</p>
          <h1 className="text-2xl font-black text-gray-950">Alumnos y usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">Crea credenciales para alumnos y administra accesos.</p>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[420px_minmax(0,1fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-amazon_blue">
              <UserPlusIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-black text-gray-950">Crear acceso</h2>
              <p className="text-sm text-gray-500">Para alumnos usa el rol Alumno.</p>
            </div>
          </div>

          <div className="grid gap-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del alumno" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amazon_blue" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo / usuario" type="email" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amazon_blue" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña temporal" type="text" className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-amazon_blue" />
            <select value={role} onChange={(e) => setRole(e.target.value as UserRow["role"])} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-amazon_blue">
              <option value="CUSTOMER">Alumno</option>
              <option value="EDITOR">Editor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
          {notice && <div className="mt-3 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</div>}

          <button
            onClick={create}
            disabled={creating}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amazon_blue px-4 py-3 text-sm font-black text-white hover:brightness-95 disabled:opacity-60"
          >
            <KeyIcon className="h-5 w-5" />
            {creating ? "Creando..." : "Crear usuario y perfil"}
          </button>

          {created && (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-black text-emerald-900">Credenciales listas</p>
              <div className="mt-3 space-y-1 text-sm text-emerald-950">
                <p><strong>Alumno:</strong> {created.name}</p>
                <p><strong>Usuario:</strong> {created.email}</p>
                <p><strong>Contraseña:</strong> {created.password}</p>
                <p><strong>Acceso:</strong> /escuela</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={copyCredentials} className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-black text-white">
                  <ClipboardDocumentIcon className="h-4 w-4" />
                  Copiar datos
                </button>
                {created.studentProfile?.id && (
                  <Link href={`/suscriptores/${created.studentProfile.id}`} className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-black text-emerald-800">
                    <EyeIcon className="h-4 w-4" />
                    Ver perfil
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-black text-gray-950">Lista de accesos</h2>
                <p className="text-sm text-gray-500">{users.length} usuario(s) registrados</p>
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar alumno, correo o código..."
                className="h-10 rounded-xl border border-gray-200 px-4 text-sm outline-none focus:border-amazon_blue md:w-80"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-gray-500">Cargando usuarios...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-black uppercase text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Usuario</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3">Perfil estudiante</th>
                    <th className="px-4 py-3">Creado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/70">
                      <td className="px-4 py-3">
                        <div className="font-black text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <select value={user.role} onChange={(e) => updateRole(user.id, e.target.value as UserRow["role"])} className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-semibold">
                          <option value="CUSTOMER">Alumno</option>
                          <option value="EDITOR">Editor</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        {user.studentProfile ? (
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-amazon_blue">
                              <AcademicCapIcon className="h-4 w-4" />
                              {user.studentProfile.handle}
                            </span>
                            <div className="mt-2">
                              <Link href={`/suscriptores/${user.studentProfile.id}`} className="text-xs font-bold text-amazon_blue hover:underline">
                                Abrir portafolio
                              </Link>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">Sin perfil de alumno</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("es-PE")}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => remove(user.id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">
                          <TrashIcon className="h-4 w-4" />
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && <div className="p-8 text-center text-sm text-gray-400">No hay resultados.</div>}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const redirect = requireAdminPage(ctx);
  if (redirect) return redirect;
  return { props: {} };
};
