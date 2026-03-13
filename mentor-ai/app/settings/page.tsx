"use client";

import { Settings, Bell, Shield, Palette, Database, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Configurações</h1>
        <p className="text-white/50 mt-1">Gerencie as preferências do sistema.</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Geral</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <p className="text-sm font-medium text-white/90">Idioma</p>
                <p className="text-xs text-white/40">Idioma da interface</p>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-purple-500/50">
                <option value="pt-BR">Português (BR)</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-white/5">
              <div>
                <p className="text-sm font-medium text-white/90">Segmento padrão</p>
                <p className="text-xs text-white/40">Segmento pré-selecionado em novas análises</p>
              </div>
              <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 outline-none focus:border-purple-500/50">
                <option value="">Nenhum</option>
                <option value="pharma">Pharma</option>
                <option value="imob">Imobiliário</option>
                <option value="b2b">B2B / Tech / AI</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-500/10 rounded-xl">
              <Bell className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Notificações</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between py-3 border-b border-white/5 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white/90">Análise concluída</p>
                <p className="text-xs text-white/40">Notificar quando uma análise terminar</p>
              </div>
              <div className="w-11 h-6 bg-purple-500 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" />
              </div>
            </label>
            <label className="flex items-center justify-between py-3 border-b border-white/5 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white/90">Relatório de padrões</p>
                <p className="text-xs text-white/40">Notificar quando um relatório de padrões for gerado</p>
              </div>
              <div className="w-11 h-6 bg-purple-500 rounded-full relative">
                <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform" />
              </div>
            </label>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Dados</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-medium text-white/90">Exportar dados</p>
                <p className="text-xs text-white/40">Baixar todas as análises e clientes em JSON</p>
              </div>
              <button className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all">
                Exportar
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
