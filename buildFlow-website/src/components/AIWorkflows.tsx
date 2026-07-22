import { Sparkles, ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';

export default function AIWorkflows() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <Reveal>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-neutral-200 bg-white text-xs text-neutral-600 mb-5">
              <Sparkles className="w-3 h-3" />
              AI-powered
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
              Workflows that think
              <br />
              alongside your team.
            </h2>
            <p className="mt-5 text-base text-neutral-500 leading-relaxed max-w-md">
              BuildFlow AI reads your project context, triages incoming issues,
              drafts status updates, and flags risks before they become blockers.
              Your team spends less time on process and more on shipping.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Automatic issue triage and labeling',
                'Smart sprint estimates based on history',
                'Generated status summaries for stakeholders',
                'Risk detection with suggested mitigations',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-neutral-700">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-900 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            <a
              href="#"
              className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-neutral-900 hover:gap-2.5 transition-all"
            >
              Explore AI features
              <ArrowRight className="w-4 h-4" />
            </a>
          </Reveal>

          {/* Right: mock */}
          <Reveal delay={0.15}>
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-neutral-900 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-neutral-900">BuildFlow AI</span>
                <span className="ml-auto text-[10px] text-neutral-400">Thinking…</span>
              </div>

              {/* Chat-like body */}
              <div className="p-5 space-y-4">
                {/* AI message */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-neutral-700 leading-relaxed">
                      I've triaged <span className="font-medium text-neutral-900">12 new issues</span> from the last sync. Here's what needs attention:
                    </p>
                    <div className="space-y-1.5">
                      {[
                        { p: 'Critical', t: 'API rate limit exceeded on /v2/projects', a: 'Assigned to Diego' },
                        { p: 'High', t: 'Cycle view crashes on Safari 17', a: 'Assigned to Maya' },
                        { p: 'Medium', t: 'Duplicate issue: dark mode toggle missing', a: 'Marked as duplicate' },
                      ].map((item) => (
                        <div key={item.t} className="flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-50 border border-neutral-100">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                            item.p === 'Critical' ? 'bg-red-50 text-red-600' :
                            item.p === 'High' ? 'bg-orange-50 text-orange-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>{item.p}</span>
                          <span className="text-xs text-neutral-700 flex-1">{item.t}</span>
                          <span className="text-[10px] text-neutral-400">{item.a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Suggestion */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-700 leading-relaxed mb-2">
                      <span className="font-medium text-neutral-900">Risk detected:</span> Cycle "Q3 Launch" is at 92% capacity with 4 days remaining. Consider moving 2 issues to the next cycle.
                    </p>
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors">
                        Apply suggestion
                      </button>
                      <button className="px-3 py-1.5 text-xs font-medium text-neutral-500 border border-neutral-200 rounded-md hover:bg-neutral-50 transition-colors">
                        Dismiss
                      </button>
                    </div>
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
