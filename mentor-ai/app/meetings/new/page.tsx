"use client";

import { useEffect, useState } from "react";

type Client = { id: string; name: string };

export default function NewMeetingPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState<string>("");
  const [title, setTitle] = useState("Reunião");
  const [segment, setSegment] = useState("Pharma");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch("/api/clients")
      .then(r => r.json())
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientId || null, title, segment, transcript }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error ?? "Erro ao analisar.");
      setResult(data);
    } catch (e: any) {
      alert(e.message ?? "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Nova análise</h2>

      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        <label>
          Título
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: 8 }} />
        </label>

        <label>
          Segmento
          <select value={segment} onChange={(e) => setSegment(e.target.value)} style={{ width: "100%", padding: 8 }}>
            <option>Pharma</option>
            <option>Imob</option>
            <option>IA</option>
          </select>
        </label>

        <label>
          Cliente (opcional)
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={{ width: "100%", padding: 8 }}>
            <option value="">— sem cliente —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <label>
          Transcrição
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={12}
            style={{ width: "100%", padding: 10 }}
            placeholder="Cole aqui a transcrição bruta..."
          />
        </label>

        <button onClick={run} disabled={loading} style={{ padding: 10 }}>
          {loading ? "Analisando..." : "Analisar"}
        </button>
      </div>

      {result?.analysis && (
        <section style={{ marginTop: 18 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700 }}>Resultado</h3>
          <pre style={{ whiteSpace: "pre-wrap", background: "#111", color: "#fff", padding: 12, borderRadius: 8 }}>
            {JSON.stringify(result.analysis, null, 2)}
          </pre>
          <p style={{ marginTop: 8, opacity: 0.8 }}>
            Meeting ID: {result.meetingId}
          </p>
        </section>
      )}
    </main>
  );
}
