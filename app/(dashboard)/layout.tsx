import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.1),transparent_35%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_32%),linear-gradient(180deg,#f8fafc,#eef2ff)] text-zinc-900 dark:bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.2),transparent_35%),radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_32%),linear-gradient(180deg,#09090b,#0b1020)] dark:text-white">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-16 items-center border-b border-zinc-200/80 bg-white/75 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-900/85">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-500 text-2xl shadow-[0_12px_30px_rgba(14,165,233,0.22)]">
              🛡️
            </div>
            <h1 className="text-lg font-bold tracking-tight sm:text-xl lg:text-2xl">ResilientGuard</h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 sm:text-sm dark:text-emerald-300">
              <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />
              LIVE NETWORK
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}