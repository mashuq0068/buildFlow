import { motion } from 'framer-motion';
import { Reveal } from './Reveal';

export default function Analytics() {
  return (
    <section className="py-24 bg-neutral-50/50 border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <Reveal>
            <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">Analytics & reporting</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
              Measure what
              <br />
              actually matters.
            </h2>
            <p className="mt-5 text-base text-neutral-500 leading-relaxed max-w-md">
              Velocity, cycle time, throughput, and workload distribution —
              presented clearly, without noise. Build dashboards your
              stakeholders actually want to read.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                'Pre-built dashboards for engineering metrics',
                'Custom reports with drag-and-drop builder',
                'Automated weekly summaries delivered to your inbox',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-900 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Right: mock */}
          <Reveal delay={0.1}>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-900">Velocity — Last 6 cycles</span>
                <div className="flex gap-1">
                  {['7d', '30d', '90d'].map((v, i) => (
                    <button key={v} className={`px-2.5 py-1 text-[11px] rounded-md ${i === 1 ? 'bg-neutral-100 text-neutral-900 font-medium' : 'text-neutral-400'}`}>{v}</button>
                  ))}
                </div>
              </div>

              <div className="p-5">
                {/* Top stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: 'Avg velocity', value: '34 pts', delta: '+12%' },
                    { label: 'Cycle time', value: '2.4d', delta: '-8%' },
                    { label: 'Throughput', value: '18/wk', delta: '+5%' },
                  ].map((s) => (
                    <div key={s.label} className="border border-neutral-100 rounded-lg p-3">
                      <p className="text-[10px] text-neutral-400 mb-1">{s.label}</p>
                      <p className="text-lg font-semibold text-neutral-900">{s.value}</p>
                      <p className="text-[10px] text-emerald-600 font-medium">{s.delta}</p>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="border border-neutral-100 rounded-lg p-4">
                  <p className="text-[11px] font-medium text-neutral-700 mb-3">Completed points per cycle</p>
                  <div className="flex items-end gap-2 h-32">
                    {[28, 22, 31, 35, 30, 38].map((v, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[9px] text-neutral-400">{v}</span>
                        <div className="w-full h-full flex items-end">
                          <motion.div
                            initial={{ height: '0%' }}
                            whileInView={{ height: `${(v / 40) * 100}%` }}
                            viewport={{ once: true, amount: 0.5 }}
                            transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                            className="w-full bg-gradient-to-t from-neutral-900 to-neutral-600 rounded-t-sm"
                          />
                        </div>
                        <span className="text-[8px] text-neutral-400">C{i + 1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
