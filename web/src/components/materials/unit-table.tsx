import Image from "next/image";
import { flagFor, splitCountries } from "@/lib/course-brain/flags";
import type { TableColumn, UnitTable } from "@/lib/course-brain/unit-tables";

/**
 * A table the deck pasted in as a screenshot, rebuilt as a table.
 *
 * Wide content scrolls inside its own container rather than pushing the page sideways, and
 * the ranked column is a row header so a screen reader announces which row it is reading.
 */
/**
 * A country cell, printed with its flag the way the Wikipedia table the slide screenshotted does.
 *
 * The cell may name more than one country ("Nepal/China"), and may name none at all — the slide
 * gives Antarctica's highest point as belonging to "no country", which renders as just that.
 * The flag is decorative: the country's name is already right beside it, so it is hidden from
 * screen readers rather than read out twice.
 */
function CountryCell({ value }: { value: string }) {
  const parts = splitCountries(value).map((country) => ({ country, flag: flagFor(country) }));
  if (!parts.some((part) => part.flag)) return <>{value}</>;

  return (
    <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {parts.map((part, index) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap" key={part.country}>
          {index > 0 ? <span className="text-ink-muted">/</span> : null}
          {part.flag ? (
            <Image
              aria-hidden="true"
              alt=""
              className="h-3 w-auto shrink-0 rounded-[1px] ring-1 ring-graticule"
              height={part.flag.height}
              src={part.flag.src}
              unoptimized
              width={part.flag.width}
            />
          ) : null}
          {part.country}
        </span>
      ))}
    </span>
  );
}

function Cell({ column, value }: { column: TableColumn; value: string }) {
  if (column.country && value) return <CountryCell value={value} />;
  return <>{value}</>;
}

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
                    <Cell column={column} value={row[column.key]} />
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
