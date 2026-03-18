import { useRouter } from "next/router";
import { useState } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import type { GetServerSideProps } from "next";

export default function NewProduct() {
  const router = useRouter();
  const [form, setForm] = useState<any>({
    title: "",
    brand: "Rossy Resina",
    category: "Resinas",
    description: "",
    image: "",
    images: [],
    isNew: true,
    oldPrice: 0,
    price: 0,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError("");
    setSaveOk("");
    try {
      setSaving(true);
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(String(json?.error || "No se pudo guardar el producto."));
      }
      setSaveOk("Producto guardado correctamente.");
    } catch (err: any) {
      setSaveError(err?.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  const addImage = async () => {
    if (files.length === 0) return;
    setUploadError("");
    setUploading(true);
    const toDataUrl = (f: File) =>
      new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(f);
      });
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const dataUrl = await toDataUrl(file);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, data: dataUrl }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(String(json?.error || "No se pudo subir la imagen"));
        const url = String(json.url || "").trim();
        if (url) uploadedUrls.push(url);
      }
      if (uploadedUrls.length > 0) {
        const nextImages = Array.from(new Set([...(form.images || []), ...uploadedUrls]));
        setForm({ ...form, image: form.image || uploadedUrls[0], images: nextImages });
      }
      setFiles([]);
    } catch (err: any) {
      setUploadError(err?.message || "Error al subir imagenes");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => {
    const nextImages = (form.images || []).filter((img: string) => img !== url);
    const nextMain = form.image === url ? (nextImages[0] || "") : form.image;
    setForm({ ...form, images: nextImages, image: nextMain });
  };

  const setAsMain = (url: string) => {
    setForm({ ...form, image: url });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Nuevo producto</h1>
      <form onSubmit={submit} className="grid gap-4">
        {[
          ["title", "Titulo"],
          ["brand", "Marca"],
          ["category", "Categoria"],
          ["image", "URL de imagen principal"],
        ].map(([key, label]) => (
          <label key={key as string} className="grid gap-1">
            <span className="text-sm text-gray-700">{label}</span>
            <input
              className="rounded-md px-3 py-2"
              value={(form as any)[key as string] || ""}
              onChange={(e) => setForm({ ...form, [key as string]: e.target.value })}
            />
          </label>
        ))}
        <label className="grid gap-1">
          <span className="text-sm text-gray-700">Descripcion</span>
          <textarea
            rows={4}
            className="rounded-md px-3 py-2"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <div className="grid gap-2">
          <span className="text-sm text-gray-700">Agregar imagen</span>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
            />
            <button type="button" onClick={addImage} disabled={uploading || files.length === 0} className="px-3 py-2 rounded-md bg-brand_teal text-white disabled:opacity-50">
              {uploading ? "Subiendo..." : "Agregar"}
            </button>
          </div>
          {files.length > 0 ? <p className="text-xs text-gray-500">{files.length} archivo(s) seleccionado(s)</p> : null}
          {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
        </div>
        <div className="grid gap-2">
          <span className="text-sm text-gray-700">Galeria de imagenes</span>
          {Array.isArray(form.images) && form.images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {form.images.map((img: string) => (
                <div key={img} className="border border-gray-200 rounded-md p-2 bg-white">
                  <div className="text-xs text-gray-500 break-all mb-2">{img}</div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setAsMain(img)} className="px-2 py-1 text-xs rounded bg-amazon_blue text-white">
                      Usar principal
                    </button>
                    <button type="button" onClick={() => removeImage(img)} className="px-2 py-1 text-xs rounded bg-red-600 text-white">
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No hay imagenes adicionales.</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Precio anterior</span>
            <input
              type="number"
              className="rounded-md px-3 py-2"
              value={form.oldPrice || 0}
              onChange={(e) => setForm({ ...form, oldPrice: Number(e.target.value) })}
            />
          </label>
          <label className="grid gap-1">
            <span className="text-sm text-gray-700">Precio</span>
            <input
              type="number"
              className="rounded-md px-3 py-2"
              value={form.price || 0}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </label>
        </div>
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={!!form.isNew} onChange={(e) => setForm({ ...form, isNew: e.target.checked })} />
          <span>Nuevo</span>
        </label>
        {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
        {saveOk ? <p className="text-sm text-emerald-700">{saveOk}</p> : null}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-md bg-amazon_blue text-white hover:bg-amazon_yellow hover:text-black disabled:opacity-60">
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin")}
            className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            Volver al listado
          </button>
        </div>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const ok = session && (session.user as any)?.role === "ADMIN";
  if (!ok) {
    return { redirect: { destination: "/admin/sign-in?callbackUrl=/admin/new", permanent: false } };
  }
  return { props: {} };
};
