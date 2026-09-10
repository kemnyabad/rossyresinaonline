import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export type ProductOption = {
  label: string;
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

  return (
    <div className="space-y-3 border-t border-gray-100 pt-4">
      <h3 className="text-sm font-semibold text-gray-700">Opciones (color, tamaño, etc.)</h3>
      <p className="text-xs text-gray-500">
        Solo informativo: no cambia el precio ni el stock. El cliente elige una opción por grupo y su
        elección se guarda en el pedido.
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
            {group.options.map((opt, optIdx) => (
              <div key={optIdx} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2">
                <input
                  value={opt.label}
                  onChange={(e) => updateOptionLabel(groupIdx, optIdx, e.target.value)}
                  className="flex-1 rounded border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-slate-900"
                  placeholder="Ej: Dorado, 50pcs, 4X10mm"
                />
                <button
                  type="button"
                  onClick={() => removeOption(groupIdx, optIdx)}
                  className="shrink-0 p-1.5 rounded border border-red-200 hover:bg-red-50"
                >
                  <TrashIcon className="w-3.5 h-3.5 text-red-600" />
                </button>
              </div>
            ))}
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
