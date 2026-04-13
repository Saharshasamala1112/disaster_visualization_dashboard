import { Sidebar } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur-md flex items-center px-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl">
              🛡️
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ResilientGuard</h1>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              LIVE NETWORK
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}