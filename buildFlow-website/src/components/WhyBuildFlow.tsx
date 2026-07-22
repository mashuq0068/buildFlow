import { motion } from 'framer-motion';
import { Reveal, RevealGroup, RevealItem } from './Reveal';

const reasons = [
  {
    title: 'Built for speed',
    desc: 'Every interaction is instant. No spinners, no lag, no waiting. Your team moves at the speed of thought.',
  },
  {
    title: 'AI-native, not bolted on',
    desc: 'AI is woven into every workflow — triage, estimation, status updates — not a separate chatbot.',
  },
  {
    title: 'Calm by design',
    desc: "A focused interface that reduces noise. See what matters, hide what doesn't.",
  },
  {
    title: 'Enterprise-ready',
    desc: 'SSO, SCIM, audit logs, and granular permissions. Security that scales with your organization.',
  },
];

export default function WhyBuildFlow() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="max-w-2xl mb-14">
          <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">Why BuildFlow</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Software that gets out of your way.
          </h2>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-100 rounded-xl overflow-hidden border border-neutral-100">
          {reasons.map((r) => (
            <RevealItem key={r.title}>
              <motion.div whileHover={{ backgroundColor: '#fafafa' }} className="bg-white p-8 h-full">
                <h3 className="text-base font-semibold text-neutral-900 mb-2">{r.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{r.desc}</p>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
