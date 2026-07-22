import { ShieldCheck, Lock, KeyRound, FileCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal, RevealGroup, RevealItem } from './Reveal';

const securityFeatures = [
  { icon: KeyRound, title: 'SSO & SAML', desc: 'SAML 2.0 with Okta, Azure AD, and Google Workspace.' },
  { icon: Lock, title: 'Data encryption', desc: 'AES-256 at rest, TLS 1.3 in transit. Always.' },
  { icon: FileCheck, title: 'SOC 2 Type II', desc: 'Audited annually. Reports available on request.' },
  { icon: ShieldCheck, title: 'SCIM provisioning', desc: 'Automated user lifecycle management via SCIM 2.0.' },
];

export default function Security() {
  return (
    <section id="security" className="py-24 bg-neutral-900 text-white scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="max-w-2xl mb-14">
          <p className="text-xs font-medium tracking-widest text-neutral-500 uppercase mb-3">Enterprise security</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
            Built for the way
            <br />
            enterprises work.
          </h2>
          <p className="mt-4 text-base text-neutral-400 leading-relaxed">
            Security is not a feature we added. It's the foundation
            BuildFlow is built on. Every layer, from infrastructure to UI.
          </p>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-800 rounded-xl overflow-hidden">
          {securityFeatures.map((f) => {
            const Icon = f.icon;
            return (
              <RevealItem key={f.title}>
                <motion.div whileHover={{ backgroundColor: '#1a1a1a' }} className="bg-neutral-900 p-7 h-full">
                  <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-neutral-300" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{f.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal delay={0.15} className="mt-10 flex flex-wrap items-center gap-6 text-sm text-neutral-500">
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />SOC 2 Type II</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />GDPR Ready</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />ISO 27001</span>
          <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />HIPAA Available</span>
        </Reveal>
      </div>
    </section>
  );
}
