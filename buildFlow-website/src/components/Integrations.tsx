import { Workflow } from 'lucide-react';
import { Reveal } from './Reveal';

/* ── Real brand SVG logos (circle variant for nodes) ── */
const GitHubNode = () => (
  <svg width="22" height="22" viewBox="0 0 16 16" fill="currentColor">
    <path d="M7.5.5a7 7 0 0 0-2.214 13.638c.35.065.478-.152.478-.338v-1.18c-1.946.423-2.356-.939-2.356-.939-.318-.808-.776-1.023-.776-1.023-.635-.434.048-.425.048-.425.702.049 1.071.72 1.071.72.624 1.069 1.635.76 2.034.581.063-.452.244-.76.444-.936-1.551-.177-3.183-.776-3.183-3.451 0-.762.272-1.385.72-1.874-.072-.177-.312-.887.069-1.849 0 0 .587-.188 1.924.716A6.7 6.7 0 0 1 7.5 4.8c.594.003 1.192.08 1.75.236 1.336-.904 1.922-.716 1.922-.716.383.962.142 1.672.07 1.849.449.489.718 1.112.718 1.874 0 2.682-1.635 3.272-3.192 3.444.251.216.474.644.474 1.298v1.923c0 .188.127.406.482.338A7 7 0 0 0 7.5.5Z" />
  </svg>
);

const SlackNode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M5 15a2 2 0 1 1 0-4h2v4H5Z" fill="#E01E5A" />
    <path d="M9 5a2 2 0 1 1 4 0v2H9V5Z" fill="#ECB22E" />
    <path d="M15 9a2 2 0 1 1 0 4h-2V9h2Z" fill="#36C5F0" />
    <path d="M15 19a2 2 0 1 1-4 0v-2h4v2Z" fill="#2EB67D" />
    <path d="M5 9a2 2 0 1 1 4 0v2H5V9Z" fill="#E01E5A" opacity="0.4" />
    <path d="M19 15a2 2 0 1 1-4 0v-2h4v2Z" fill="#36C5F0" opacity="0.4" />
    <path d="M9 19a2 2 0 1 1 0-4h2v4H9Z" fill="#2EB67D" opacity="0.4" />
    <path d="M19 9a2 2 0 1 1-4 0v2h-4V9h8Z" fill="#ECB22E" opacity="0.4" />
  </svg>
);

const FigmaNode = () => (
  <svg width="22" height="22" viewBox="0 0 38 57" fill="none">
    <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0Z" fill="#1ABCFE" />
    <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0Z" fill="#0ACF83" />
    <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19Z" fill="#FF7262" />
    <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5Z" fill="#F24E1E" />
    <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5Z" fill="#A259FF" />
  </svg>
);

const GitLabNode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.5l-3.9-12h7.8L12 21.5zM2.5 9.5L1 4.5 12 21.5 2.5 9.5zM21.5 9.5L23 4.5 12 21.5l9.5-12zM5 4.5L1 4.5l1.5 5L5 4.5zM19 4.5l4 0-1.5 5L19 4.5zM5 4.5L12 21.5l-3.9-12L5 4.5zM19 4.5L12 21.5l3.9-12L19 4.5zM8.1 9.5L12 21.5l3.9-12H8.1z" />
  </svg>
);

const NotionNode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <rect x="2" y="2" width="20" height="20" rx="3" fill="white" stroke="currentColor" strokeWidth="1.5" />
    <text x="12" y="17" fontSize="14" fontWeight="700" fontFamily="Inter,sans-serif" textAnchor="middle">N</text>
  </svg>
);

const LinearNode = () => (
  <svg width="22" height="22" viewBox="0 0 100 100" fill="currentColor">
    <path d="M1.225 41.041l24.015 24.015V81.76H8.52L1.225 74.465V41.041zM1.225 26.515l38.546 38.546v16.699H23.273L1.225 59.712V26.515zM76.767 0L99.775 23.008V0H76.767zM60.241 0h23.008v23.008H60.241V0zm-16.525 0h23.008v23.008L43.716 0zM27.191 0h23.008v23.008L27.191 0z" />
  </svg>
);

const integrations = [
  { name: 'GitHub',  Logo: GitHubNode,  desc: 'Sync issues with PRs and commits automatically.' },
  { name: 'Slack',   Logo: SlackNode,   desc: 'Get notifications and update issues from Slack.' },
  { name: 'Figma',   Logo: FigmaNode,   desc: 'Attach designs and keep specs in sync.' },
  { name: 'GitLab',  Logo: GitLabNode,  desc: 'Two-way sync with your GitLab repositories.' },
  { name: 'Notion',  Logo: NotionNode,  desc: 'Link docs and sync pages with your projects.' },
  { name: 'Linear',  Logo: LinearNode,  desc: 'Import issues and migrate in minutes.' },
];

export default function Integrations() {
  return (
    <section id="integrations" className="py-24 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: wire diagram */}
          <Reveal className="relative">
            <WireDiagram />
          </Reveal>

          {/* Right: copy + list */}
          <Reveal delay={0.1}>
            <p className="text-xs font-medium tracking-widest text-neutral-400 uppercase mb-3">Integrations</p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
              Connects with your stack.
            </h2>
            <p className="mt-4 text-base text-neutral-500 leading-relaxed max-w-md">
              BuildFlow integrates with the tools your team already uses.
              No migration headaches, no broken workflows.
            </p>

            <div className="mt-8 space-y-4">
              {integrations.map((int) => (
                <div key={int.name} className="group flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0 group-hover:border-neutral-300 group-hover:shadow-sm transition-all">
                    <int.Logo />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-900">{int.name}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{int.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Hub-and-spoke wire diagram ── */
function WireDiagram() {
  // Node positions on a 460x360 canvas
  const cx = 230, cy = 180; // center hub
  const nodes = [
    { x: 60,  y: 60,  Logo: GitHubNode,  name: 'GitHub'  },
    { x: 400, y: 60,  Logo: SlackNode,   name: 'Slack'   },
    { x: 60,  y: 300, Logo: FigmaNode,   name: 'Figma'   },
    { x: 400, y: 300, Logo: GitLabNode,  name: 'GitLab'  },
    { x: 230, y: 30,  Logo: NotionNode,  name: 'Notion'  },
    { x: 230, y: 330, Logo: LinearNode,  name: 'Linear'  },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg viewBox="0 0 460 360" className="w-full h-auto" fill="none">
        <defs>
          <linearGradient id="hub-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#171717" />
            <stop offset="100%" stopColor="#525252" />
          </linearGradient>
        </defs>

        {/* Wires from hub to each node */}
        {nodes.map((n, i) => (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={n.x} y2={n.y}
            stroke="#d4d4d4"
            strokeWidth="1"
            strokeDasharray="4 4"
            className="wire-anim"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}

        {/* Animated pulse dots traveling along wires */}
        {nodes.map((n, i) => (
          <circle key={`pulse-${i}`} r="2.5" fill="url(#hub-gradient)" opacity="0.7">
            <animateMotion
              dur={`${2 + i * 0.3}s`}
              repeatCount="indefinite"
              path={`M ${cx} ${cy} L ${n.x} ${n.y}`}
              begin={`${i * 0.2}s`}
            />
          </circle>
        ))}

        {/* Center hub */}
        <circle cx={cx} cy={cy} r="34" fill="url(#hub-gradient)" />
        <circle cx={cx} cy={cy} r="34" fill="none" stroke="url(#hub-gradient)" strokeWidth="1" opacity="0.25">
          <animate attributeName="r" values="34;42;34" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0;0.25" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Outer nodes */}
        {nodes.map((n, i) => (
          <g key={`node-${i}`}>
            <circle cx={n.x} cy={n.y} r="22" fill="white" stroke="#e5e5e5" strokeWidth="1" />
            <circle cx={n.x} cy={n.y} r="22" fill="none" stroke="#171717" strokeWidth="1" opacity="0">
              <animate attributeName="opacity" values="0;0.08;0" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
              <animate attributeName="r" values="22;28;22" dur="2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
            </circle>
          </g>
        ))}
      </svg>

      {/* Logo overlays positioned over SVG nodes */}
      {nodes.map((n, i) => (
        <div
          key={`logo-${i}`}
          className="absolute flex items-center justify-center pointer-events-none"
          style={{
            left: `calc(${(n.x / 460) * 100}% - 11px)`,
            top: `calc(${(n.y / 360) * 100}% - 11px)`,
          }}
        >
          <n.Logo />
        </div>
      ))}

      {/* Center logo overlay */}
      <div
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          left: `calc(${(cx / 460) * 100}% - 11px)`,
          top: `calc(${(cy / 360) * 100}% - 11px)`,
          width: 22,
          height: 22,
        }}
      >
        <Workflow width={18} height={18} color="white" strokeWidth={2.25} />
      </div>
    </div>
  );
}
