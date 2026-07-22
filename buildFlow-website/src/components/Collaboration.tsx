import { MessageSquare, AtSign, Check } from 'lucide-react';
import { Reveal } from './Reveal';

export default function Collaboration() {
  return (
    <section className="py-24 bg-neutral-50/50 border-y border-neutral-100">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: mock */}
          <Reveal className="order-2 lg:order-1">
            <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.06)]">
              <div className="px-5 py-3 border-b border-neutral-100 flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-900">BF-198</span>
                <span className="text-xs text-neutral-400">Webhook delivery retries</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">In Progress</span>
              </div>

              <div className="p-5 space-y-4">
                {/* Activity thread */}
                <div className="space-y-4">
                  {/* Comment 1 */}
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-medium text-blue-700 flex-shrink-0">D</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-neutral-900">Diego</span>
                        <span className="text-[10px] text-neutral-400">2h ago</span>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        Added exponential backoff to the webhook dispatcher. Retries up to 5 times with jitter. Need review on the max interval.
                      </p>
                      <div className="mt-2 flex gap-3 text-[10px] text-neutral-400">
                        <button className="hover:text-neutral-700 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Reply</button>
                        <button className="hover:text-neutral-700 flex items-center gap-1"><Check className="w-3 h-3" /> Resolve</button>
                      </div>
                    </div>
                  </div>

                  {/* Comment 2 */}
                  <div className="flex gap-3 pl-6">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-[11px] font-medium text-emerald-700 flex-shrink-0">M</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-neutral-900">Maya</span>
                        <span className="text-[10px] text-neutral-400">1h ago</span>
                      </div>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium"><AtSign className="w-2.5 h-2.5" />Diego</span>
                        {' '}Max interval of 30s looks right. Ship it.
                      </p>
                    </div>
                  </div>

                  {/* Input */}
                  <div className="flex gap-3 pt-2 border-t border-neutral-50">
                    <div className="w-7 h-7 rounded-full bg-neutral-200 flex-shrink-0" />
                    <div className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-xs text-neutral-400">
                      Comment or mention with @…
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Right: copy */}
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">Team collaboration</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
              Conversations stay
              <br />
              close to the work.
            </h2>
            <p className="mt-5 text-base text-neutral-500 leading-relaxed max-w-md">
              Comments, mentions, and reactions live directly on issues.
              No context switching, no lost threads. Everyone stays aligned
              without leaving the page.
            </p>
            <ul className="mt-8 space-y-3">
              {[
                'Threaded comments with markdown support',
                'Real-time presence and live cursors',
                'Notifications that respect your focus time',
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
