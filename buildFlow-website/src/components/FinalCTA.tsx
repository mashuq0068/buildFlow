import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';

export default function FinalCTA() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="relative overflow-hidden rounded-2xl bg-neutral-900 px-8 py-16 sm:px-16 sm:py-24 text-center">
          {/* Grid background */}
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />

          {/* Glow */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[280px] animate-glow-pulse"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(60px)',
            }}
          />

          <div className="relative">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
              Start shipping with
              <br />
              BuildFlow today.
            </h2>
            <p className="mt-5 text-base text-neutral-400 max-w-md mx-auto">
              Free for small teams. No credit card required.
              Set up in minutes, not weeks.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="#"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-white text-neutral-900 text-sm font-medium rounded-md shadow-[0_8px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_10px_36px_rgba(255,255,255,0.25)] hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-neutral-700 text-neutral-300 text-sm font-medium rounded-md hover:border-neutral-600 hover:text-white hover:-translate-y-0.5 transition-all active:scale-95"
              >
                Talk to sales
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
