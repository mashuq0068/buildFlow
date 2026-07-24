import { Workflow } from 'lucide-react';
import { Reveal } from './Reveal';

/* ── Real brand SVG logos (exact official paths) ── */
const GitHubNode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const LinearNode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#5E6AD2">
    <path d="M2.886 4.18A11.982 11.982 0 0 1 11.99 0C18.624 0 24 5.376 24 12.009c0 3.64-1.62 6.903-4.18 9.105L2.887 4.18ZM1.817 5.626l16.556 16.556c-.524.33-1.075.62-1.65.866L.951 7.277c.247-.575.537-1.126.866-1.65ZM.322 9.163l14.515 14.515c-.71.172-1.443.282-2.195.322L0 11.358a12 12 0 0 1 .322-2.195Zm-.17 4.862 9.823 9.824a12.02 12.02 0 0 1-9.824-9.824Z" />
  </svg>
);

const SlackNode = () => (
  <svg width="22" height="22" viewBox="0 0 60 60">
    <path fill="#36C5F0" d="M22,12 a6,6 0 1 1 6,-6 v6z M22,16 a6,6 0 0 1 0,12 h-16 a6,6 0 1 1 0,-12" />
    <path fill="#2EB67D" d="M48,22 a6,6 0 1 1 6,6 h-6z M32,6 a6,6 0 1 1 12,0v16a6,6 0 0 1 -12,0z" />
    <path fill="#ECB22E" d="M38,48 a6,6 0 1 1 -6,6 v-6z M54,32 a6,6 0 0 1 0,12 h-16 a6,6 0 1 1 0,-12" />
    <path fill="#E01E5A" d="M12,38 a6,6 0 1 1 -6,-6 h6z M16,38 a6,6 0 1 1 12,0v16a6,6 0 0 1 -12,0z" />
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

const NotionNode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z" />
  </svg>
);



const JiraNode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#0052CC">
    <path d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A5.215 5.215 0 0 0 12.575 24V12.518a1.005 1.005 0 0 0-1.005-1.005zm5.723-5.756H5.736a5.215 5.215 0 0 0 5.215 5.214h2.129v2.058a5.218 5.218 0 0 0 5.215 5.214V6.758a1.001 1.001 0 0 0-1.001-1.001zM23.013 0H11.455a5.215 5.215 0 0 0 5.215 5.215h2.129v2.057A5.215 5.215 0 0 0 24 12.483V1.005A1.001 1.001 0 0 0 23.013 0Z" />
  </svg>
);

const GCalNode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#4285F4">
    <path d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z" />
  </svg>
);

const integrations = [
  { name: 'GitHub',  Logo: GitHubNode,  desc: 'Sync issues with PRs and commits automatically.' },
  { name: 'Slack',   Logo: SlackNode,   desc: 'Get notifications and update issues from Slack.' },
  { name: 'Figma',   Logo: FigmaNode,   desc: 'Attach designs and keep specs in sync.' },
  { name: 'Notion',  Logo: NotionNode,  desc: 'Link docs and sync pages with your projects.' },
  { name: 'Linear',  Logo: LinearNode,  desc: 'Import issues and migrate in minutes.' },
  { name: 'Jira',    Logo: JiraNode,    desc: 'Import epics and stories, keep both trackers aligned.' },
  { name: 'Google Calendar', Logo: GCalNode, desc: 'Sync cycle dates straight to your calendar.' },
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
            <p className="text-xs font-medium tracking-[0.2em] text-amber-600/70 uppercase mb-3">
              Integrations
            </p>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900">
              Connects with your stack.
            </h2>
            <p className="mt-4 text-base text-neutral-500 leading-relaxed max-w-md">
              BuildFlow integrates with the tools your team already uses.
              No migration headaches, no broken workflows.
            </p>

            <div className="mt-8 space-y-3">
              {integrations.map((int) => (
                <div
                  key={int.name}
                  className="group flex items-start gap-3.5 rounded-xl p-2.5 -mx-2.5 transition-all hover:bg-neutral-50"
                >
                  <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.04)] group-hover:border-amber-200/60 group-hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all">
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

/* ── Hub-and-spoke wire diagram, evenly radial for any node count ── */
function WireDiagram() {
  const size = 480;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 175;
  const hubRadius = 36;
  const nodeRadius = 24;

  const items = [
    { Logo: GitHubNode, name: 'GitHub' },
    { Logo: SlackNode, name: 'Slack' },
    { Logo: FigmaNode, name: 'Figma' },
    { Logo: NotionNode, name: 'Notion' },
    { Logo: LinearNode, name: 'Linear' },
    { Logo: JiraNode, name: 'Jira' },
    { Logo: GCalNode, name: 'Google Calendar' },
  ];

  const nodes = items.map((item, i) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / items.length;
    return {
      ...item,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto" fill="none">
        <defs>
          <linearGradient id="hub-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2a2a2a" />
            <stop offset="55%" stopColor="#171717" />
            <stop offset="100%" stopColor="#0a0a0a" />
          </linearGradient>
          <linearGradient id="hub-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#d4af6a" />
            <stop offset="100%" stopColor="#8a7245" />
          </linearGradient>
          <radialGradient id="wire-fade" cx="0" cy="0" r="1">
            <stop offset="0%" stopColor="#c9a86a" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#d4d4d4" stopOpacity="0.4" />
          </radialGradient>
          <filter id="soft-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Faint orbit ring for context */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="#e5e5e5"
          strokeWidth="1"
          strokeDasharray="2 6"
          opacity="0.6"
        />

        {/* Wires from hub to each node */}
        {nodes.map((n, i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={n.x}
            y2={n.y}
            stroke="url(#wire-fade)"
            strokeWidth="1.1"
            className="wire-anim"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}

        {/* Animated pulse dots traveling along wires */}
        {nodes.map((n, i) => (
          <circle key={`pulse-${i}`} r="2.4" fill="#c9a86a" opacity="0.85">
            <animateMotion
              dur={`${2.4 + i * 0.25}s`}
              repeatCount="indefinite"
              path={`M ${cx} ${cy} L ${n.x} ${n.y}`}
              begin={`${i * 0.2}s`}
            />
          </circle>
        ))}

        {/* Center hub */}
        <circle cx={cx} cy={cy} r={hubRadius} fill="url(#hub-gradient)" filter="url(#soft-shadow)" />
        <circle cx={cx} cy={cy} r={hubRadius} fill="none" stroke="url(#hub-ring)" strokeWidth="1.25" opacity="0.9" />
        <circle cx={cx} cy={cy} r={hubRadius} fill="none" stroke="url(#hub-ring)" strokeWidth="1" opacity="0.3">
          <animate attributeName="r" values={`${hubRadius};${hubRadius + 12};${hubRadius}`} dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Outer nodes */}
        {nodes.map((n, i) => (
          <g key={`node-${i}`}>
            <circle cx={n.x} cy={n.y} r={nodeRadius} fill="white" stroke="#e5e5e5" strokeWidth="1" filter="url(#soft-shadow)" />
            <circle cx={n.x} cy={n.y} r={nodeRadius} fill="none" stroke="#c9a86a" strokeWidth="1" opacity="0">
              <animate attributeName="opacity" values="0;0.35;0" dur="2.2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
              <animate attributeName="r" values={`${nodeRadius};${nodeRadius + 6};${nodeRadius}`} dur="2.2s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
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
            left: `calc(${(n.x / size) * 100}% - 11px)`,
            top: `calc(${(n.y / size) * 100}% - 11px)`,
          }}
        >
          <n.Logo />
        </div>
      ))}

      {/* Center logo overlay */}
      <div
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          left: `calc(${(cx / size) * 100}% - 11px)`,
          top: `calc(${(cy / size) * 100}% - 11px)`,
          width: 22,
          height: 22,
        }}
      >
        <Workflow width={18} height={18} color="#e8d5a8" strokeWidth={2.25} />
      </div>
    </div>
  );
}