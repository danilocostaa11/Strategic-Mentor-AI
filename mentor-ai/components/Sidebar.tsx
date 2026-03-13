"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Clock, BrainCircuit, Settings, Rocket } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Nova Reunião", href: "/meetings/new", icon: Rocket },
  { name: "Clientes", href: "/clients", icon: Users },
  { name: "Histórico", href: "/dashboard", icon: Clock },
  { name: "Padrões", href: "/patterns", icon: BrainCircuit },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 glass-panel flex flex-col transition-all duration-300">
      <div className="flex items-center gap-3 px-6 py-8 border-b border-white/5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.5)]">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold gradient-text tracking-wide">Mentor AI</span>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 px-2">Menu Principal</div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? "bg-purple-500/10 text-purple-400 font-medium" 
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              )}
              <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl transition-all duration-200 group ${
            pathname === "/settings"
              ? "bg-purple-500/10 text-purple-400 font-medium"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Settings className="w-5 h-5 transition-transform group-hover:rotate-90" />
          <span className="font-medium">Configurações</span>
        </Link>
      </div>
    </aside>
  );
}
