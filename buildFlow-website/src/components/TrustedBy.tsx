import { motion } from 'framer-motion';
import '@/styles/marquee.css';

/* ── Inline SVG brand marks (grayscale integration badges, not official trademarked files) ── */
const VercelLogo = () => (
  <svg height="28" viewBox="0 0 74 16" fill="currentColor" aria-label="Vercel">
    <path d="M7.5 0L15 14H0L7.5 0Z" />
    <text x="20" y="13" fontSize="13" fontWeight="600" fontFamily="Inter,sans-serif">Vercel</text>
  </svg>
);

const LinearLogo = () => (
  <svg height="28" viewBox="0 0 64 16" fill="currentColor" aria-label="Linear">
    <path d="M0 1.5L1.5 0l5.8 5.8V0H9v9H0V7.3L5.8 1.5 0 1.5Zm0 9.5C0 9.1 1.1 8 2.5 8H9v2.5C9 11.9 7.9 13 6.5 13H0v-2Z" />
    <text x="14" y="13" fontSize="13" fontWeight="600" fontFamily="Inter,sans-serif">Linear</text>
  </svg>
);

const StripeLogo = () => (
  <svg height="28" viewBox="0 0 52 16" fill="currentColor" aria-label="Stripe">
    <text x="0" y="13" fontSize="14" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="-0.3">Stripe</text>
  </svg>
);

const NotionLogo = () => (
  <svg height="28" viewBox="0 0 68 16" fill="currentColor" aria-label="Notion">
    <rect x="0" y="0" width="14" height="16" rx="2" fill="black" />
    <rect x="2.5" y="3" width="9" height="2.5" rx="1" fill="white" />
    <rect x="2.5" y="7" width="6.5" height="2" rx="1" fill="white" />
    <rect x="2.5" y="11" width="9" height="2" rx="1" fill="white" />
    <text x="18" y="13" fontSize="13" fontWeight="700" fontFamily="Inter,sans-serif">Notion</text>
  </svg>
);

const GitHubLogo = () => (
  <svg height="28" viewBox="0 0 72 16" fill="currentColor" aria-label="GitHub">
    <path d="M7.5.5a7 7 0 0 0-2.214 13.638c.35.065.478-.152.478-.338v-1.18c-1.946.423-2.356-.939-2.356-.939-.318-.808-.776-1.023-.776-1.023-.635-.434.048-.425.048-.425.702.049 1.071.72 1.071.72.624 1.069 1.635.76 2.034.581.063-.452.244-.76.444-.936-1.551-.177-3.183-.776-3.183-3.451 0-.762.272-1.385.72-1.874-.072-.177-.312-.887.069-1.849 0 0 .587-.188 1.924.716A6.7 6.7 0 0 1 7.5 4.8c.594.003 1.192.08 1.75.236 1.336-.904 1.922-.716 1.922-.716.383.962.142 1.672.07 1.849.449.489.718 1.112.718 1.874 0 2.682-1.635 3.272-3.192 3.444.251.216.474.644.474 1.298v1.923c0 .188.127.406.482.338A7 7 0 0 0 7.5.5Z" />
    <text x="19" y="13" fontSize="13" fontWeight="600" fontFamily="Inter,sans-serif">GitHub</text>
  </svg>
);

const SlackLogo = () => (
  <svg height="28" viewBox="0 0 58 16" fill="none" aria-label="Slack">
    <rect x="0" y="0" width="5" height="5" rx="1.5" fill="#E01E5A" />
    <rect x="6.5" y="0" width="5" height="5" rx="1.5" fill="#ECB22E" />
    <rect x="0" y="6.5" width="5" height="5" rx="1.5" fill="#2EB67D" />
    <rect x="6.5" y="6.5" width="5" height="5" rx="1.5" fill="#36C5F0" />
    <text x="17" y="12" fontSize="13" fontWeight="600" fontFamily="Inter,sans-serif" fill="black">Slack</text>
  </svg>
);

const FigmaLogo = () => (
  <svg height="28" viewBox="0 0 58 16" fill="none" aria-label="Figma">
    <circle cx="4.5" cy="4.5" r="4.5" fill="#F24E1E" />
    <circle cx="4.5" cy="4.5" r="2.2" fill="#FF7262" />
    <circle cx="4.5" cy="11.5" r="2.2" fill="#A259FF" />
    <circle cx="10.5" cy="8" r="2.2" fill="#1ABCFE" />
    <circle cx="4.5" cy="8" r="2.2" fill="#0ACF83" />
    <text x="17" y="12" fontSize="13" fontWeight="600" fontFamily="Inter,sans-serif" fill="black">Figma</text>
  </svg>
);

const RampLogo = () => (
  <svg height="28" viewBox="0 0 50 16" fill="currentColor" aria-label="Ramp">
    <text x="0" y="13" fontSize="14" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="-0.3">Ramp</text>
  </svg>
);

const LoomLogo = () => (
  <svg height="28" viewBox="0 0 50 16" fill="currentColor" aria-label="Loom">
    <text x="0" y="13" fontSize="14" fontWeight="700" fontFamily="Inter,sans-serif" letterSpacing="-0.3">Loom</text>
  </svg>
);

const RetoolLogo = () => (
  <svg height="28" viewBox="0 0 60 16" fill="currentColor" aria-label="Retool">
    <rect x="0" y="0" width="13" height="16" rx="2" fill="black" />
    <rect x="2.5" y="3" width="8" height="2.5" rx="1" fill="white" />
    <rect x="2.5" y="7.5" width="5" height="2.5" rx="1" fill="white" />
    <text x="17" y="13" fontSize="13" fontWeight="600" fontFamily="Inter,sans-serif">Retool</text>
  </svg>
);

const brands = [
  { key: 'vercel',  Logo: VercelLogo  },
  { key: 'linear',  Logo: LinearLogo  },
  { key: 'stripe',  Logo: StripeLogo  },
  { key: 'notion',  Logo: NotionLogo  },
  { key: 'github',  Logo: GitHubLogo  },
  { key: 'slack',   Logo: SlackLogo   },
  { key: 'figma',   Logo: FigmaLogo   },
  { key: 'ramp',    Logo: RampLogo    },
  { key: 'loom',    Logo: LoomLogo    },
  { key: 'retool',  Logo: RetoolLogo  },
];

export default function TrustedBy() {
  return (
    <section className="py-16 border-t border-b border-neutral-100 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <p className="text-[12px] font-medium text-neutral-500 uppercase">
          Works alongside the tools you already use
        </p>
        <p className="mt-1.5 text-sm text-neutral-400">
          Connect BuildFlow to your existing stack in minutes.
        </p>
      </motion.div>

      <div className="relative">
        {/* Fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-28 z-10"
          style={{ background: 'linear-gradient(to right, white, transparent)' }} />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-28 z-10"
          style={{ background: 'linear-gradient(to left, white, transparent)' }} />

        <div className="marquee-track items-center gap-16 py-1">
          {[...brands, ...brands].map((b, i) => (
            <div
              key={`${b.key}-${i}`}
              className="flex-shrink-0 text-neutral-700 hover:scale-110 transition-all duration-300 cursor-default"
            >
              <b.Logo />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
