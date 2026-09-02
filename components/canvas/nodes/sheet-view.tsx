export type SheetData = { headers: string[]; row: string[] };

export function SheetView({ sheet }: { sheet: SheetData }) {
  return (
    <div className="nodrag nowheel overflow-x-auto rounded border border-neutral-200">
      <table className="w-full table-fixed border-collapse text-xs">
        <thead>
          <tr>
            {sheet.headers.map((header, i) => (
              <th
                key={i}
                className="break-words border border-neutral-300 bg-neutral-100 px-1.5 py-1 text-left font-medium text-neutral-700"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {sheet.row.map((cell, i) => (
              <td key={i} className="break-words border border-neutral-300 px-1.5 py-1 text-neutral-900">
                {cell}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
