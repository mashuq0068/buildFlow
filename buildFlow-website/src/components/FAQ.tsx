import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Reveal } from './Reveal';

const faqs = [
  {
    q: 'How is BuildFlow different from Jira or Linear?',
    a: 'BuildFlow is AI-native — AI is part of every workflow, not a separate feature. It matches Linear\'s speed and focus while adding enterprise features like SSO, SCIM, and audit logs that growing organizations need.',
  },
  {
    q: 'Can I migrate from another tool?',
    a: 'Yes. We support one-click import from Jira, Linear, GitHub Projects, and Asana. Your issues, labels, and project structure are preserved. Most migrations complete in under an hour.',
  },
  {
    q: 'Is my data secure?',
    a: 'BuildFlow is SOC 2 Type II certified. Data is encrypted at rest with AES-256 and in transit with TLS 1.3. We offer SSO, SCIM, and audit logs on Enterprise plans. We never train AI models on your private data.',
  },
  {
    q: 'How does the AI work?',
    a: 'BuildFlow AI reads your project context — issues, comments, cycles, and history — to triage incoming work, suggest estimates, draft summaries, and flag risks. You review and approve every AI action. Nothing happens automatically without your consent.',
  },
  {
    q: 'Do you offer a self-hosted version?',
    a: 'Not currently. BuildFlow is a fully managed cloud platform. We handle infrastructure, updates, and backups so your team can focus on shipping. Enterprise customers can request data residency in specific regions.',
  },
  {
    q: 'What happens when I hit my plan limits?',
    a: 'We\'ll notify you before you reach any limits. You can upgrade at any time, and we\'ll prorate the difference. We never cut off access to your data — you can always export everything.',
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 scroll-mt-20">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal className="text-center mb-12">
          <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Frequently asked questions.
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="border border-neutral-200 rounded-xl overflow-hidden bg-white"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-neutral-50 transition-colors"
              >
                <span className="text-sm font-medium text-neutral-900">{faq.q}</span>
                <Plus
                  className={`w-4 h-4 text-neutral-400 flex-shrink-0 transition-transform duration-300 ${
                    open === i ? 'rotate-45' : ''
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ${
                  open === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-4 text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
