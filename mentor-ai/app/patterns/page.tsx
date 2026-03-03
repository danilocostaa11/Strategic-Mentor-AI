"use client";

import { useEffect, useState } from "react";

type Meeting = { id: string; title: string; createdAt: string };

export default function PatternsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/meetings")
      .then(r => r.json())
      .then((data) => setMeetings(data.map((m: any) => ({ id: m.id, title: m.title, createdAt: m.createdAt }))));
  }, []);

  async function run() {
    const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
    setLoading(true);
    setReport(null);
    try {
      const r = await fetch("/api/patterns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingIds: ids }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Erro ao gerar padrões.");
      setReport(data);
    } catch (e: any) {
      alert(e.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Análise de padrões</h2>
      <p style={{ opacity: 0.8 }}>Selecione pelo menos 3 reuniões.</p>

      <div style={{ marginTop: 12 }}>
        {meetings.map(m => (
          <label key={m.id} style={{ display: "block", padding: 8, borderBottom: "1px solid #eee" }}>
            <input
              type="checkbox"
              checked={!!selected[m.id]}
              onChange={(e) => setSelected(s => ({ ...s, [m.id]: e.target.checked }))}
            />{" "}
            <b>{m.title}</b> <span style={{ opacity: 0.7, fontSize: 12 }}>{new Date(m.createdAt).toLocaleString()}</span>
          </label>
        ))}
      </div>

      <button onClick={run} disabled={loading} style={{ marginTop: 12, padding: 10 }}>
        {loading ? "Gerando..." : "Gerar padrões"}
      </button>

      {report && (
        <pre style={{ marginTop: 14, whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 8 }}>
          {JSON.stringify(report, null, 2)}
        </pre>
      )}
    </main>
  );
}
