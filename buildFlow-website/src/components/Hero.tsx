import { ArrowRight } from 'lucide-react';
import { motion, type Variants } from 'framer-motion';
import { EASE_OUT } from '@/lib/motion';

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #f0f0f0 1px, transparent 1px), linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
        }}
      />

      {/* Animated glow — monochrome */}
      <div className="absolute inset-x-0 top-0 -z-20 h-[720px] overflow-hidden">
        <div className="absolute left-1/2 top-[-160px] -translate-x-1/2">
          <div
            className="w-[560px] h-[560px] rounded-full animate-glow-float-slow animate-glow-pulse"
            style={{
              background: 'radial-gradient(circle, rgba(0,0,0,0.16) 0%, rgba(0,0,0,0) 70%)',
              filter: 'blur(60px)',
            }}
          />
        </div>
        <div className="absolute left-[18%] top-[80px]">
          <div
            className="w-[380px] h-[380px] rounded-full animate-glow-float-slower"
            style={{
              background: 'radial-gradient(circle, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 70%)',
              filter: 'blur(70px)',
            }}
          />
        </div>
        <div className="absolute right-[16%] top-[40px]">
          <div
            className="w-[340px] h-[340px] rounded-full animate-glow-float-slow"
            style={{
              background: 'radial-gradient(circle, rgba(0,0,0,0.09) 0%, rgba(0,0,0,0) 70%)',
              filter: 'blur(70px)',
              animationDelay: '2s',
            }}
          />
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-6"
      >
        {/* Pill */}
        <motion.div variants={item} className="flex justify-center mb-8">
          <a
            href="#"
            className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 bg-white/80 backdrop-blur-sm text-xs text-neutral-600 shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_4px_16px_rgba(0,0,0,0.06)] hover:border-neutral-300 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_6px_20px_rgba(0,0,0,0.1)] transition-all"
          >
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-neutral-900 text-white text-[9px] font-bold">
              N
            </span>
            Introducing BuildFlow AI 2.0
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>

        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            variants={item}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight text-neutral-900 leading-[1.05]"
          >
            Project management
            <br />
            <span className="text-neutral-400">for serious teams.</span>
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-6 text-base sm:text-lg text-neutral-500 max-w-xl mx-auto leading-relaxed"
          >
            Plan, track, and ship with a platform built for engineering teams.
            AI-native workflows keep your work moving — without the overhead.
          </motion.p>
        </div>

        {/* CTAs */}
        <motion.div
          variants={item}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <a
            href="#"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-md shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            Start for free
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="#"
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 border border-neutral-200 bg-white text-neutral-700 text-sm font-medium rounded-md hover:border-neutral-300 hover:bg-neutral-50 hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
          >
            Book a demo
          </a>
        </motion.div>

        {/* Real dashboard screenshot, with an animated sweeping gradient border */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.2 }}
          className="mt-16 max-w-6xl mx-auto"
        >
          <div className="relative rounded-xl overflow-hidden p-[1px] shadow-[0_16px_64px_rgba(0,0,0,0.10)]">
            {/* Rotating conic-gradient sweep, clipped to a 1px border by the white card on top */}
            <div className="absolute inset-[-60%] animate-spin-slow">
              <div
                className="w-full h-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0%, rgba(0,0,0,0.5) 8%, transparent 20%, transparent 100%)',
                }}
              />
            </div>

            <div className="relative rounded-xl border border-neutral-200 overflow-hidden bg-white">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50/80">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
                <div className="flex-1 mx-4">
                  <div className="bg-white border border-neutral-200 rounded-md px-3 py-1 text-[11px] text-neutral-400 text-center max-w-xs mx-auto">
                    app.buildflow.io/dashboard
                  </div>
                </div>
              </div>
              <img
                src="/images/hero/image.png"
                alt="BuildFlow Dashboard"
                className="w-full h-auto block"
                loading="eager"
                decoding="async"
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
