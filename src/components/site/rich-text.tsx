import { cn } from "@/lib/utils";

/** Renders the lightweight text format used for descriptions:
 *  blank-line separated paragraphs, "## " headings and "- " bullet lists. */
export function RichText({ text, className }: { text: string | null | undefined; className?: string }) {
  if (!text) return null;
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  return (
    <div className={cn("prose-dark", className)}>
      {blocks.map((b, i) => {
        const lines = b.split("\n").map((l) => l.trim()).filter(Boolean);
        if (!lines.length) return null;
        if (lines.every((l) => l.startsWith("- "))) {
          return <ul key={i}>{lines.map((l, j) => <li key={j}>{l.slice(2)}</li>)}</ul>;
        }
        if (lines.length === 1 && lines[0].startsWith("## ")) return <h3 key={i}>{lines[0].slice(3)}</h3>;
        const out: React.ReactNode[] = [];
        let buf: string[] = [];
        const flush = () => { if (buf.length) { out.push(<p key={`${i}-${out.length}`}>{buf.join(" ")}</p>); buf = []; } };
        lines.forEach((l) => {
          if (l.startsWith("## ")) { flush(); out.push(<h3 key={`${i}-${out.length}`}>{l.slice(3)}</h3>); }
          else if (l.startsWith("- ")) { flush(); out.push(<ul key={`${i}-${out.length}`}><li>{l.slice(2)}</li></ul>); }
          else buf.push(l);
        });
        flush();
        return out;
      })}
    </div>
  );
}
