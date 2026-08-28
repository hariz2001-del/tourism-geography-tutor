import type { UnitTable } from "@/lib/course-brain/unit-tables";

/**
 * A table the deck pasted in as a screenshot, rebuilt as a table.
 *
 * Wide content scrolls inside its own container rather than pushing the page sideways, and
 * the ranked column is a row header so a screen reader announces which row it is reading.
 */
export default function UnitTableFigure({ table, caption }: { table: UnitTable; caption: string }) {
  const [first, ...rest] = table.columns;

  return (
    <figure className="mb-3 overflow-hidden rounded-card border border-graticule bg-surface">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[26rem] border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th
                  className={`border-b border-graticule bg-chart px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-ink-muted ${
                    column.numeric ? "text-right" : ""
                  }`}
                  key={column.key}
                  scope="col"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr className="align-top even:bg-chart/40" key={Object.values(row).join("|")}>
                <th
                  className={`border-b border-graticule px-3 py-2 text-[0.9375rem] font-semibold text-ink-strong ${
                    first.numeric ? "text-right font-mono text-[0.8125rem] font-normal text-ink-muted" : ""
                  }`}
                  scope="row"
                >
                  {row[first.key]}
                </th>
                {rest.map((column) => (
                  <td
                    className={`border-b border-graticule px-3 py-2 text-[0.9375rem]/[1.45] text-ink ${
                      column.numeric ? "whitespace-nowrap text-right font-mono text-[0.8125rem]" : ""
                    }`}
                    key={column.key}
                  >
                    {row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption className="space-y-0.5 border-t border-graticule bg-chart px-3 py-1.5 font-mono text-[0.75rem]/[1.45] text-ink-muted">
        <span className="block">{caption}</span>
        {table.note ? <span className="block text-[0.6875rem]">{table.note}</span> : null}
        {table.source ? (
          <span className="block text-[0.6875rem]">
            The slide shows this as a screenshot of{" "}
            <a
              className="underline decoration-graticule underline-offset-2 hover:text-ink"
              href={table.source.url}
              rel="noreferrer"
              target="_blank"
            >
              Wikipedia: {table.source.label}
            </a>
            . Figures are as the slide captured them; the article has changed since.
          </span>
        ) : (
          <span className="block text-[0.6875rem]">Rebuilt from the slide&apos;s own table.</span>
        )}
      </figcaption>
    </figure>
  );
}
