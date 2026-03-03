"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string; company?: string | null; segment?: string | null; profileManual?: string | null };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [segment, setSegment] = useState("Pharma");
  const [profileManual, setProfileManual] = useState("Analítico");

  async function refresh() {
    const r = await fetch("/api/clients");
    setClients(await r.json());
  }

  useEffect(() => { refresh(); }, []);

  async function createClient() {
    const r = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, company, segment, profileManual }),
    });
    if (!r.ok) {
      const data = await r.json();
      alert(data?.error ?? "Erro");
      return;
    }
    setName("");
    setCompany("");
    await refresh();
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Clientes</h2>

      <div style={{ display: "grid", gap: 10, marginTop: 14, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <h3 style={{ fontWeight: 700 }}>Novo cliente</h3>
        <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 8 }} />
        <input placeholder="Empresa (opcional)" value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: 8 }} />
        <select value={segment} onChange={(e) => setSegment(e.target.value)} style={{ padding: 8 }}>
          <option>Pharma</option>
          <option>Imob</option>
          <option>IA</option>
        </select>
        <select value={profileManual} onChange={(e) => setProfileManual(e.target.value)} style={{ padding: 8 }}>
          <option>Analítico</option>
          <option>Integrador</option>
          <option>Expressivo</option>
          <option>Pragmático</option>
        </select>
        <button onClick={createClient} disabled={!name.trim()} style={{ padding: 10 }}>
          Criar
        </button>
      </div>

      <div style={{ marginTop: 18 }}>
        <h3 style={{ fontWeight: 700 }}>Lista</h3>
        <ul style={{ marginTop: 10 }}>
          {clients.map(c => (
            <li key={c.id} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
              <b>{c.name}</b> {c.company ? `— ${c.company}` : ""}{" "}
              <span style={{ opacity: 0.7 }}>
                ({c.segment ?? "N/A"} | {c.profileManual ?? "sem perfil"})
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
