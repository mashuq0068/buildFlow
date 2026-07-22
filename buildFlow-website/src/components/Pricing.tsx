import { useState } from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal, RevealGroup, RevealItem } from './Reveal';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'For small teams getting started.',
    features: ['Up to 3 members', '2 projects', 'Basic views', 'Community support'],
    cta: 'Start for free',
    highlighted: false,
  },
  {
    name: 'Team',
    price: '$12',
    period: 'per user / month',
    desc: 'For growing teams that need more.',
    features: ['Unlimited members', 'Unlimited projects', 'All views & layouts', 'AI workflows', 'Integrations', 'Priority support'],
    cta: 'Start 14-day trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    desc: 'For organizations at scale.',
    features: ['Everything in Team', 'SSO & SAML', 'SCIM provisioning', 'Audit logs', 'Dedicated CSM', '99.9% SLA'],
    cta: 'Contact sales',
    highlighted: false,
  },
];

export default function Pricing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');

  return (
    <section id="pricing" className="py-24 bg-neutral-50/50 border-y border-neutral-100 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-base text-neutral-500">
            Start free. Upgrade when you need more. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 inline-flex items-center gap-1 p-1 bg-white border border-neutral-200 rounded-full">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${billing === 'monthly' ? 'bg-neutral-900 text-white' : 'text-neutral-500'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${billing === 'yearly' ? 'bg-neutral-900 text-white' : 'text-neutral-500'}`}
            >
              Yearly
              <span className="ml-1.5 text-[10px] text-emerald-600">Save 20%</span>
            </button>
          </div>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <RevealItem key={plan.name}>
              <motion.div
                whileHover={{ y: -4 }}
                className={`relative p-7 rounded-xl border bg-white transition-all h-full ${
                  plan.highlighted
                    ? 'border-neutral-900 shadow-[0_16px_48px_rgba(0,0,0,0.14)] md:scale-105'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-neutral-900 text-white text-[10px] font-medium rounded-full">
                    Most popular
                  </span>
                )}
                <h3 className="text-base font-semibold text-neutral-900">{plan.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">{plan.desc}</p>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold tracking-tight text-neutral-900">
                    {plan.name === 'Team' && billing === 'yearly' ? '$10' : plan.price}
                  </span>
                  <span className="text-sm text-neutral-400">{plan.period}</span>
                </div>

                <a
                  href="#"
                  className={`mt-6 block text-center py-2.5 text-sm font-medium rounded-md transition-all active:scale-95 ${
                    plan.highlighted
                      ? 'bg-neutral-900 text-white hover:bg-neutral-800'
                      : 'border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {plan.cta}
                </a>

                <ul className="mt-7 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-neutral-700">
                      <Check className="w-4 h-4 text-neutral-900 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
