import { Reveal } from './Reveal';

export default function ProjectPlanning() {
  return (
    <section className="py-24 bg-neutral-50/50 border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: real screenshot */}
          <Reveal className="order-2 lg:order-1">
            <div className="rounded-xl border border-neutral-200 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)] bg-white">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50/80">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <div className="flex-1 mx-4">
                  <div className="bg-white border border-neutral-200 rounded-md px-3 py-1 text-[11px] text-neutral-400 text-center max-w-xs mx-auto">
                    app.buildflow.io/projects
                  </div>
                </div>
              </div>
              <img
                src="/images/trusted-by/image.png"
                alt="BuildFlow project planning"
                className="w-full h-auto block"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Reveal>

          {/* Right: copy */}
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">Project planning</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
              Plan with clarity.
              <br />
              Ship with confidence.
            </h2>
            <p className="mt-5 text-base text-neutral-500 leading-relaxed max-w-md">
              Visual roadmaps, cycles, and modules let you map work across
              teams and timeframes. Dependencies are tracked automatically,
              so nothing slips through the cracks.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                'Drag-and-drop roadmap with dependency tracking',
                'Cycles and sprints with automatic capacity planning',
                'Modules for grouping related work across projects',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-900 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
