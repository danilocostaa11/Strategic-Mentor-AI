"use client";

import { UserCircle, Mail, Building, Briefcase, Shield } from "lucide-react";

export default function ProfilePage() {
  return (
    <main className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Perfil</h1>
        <p className="text-white/50 mt-1">Gerencie suas informações pessoais.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card rounded-2xl p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 p-[3px] mb-4 shadow-[0_0_25px_rgba(139,92,246,0.5)]">
            <div className="w-full h-full bg-[#0a0a0b] rounded-full flex items-center justify-center">
              <UserCircle className="w-14 h-14 text-white/80" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-white">Danilo Costa</h2>
          <p className="text-sm text-white/40 mt-1">Mentor Estratégico</p>
          <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 rounded-full">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-xs font-medium text-purple-400">Admin</span>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Informações</h3>
          <div className="space-y-5">
            <div>
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Nome completo</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <UserCircle className="w-4 h-4 text-white/30" />
                <input
                  type="text"
                  defaultValue="Danilo Costa"
                  className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/40"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Email</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Mail className="w-4 h-4 text-white/30" />
                <input
                  type="email"
                  defaultValue="danilo@example.com"
                  className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/40"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Empresa</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Building className="w-4 h-4 text-white/30" />
                <input
                  type="text"
                  defaultValue=""
                  placeholder="Sua empresa"
                  className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/40"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-white/40 uppercase tracking-wider mb-1.5 block">Função</label>
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                <Briefcase className="w-4 h-4 text-white/30" />
                <input
                  type="text"
                  defaultValue="Mentor Estratégico"
                  className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/40"
                />
              </div>
            </div>

            <button className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white shadow-lg shadow-purple-500/20 transition-all">
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
