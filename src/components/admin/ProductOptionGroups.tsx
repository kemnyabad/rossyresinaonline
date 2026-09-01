import { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { uploadImageToCloudinary } from "@/lib/cloudinaryUpload";

export type ProductOption = {
  label: string;
  image?: string;
};

export type ProductOptionGroup = {
  name: string;
  options: ProductOption[];
};

type Props = {
  groups: ProductOptionGroup[];
  onChange: (groups: ProductOptionGroup[]) => void;
};

const emptyGroup = (): ProductOptionGroup => ({ name: "", options: [] });

export default function ProductOptionGroups({ groups, onChange }: Props) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const addGroup = () => onChange([...groups, emptyGroup()]);

  const removeGroup = (groupIdx: number) =>
    onChange(groups.filter((_, i) => i !== groupIdx));

  const updateGroupName = (groupIdx: number, name: string) =>
    onChange(groups.map((g, i) => (i === groupIdx ? { ...g, name } : g)));

  const addOption = (groupIdx: number) =>
    onChange(
      groups.map((g, i) =>
        i === groupIdx ? { ...g, options: [...g.options, { label: "" }] } : g
      )
    );

  const removeOption = (groupIdx: number, optIdx: number) =>
    onChange(
      groups.map((g, i) =>
        i === groupIdx ? { ...g, options: g.options.filter((_, j) => j !== optIdx) } : g
      )
    );

  const updateOptionLabel = (groupIdx: number, optIdx: number, label: string) =>
    onChange(
      groups.map((g, i) =>
        i === groupIdx
          ? { ...g, options: g.options.map((o, j) => (j === optIdx ? { ...o, label } : o)) }
          : g
      )
    );

  const uploadOptionImage = async (groupIdx: number, optIdx: number, file: File) => {
    const key = `${groupIdx}-${optIdx}`;
    setError("");
    setUploadingKey(key);
    try {
      const url = await uploadImageToCloudinary(file, "products/options");
      onChange(
        groups.map((g, i) =>
          i === groupIdx
            ? { ...g, options: g.options.map((o, j) => (j === optIdx ? { ...o, image: url } : o)) }
            : g
        )
      );
    } catch (err: any) {
      setError(err?.message || "Error al subir la imagen");
    } finally {
      setUploadingKey(null);
    }
  };

  const removeOptionImage = (groupIdx: number, optIdx: number) =>
    onChange(
      groups.map((g, i) =>
        i === groupIdx
          ? { ...g, options: g.options.map((o, j) => (j === optIdx ? { ...o, image: undefined } : o)) }
          : g
      )
    );

  return (
    <div className="space-y-3 border-t border-gray-100 pt-4">
      <h3 className="text-sm font-semibold text-gray-700">Opciones (color, tamaño, etc.)</h3>
      <p className="text-xs text-gray-500">
        Solo informativo: no cambia el precio ni el stock. El cliente elige una opción por grupo y su
        elección se guarda en el pedido. Agrega una imagen a cada opción para mostrarla como muestra
        (ej. color); déjala vacía para mostrarla solo como texto (ej. tamaño).
      </p>

      {groups.map((group, groupIdx) => (
        <div key={groupIdx} className="rounded-lg border border-gray-200 bg-white p-3 space-y-3">
          <div className="flex items-center gap-2">
            <input
              value={group.name}
              onChange={(e) => updateGroupName(groupIdx, e.target.value)}
              className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
              placeholder="Nombre del grupo (ej: Color, Tamaño)"
            />
            <button
              type="button"
              onClick={() => removeGroup(groupIdx)}
              className="p-1.5 rounded border border-red-200 hover:bg-red-50"
            >
              <TrashIcon className="w-3.5 h-3.5 text-red-600" />
            </button>
          </div>

          <div className="grid gap-2">
            {group.options.map((opt, optIdx) => {
              const key = `${groupIdx}-${optIdx}`;
              return (
                <div key={optIdx} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2">
                  {opt.image ? (
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border border-gray-200 bg-white">
                      <Image src={opt.image} alt={opt.label || "Opción"} fill sizes="40px" className="object-cover" />
                    </div>
                  ) : null}
                  <input
                    value={opt.label}
                    onChange={(e) => updateOptionLabel(groupIdx, optIdx, e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
                    placeholder="Ej: Acero, 50pcs, 4X10mm"
                  />
                  <label className="shrink-0 cursor-pointer rounded border border-gray-300 bg-white px-2 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100">
                    {uploadingKey === key ? "Subiendo..." : opt.image ? "Cambiar imagen" : "Imagen (opcional)"}
                    <input
                      type="file"
                      accept="image/*,.heic,.heif"
                      className="hidden"
                      disabled={uploadingKey === key}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadOptionImage(groupIdx, optIdx, file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {opt.image ? (
                    <button
                      type="button"
                      onClick={() => removeOptionImage(groupIdx, optIdx)}
                      className="shrink-0 rounded border border-gray-300 px-2 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                    >
                      Quitar imagen
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => removeOption(groupIdx, optIdx)}
                    className="shrink-0 p-1.5 rounded border border-red-200 hover:bg-red-50"
                  >
                    <TrashIcon className="w-3.5 h-3.5 text-red-600" />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => addOption(groupIdx)}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Agregar opción
          </button>
        </div>
      ))}

      {error ? <p className="text-xs text-red-600">{error}</p> : null}

      <button
        type="button"
        onClick={addGroup}
        className="flex items-center gap-1 px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50"
      >
        <PlusIcon className="w-3.5 h-3.5" />
        Agregar grupo de opciones
      </button>
    </div>
  );
}
