import { DISCLAIMER_SECTIONS, DISCLAIMER_UPDATED_AT, DISCLAIMER_VERSION } from "@/lib/disclaimer";
import { cn } from "@/lib/utils";

export function DisclaimerBody({ className }: { className?: string }) {
  return (
    <article className={cn("space-y-5 text-sm leading-relaxed", className)}>
      <p className="text-xs text-muted-foreground">
        版本 {DISCLAIMER_VERSION} · 更新日期 {DISCLAIMER_UPDATED_AT}
      </p>
      {DISCLAIMER_SECTIONS.map((section) => (
        <section key={section.id} className="space-y-2">
          <h3 className="font-semibold tracking-tight text-foreground">{section.title}</h3>
          {section.paragraphs.map((p) => (
            <p key={p} className="text-muted-foreground">
              {p}
            </p>
          ))}
          {section.bullets && (
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {section.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
