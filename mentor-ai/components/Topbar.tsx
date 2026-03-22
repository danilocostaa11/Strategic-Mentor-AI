import { Menu, Search, Bell, UserCircle } from "lucide-react";
import Link from "next/link";

type TopbarProps = {
    onMenuToggle: () => void;
};

export function Topbar({ onMenuToggle }: TopbarProps) {
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-t-0 border-r-0 border-l-0 border-white/5 bg-black/40 px-4 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] glass md:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <button
                    type="button"
                    onClick={onMenuToggle}
                    aria-label="Abrir menu"
                    className="rounded-2xl border border-white/10 bg-white/5 p-2.5 text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 shadow-inner transition-all focus-within:border-purple-500/50 focus-within:bg-white/10 md:w-96 md:max-w-lg md:flex-none">
                <Search className="w-5 h-5 text-white/50" />
                <input
                    type="text"
                    placeholder="Buscar clientes, reuniões ou padrões..."
                    className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/40"
                />
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
                <button aria-label="Notificações" className="relative rounded-full border border-white/10 bg-white/5 p-2.5 transition-all group hover:bg-white/10">
                    <Bell className="w-5 h-5 text-white/70 group-hover:text-white" />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)] border-2 border-[#0a0a0b]"></span>
                </button>
                <Link href="/profile" className="flex items-center gap-3 border-l border-white/10 pl-3 md:pl-4 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-white/90">Danilo Costa</p>
                        <p className="text-xs text-white/40 font-medium">Mentor Estratégico</p>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-[2px] transition-transform group-hover:scale-105 shadow-[0_0_15px_rgba(139,92,246,0.5)]">
                        <div className="w-full h-full bg-[#0a0a0b] rounded-full flex items-center justify-center">
                            <UserCircle className="w-7 h-7 text-white/80" />
                        </div>
                    </div>
                </Link>
            </div>
        </header>
    );
}
