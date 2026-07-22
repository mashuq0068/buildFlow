import { Reveal, RevealGroup, RevealItem } from './Reveal';

const testimonials = [
  {
    quote: "BuildFlow replaced three tools for us. The speed alone won the team over — everything else was a bonus.",
    name: 'Sarah Chen',
    role: 'VP Engineering, Ramp',
    initials: 'SC',
  },
  {
    quote: "The AI triage saves my leads 4 hours a week. It quietly does the work nobody wanted to do.",
    name: 'Marcus Webb',
    role: 'Director of Platform, Loom',
    initials: 'MW',
  },
  {
    quote: "We evaluated Linear, Jira, and Plane. BuildFlow was the only one that felt built for how we actually work.",
    name: 'Priya Nair',
    role: 'Head of Product, Notion',
    initials: 'PN',
  },
  {
    quote: "Onboarding 200 engineers took a weekend. The SSO and SCIM setup was the easiest I've done.",
    name: 'James Park',
    role: 'Staff Engineer, Retool',
    initials: 'JP',
  },
  {
    quote: "Our roadmap reviews went from slide decks to a single live view. Stakeholders actually engage now.",
    name: 'Elena Rossi',
    role: 'Engineering Manager, Vercel',
    initials: 'ER',
  },
  {
    quote: "It's the first project tool where I don't feel like I'm fighting the software to get work done.",
    name: 'Tom Anderson',
    role: 'CTO, Linear',
    initials: 'TA',
  },
];

export default function Testimonials() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="max-w-2xl mb-14">
          <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">Testimonials</p>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
            Teams ship better with BuildFlow.
          </h2>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <RevealItem key={t.name}>
              <div className="p-7 bg-white rounded-xl border border-neutral-200 hover:border-neutral-300 hover:shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full">
                <blockquote className="text-sm text-neutral-700 leading-relaxed flex-1">
                  "{t.quote}"
                </blockquote>
                <div className="mt-6 flex items-center gap-3 pt-5 border-t border-neutral-100">
                  <div className="w-9 h-9 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-700">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{t.name}</p>
                    <p className="text-xs text-neutral-400">{t.role}</p>
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
