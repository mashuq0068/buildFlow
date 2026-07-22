import { Reveal } from './Reveal';

export default function Roadmaps() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="max-w-2xl mb-14">
          <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">Roadmaps & milestones</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            See the path ahead.
          </h2>
          <p className="mt-4 text-base text-neutral-500 leading-relaxed">
            Track milestones across teams. Know what's on track, what's at risk,
            and what needs attention — all in one view.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-xl border border-neutral-200 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-white">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50/80">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <div className="flex-1 mx-4">
                <div className="bg-white border border-neutral-200 rounded-md px-3 py-1 text-[11px] text-neutral-400 text-center max-w-xs mx-auto">
                  app.buildflow.io/roadmap
                </div>
              </div>
            </div>
            <img
              src="/images/integrations/image.png"
              alt="BuildFlow roadmap view"
              className="w-full h-auto block"
              loading="lazy"
              decoding="async"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
