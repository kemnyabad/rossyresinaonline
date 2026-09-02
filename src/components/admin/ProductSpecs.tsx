import { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export type Spec = { label: string; value: string };

type Props = {
  specs: Spec[];
  onChange: (specs: Spec[]) => void;
};

const emptySpec = (): Spec => ({ label: "", value: "" });

export default function ProductSpecs({ specs, onChange }: Props) {
  const [form, setForm] = useState<Spec>(emptySpec());

  const handleAdd = () => {
    const label = form.label.trim();
    const value = form.value.trim();
    if (!label || !value) return;
    onChange([...specs, { label, value }]);
    setForm(emptySpec());
  };

  const handleRemove = (idx: number) => {
    onChange(specs.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3 border-t border-gray-100 pt-4">
      <h3 className="text-sm font-semibold text-gray-700">Especificaciones (Material, Color, Presentación, etc.)</h3>
      <p className="text-xs text-gray-500">Se muestran como tabla de detalles en la página del producto.</p>

      {specs.length > 0 && (
        <div className="grid gap-2">
          {specs.map((s, idx) => (
            <div key={`${s.label}-${idx}`} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="text-sm">
                <span className="font-semibold text-gray-900">{s.label}:</span>
                <span className="ml-2 text-gray-600">{s.value}</span>
              </div>
              <button type="button" onClick={() => handleRemove(idx)} className="p-1.5 rounded border border-red-200 hover:bg-red-50">
                <TrashIcon className="w-3.5 h-3.5 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-3 grid gap-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500">Nombre *</label>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
              placeholder="Ej: Material"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Valor *</label>
            <input
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
              placeholder="Ej: Acero inoxidable"
            />
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!form.label.trim() || !form.value.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-semibold disabled:opacity-50"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
