import ContentPage from "@/components/site/ContentPage";

interface PolicyProps {
  title: string;
  crumb: string;
  intro?: string;
  sections: { h: string; body: string | string[] }[];
}

export default function PolicyPage({ title, crumb, intro, sections }: PolicyProps) {
  return (
    <ContentPage title={title} subtitle={intro} crumbs={[{ label: crumb }]} narrow>
      <article className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="text-lg font-semibold text-stone-900">{s.h}</h2>
            {Array.isArray(s.body) ? (
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone-600">
                {s.body.map((b, k) => <li key={k} className="flex gap-2"><span className="text-amber-700">•</span><span>{b}</span></li>)}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-stone-600">{s.body}</p>
            )}
          </section>
        ))}
        <p className="border-t border-stone-200 pt-4 text-xs text-stone-400">Cập nhật lần cuối: 21/05/2026</p>
      </article>
    </ContentPage>
  );
}
