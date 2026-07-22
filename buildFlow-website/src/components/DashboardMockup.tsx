export default function DashboardMockup() {
  return (
    <div className="w-full bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.08)] select-none">
      {/* Window chrome */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-neutral-50/60">
        <div className="w-3 h-3 rounded-full bg-neutral-300" />
        <div className="w-3 h-3 rounded-full bg-neutral-300" />
        <div className="w-3 h-3 rounded-full bg-neutral-300" />
        <div className="flex-1 mx-4">
          <div className="bg-white border border-neutral-200 rounded-md px-3 py-1 text-[11px] text-neutral-400 text-center">
            app.buildflow.io/dashboard
          </div>
        </div>
      </div>

      <div className="flex h-[520px]">
        {/* Sidebar */}
        <div className="w-48 border-r border-neutral-100 bg-white flex-shrink-0 flex flex-col py-3">
          {/* Brand */}
          <div className="px-3 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 1l1.5 3.5H11L8 7l1 4-3-2-3 2 1-4L1 4.5h3.5L6 1z" fill="white" />
              </svg>
            </div>
            <span className="text-[12px] font-semibold text-neutral-900">BuildFlow</span>
          </div>

          {/* Workspace */}
          <div className="px-3 mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded bg-violet-100 flex items-center justify-center text-[9px] font-bold text-violet-700">A</div>
              <span className="text-[11px] text-neutral-600 font-medium">Acme Inc</span>
            </div>
          </div>

          <div className="px-2 mt-2 space-y-0.5">
            <SidebarLabel>WORKSPACE</SidebarLabel>
            <SidebarItem label="Dashboard" active />
            <SidebarItem label="Inbox" />
            <SidebarItem label="My Issues" />
            <SidebarItem label="Favorites" />
            <SidebarItem label="Drafts" />
            <SidebarLabel className="mt-2">PLANNING</SidebarLabel>
            <SidebarItem label="Projects" />
            <SidebarItem label="Cycles" />
            <SidebarItem label="Roadmap" />
            <SidebarItem label="Goals" />
            <SidebarLabel className="mt-2">INSIGHTS</SidebarLabel>
            <SidebarItem label="Analytics" />
            <SidebarItem label="Members" />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-hidden bg-white p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[14px] font-semibold text-neutral-900">Dashboard</h2>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-[11px] font-medium rounded-md">
              + New Issue
            </button>
          </div>

          <div className="mb-4">
            <p className="text-[13px] font-medium text-neutral-900">Welcome back, Maya</p>
            <p className="text-[11px] text-neutral-500">Here's what's happening across your work.</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: 'My open issues', value: '9' },
              { label: 'My in progress', value: '4' },
              { label: 'Projects', value: '4' },
              { label: 'Total work items', value: '68' },
            ].map((s) => (
              <div key={s.label} className="border border-neutral-100 rounded-lg p-3 bg-white">
                <p className="text-[10px] text-neutral-500 mb-1">{s.label}</p>
                <p className="text-[18px] font-semibold text-neutral-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Issues by priority */}
            <div className="col-span-2 border border-neutral-100 rounded-lg p-3">
              <p className="text-[10px] font-medium text-neutral-700 mb-3">My issues by priority</p>
              <div className="flex items-end gap-2 h-16">
                {[
                  { h: '70%', color: '#7c3aed', label: 'Critical', n: 2 },
                  { h: '100%', color: '#ef4444', label: 'Urgent', n: 4 },
                  { h: '75%', color: '#f59e0b', label: 'High', n: 3 },
                  { h: '50%', color: '#10b981', label: 'Medium', n: 2 },
                  { h: '25%', color: '#3b82f6', label: 'Low', n: 1 },
                  { h: '25%', color: '#9ca3af', label: 'None', n: 1 },
                ].map((b) => (
                  <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[8px] text-neutral-500">{b.n}</span>
                    <div className="w-full rounded-sm transition-all" style={{ height: b.h, backgroundColor: b.color }} />
                    <span className="text-[7px] text-neutral-400">{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues by status */}
            <div className="border border-neutral-100 rounded-lg p-3">
              <p className="text-[10px] font-medium text-neutral-700 mb-2">By status</p>
              <div className="flex items-center gap-2">
                {/* Donut */}
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="16" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                  <circle cx="22" cy="22" r="16" fill="none" stroke="#f59e0b" strokeWidth="6"
                    strokeDasharray="50 100" strokeDashoffset="25" />
                  <circle cx="22" cy="22" r="16" fill="none" stroke="#ef4444" strokeWidth="6"
                    strokeDasharray="12 100" strokeDashoffset="-25" />
                  <circle cx="22" cy="22" r="16" fill="none" stroke="#10b981" strokeWidth="6"
                    strokeDasharray="20 100" strokeDashoffset="-37" />
                </svg>
                <div className="space-y-0.5">
                  {[
                    { color: '#9ca3af', label: 'Backlog', n: 1 },
                    { color: '#3b82f6', label: 'Todo', n: 3 },
                    { color: '#f59e0b', label: 'In Progress', n: 4 },
                    { color: '#ef4444', label: 'Blocked', n: 1 },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-[8px] text-neutral-500">{s.label}</span>
                      <span className="text-[8px] font-medium text-neutral-700 ml-auto">{s.n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`px-1.5 py-1 text-[9px] font-semibold text-neutral-400 uppercase ${className}`}>
      {children}
    </p>
  );
}

function SidebarItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      className={`px-2 py-1 rounded-md text-[11px] cursor-pointer transition-colors ${
        active ? 'bg-neutral-100 text-neutral-900 font-medium' : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
      }`}
    >
      {label}
    </div>
  );
}
