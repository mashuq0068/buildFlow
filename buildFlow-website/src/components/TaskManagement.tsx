import { Reveal } from './Reveal';

export default function TaskManagement() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <Reveal>
            <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">Task & issue management</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
              Every issue, exactly
              <br />
              where it belongs.
            </h2>
            <p className="mt-5 text-base text-neutral-500 leading-relaxed max-w-md">
              A clean, fast issue tracker with custom fields, priorities,
              labels, and relations. Filter, group, and sort instantly —
              your list, your way.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                'Custom fields, labels, and relations',
                'Sub-issues and blocking dependencies',
                'Bulk actions and keyboard-first navigation',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-900 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Right: real screenshot */}
          <Reveal delay={0.1}>
            <div className="rounded-xl border border-neutral-200 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-white">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50/80">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <div className="flex-1 mx-4">
                  <div className="bg-white border border-neutral-200 rounded-md px-3 py-1 text-[11px] text-neutral-400 text-center max-w-xs mx-auto">
                    app.buildflow.io/board
                  </div>
                </div>
              </div>
              <img
                src="/images/connections/image.png"
                alt="BuildFlow issue board"
                className="w-full h-auto block"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
