import { motion, type Variants } from 'framer-motion';
import { Layout, Zap, KanbanSquare, Users, GitBranch, ShieldCheck } from 'lucide-react';
import { EASE_OUT } from '@/lib/motion';

const features = [
  { icon: Layout, title: 'Unified workspace', desc: 'Issues, cycles, modules, and projects in one connected space.' },
  { icon: Zap, title: 'AI workflows', desc: 'Auto-triage, smart summaries, and predictive estimates.' },
  { icon: KanbanSquare, title: 'Flexible views', desc: 'List, Kanban, calendar, and Gantt — switch without losing context.' },
  { icon: Users, title: 'Team collaboration', desc: 'Comments, mentions, and real-time presence on every issue.' },
  { icon: GitBranch, title: 'Integrations', desc: 'GitHub, GitLab, Slack, and Figma — wired in, not bolted on.' },
  { icon: ShieldCheck, title: 'Enterprise security', desc: 'SSO, SCIM, audit logs, and SOC 2 Type II compliance.' },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

/** Decorative circuit-style connector diagram behind the grid — purely atmospheric,
 * not wired to literal card positions (the grid reflows across breakpoints). */
function ConnectorDiagram() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full z-0 opacity-[0.35]"
      viewBox="0 0 1200 600"
      preserveAspectRatio="none"
      fill="none"
    >
      <defs>
        <linearGradient id="wire-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#171717" />
          <stop offset="50%" stopColor="#525252" />
          <stop offset="100%" stopColor="#a3a3a3" />
        </linearGradient>
      </defs>

      <path
        d="M40 90 C 220 90, 260 220, 420 220 S 620 90, 780 90 S 1000 260, 1160 260"
        stroke="url(#wire-gradient)"
        strokeWidth="1.5"
        strokeDasharray="6 10"
        className="animate-dash-flow"
      />
      <path
        d="M60 320 C 240 320, 300 420, 460 420 S 700 300, 860 320 S 1020 460, 1150 460"
        stroke="url(#wire-gradient)"
        strokeWidth="1.5"
        strokeDasharray="4 12"
        className="animate-dash-flow"
        style={{ animationDelay: '-2s', animationDirection: 'reverse' }}
      />
      <path
        d="M100 540 C 260 480, 340 560, 500 540 S 760 480, 900 540 S 1080 500, 1180 540"
        stroke="url(#wire-gradient)"
        strokeWidth="1.5"
        strokeDasharray="5 9"
        className="animate-dash-flow"
        style={{ animationDelay: '-4s' }}
      />

      {[
        [420, 220],
        [780, 90],
        [860, 320],
        [500, 540],
        [1150, 460],
      ].map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r="4"
          fill="url(#wire-gradient)"
          className="animate-glow-pulse"
          style={{ animationDelay: `${i * 0.6}s` }}
        />
      ))}
    </svg>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-24 bg-neutral-50/50 border-y border-neutral-100 overflow-hidden scroll-mt-20">
      <ConnectorDiagram />

      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-14"
        >
          <p className="text-xs font-medium text-neutral-400 uppercase mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Everything your team needs.
            <br />
            <span className="text-neutral-400">Nothing it doesn't.</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={card}
                whileHover={{ y: -4 }}
                className="group p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-4 group-hover:bg-neutral-900 transition-all duration-300">
                  <Icon className="w-5 h-5 text-neutral-700 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
