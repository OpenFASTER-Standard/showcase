import { useState } from "react";

export type Sheet = { name: string; headers: string[]; rows: string[][] };

export function SheetView({ sheets }: { sheets: Sheet[] }) {
  const [active, setActive] = useState(0);
  const sheet = sheets[active];

  return (
    <div className="nodrag nowheel flex flex-col gap-2">
      <div className="flex gap-1 border-b border-neutral-200">
        {sheets.map((s, i) => (
          <button
            key={s.name}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded-t px-3 py-1.5 text-sm font-medium transition-colors ${
              i === active
                ? "border border-b-0 border-neutral-300 bg-white text-neutral-900"
                : "text-neutral-500 hover:text-neutral-700"
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded border border-neutral-200">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead>
            <tr>
              {sheet.headers.map((header, i) => (
                <th
                  key={i}
                  className="break-words border border-neutral-300 bg-neutral-100 px-2 py-1.5 text-left font-medium text-neutral-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheet.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, c) => (
                  <td key={c} className="break-words border border-neutral-300 px-2 py-1.5 text-neutral-900">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
