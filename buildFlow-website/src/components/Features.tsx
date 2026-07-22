import { motion, type Variants } from 'framer-motion';
import { Network, Sparkles, LayoutGrid, Users, Puzzle, ShieldCheck } from 'lucide-react';
import { EASE_OUT } from '@/lib/motion';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const card: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

const cardClass =
  'group relative bg-white/90 backdrop-blur-sm rounded-xl border border-neutral-200 hover:border-neutral-900 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-300';

function IconBadge({ icon: Icon }: { icon: React.ElementType }) {
  return (
    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center mb-4 group-hover:bg-neutral-900 transition-all duration-300">
      <Icon className="w-5 h-5 text-neutral-700 group-hover:text-white transition-colors duration-300" />
    </div>
  );
}

export default function Features() {
  return (
    <section id="features" className="relative py-24 bg-neutral-50/50 border-y border-neutral-100 overflow-hidden scroll-mt-20">
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mb-14"
        >
          <p className="text-xs font-medium text-neutral-400 uppercase mb-3">Features</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Engineered for
            
            <span className="text-neutral-400 ">  velocity.</span>
          </h2>
          <p className="mt-4 text-neutral-500 leading-relaxed">
            An engineered-first workspace, designed for the world's most ambitious product teams.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6"
        >
          {/* Large: Unified workspace */}
          <motion.div variants={card} whileHover={{ y: -4 }} className={`md:col-span-7 p-6 sm:p-8 flex flex-col ${cardClass}`}>
            <IconBadge icon={Network} />
            <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Unified workspace</h3>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-md">
              Issues, cycles, modules, and projects converged into a single, high-fidelity command center.
            </p>
            <div className="mt-5 h-36 rounded-lg border border-neutral-200 bg-neutral-50 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-40"
                style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)', backgroundSize: '16px 16px' }}
              />
              <div className="absolute inset-0 flex items-center justify-center gap-3 p-5">
                {[0.5, 1, 0.7, 0.85].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 max-w-16 rounded-md bg-white border border-neutral-200 transition-transform duration-500 group-hover:-translate-y-1"
                    style={{ height: `${h * 100}%`, transitionDelay: `${i * 40}ms` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Small: AI workflows */}
          <motion.div variants={card} whileHover={{ y: -4 }} className={`md:col-span-5 p-6 sm:p-8 flex flex-col justify-between ${cardClass}`}>
            <div>
              <IconBadge icon={Sparkles} />
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">AI workflows</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Auto-triage, smart summaries, and predictive estimates that anticipate your team's next move.
              </p>
            </div>
            <div className="mt-5 flex justify-center">
              <div className="w-16 h-16 border-2 border-neutral-900 rotate-45 flex items-center justify-center transition-transform duration-500 group-hover:rotate-90">
                <Sparkles className="w-5 h-5 text-neutral-900 -rotate-45 transition-transform duration-500 group-hover:-rotate-90" />
              </div>
            </div>
          </motion.div>

          {/* Medium: Flexible views */}
          <motion.div variants={card} whileHover={{ y: -4 }} className={`md:col-span-5 p-6 sm:p-8 flex flex-col ${cardClass}`}>
            <IconBadge icon={LayoutGrid} />
            <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Flexible views</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              List, Kanban, calendar, and Gantt — switch instantly without losing context.
            </p>
            <div className="mt-auto grid grid-cols-3 gap-2">
              <div className="h-16 rounded bg-neutral-900 transition-colors" />
              <div className="h-24 rounded bg-neutral-200" />
              <div className="h-12 rounded bg-neutral-300" />
            </div>
          </motion.div>

          {/* Medium: Team collaboration */}
          <motion.div variants={card} whileHover={{ y: -4 }} className={`md:col-span-4 p-6 sm:p-8 flex flex-col ${cardClass}`}>
            <IconBadge icon={Users} />
            <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Team collaboration</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              Comments, mentions, and real-time presence, synchronized on every issue.
            </p>
            <div className="mt-auto flex -space-x-3">
              {['JD', 'AM', 'PL'].map((initials, i) => (
                <div
                  key={initials}
                  className={`w-11 h-11 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold ${
                    i === 0 ? 'bg-neutral-900 text-white' : i === 1 ? 'bg-neutral-700 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}
                >
                  {initials}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Medium: Integrations */}
          <motion.div variants={card} whileHover={{ y: -4 }} className={`md:col-span-3 p-6 sm:p-8 flex flex-col ${cardClass}`}>
            <IconBadge icon={Puzzle} />
            <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Integrations</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              GitHub, GitLab, Slack, and Figma — wired in through a robust, native API.
            </p>
            <div className="mt-auto flex flex-wrap gap-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
              {['GitHub', 'GitLab', 'Slack', 'Figma'].map((name) => (
                <span key={name} className="px-2.5 py-1 rounded-md border border-neutral-200 text-[11px] font-medium text-neutral-600">
                  {name}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Wide: Enterprise security */}
          <motion.div
            variants={card}
            whileHover={{ y: -4 }}
            className={`md:col-span-12 p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 ${cardClass}`}
          >
            <div className="max-w-xl">
              <IconBadge icon={ShieldCheck} />
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Enterprise security</h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                SOC 2 Type II, GDPR, and HIPAA compliant by default. Encryption at rest and in transit, with
                customizable governance for global teams.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {['SOC2 Type II', 'AES-256', 'SSO/SAML'].map((badge) => (
                <div key={badge} className="px-4 py-2.5 border border-neutral-200 rounded-md text-[11px] font-medium uppercase tracking-wide text-neutral-600">
                  {badge}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
