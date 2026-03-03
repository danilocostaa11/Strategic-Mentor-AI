"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Meeting = {
  id: string;
  title: string;
  segment?: string | null;
  strategicScore?: number | null;
  closingScore?: number | null;
  createdAt: string;
  client?: { name: string } | null;
};

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    fetch("/api/meetings").then(r => r.json()).then(setMeetings);
  }, []);

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700 }}>Histórico</h2>

      <ul style={{ marginTop: 12 }}>
        {meetings.map(m => (
          <li key={m.id} style={{ padding: 10, borderBottom: "1px solid #eee" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <b>{m.title}</b>{" "}
                <span style={{ opacity: 0.7 }}>
                  {m.client?.name ? `— ${m.client.name}` : ""} ({m.segment ?? "N/A"})
                </span>
                <div style={{ opacity: 0.7, fontSize: 12 }}>
                  {new Date(m.createdAt).toLocaleString()}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div>Estratégia: {m.strategicScore ?? "—"}</div>
                <div>Fechamento: {m.closingScore ?? "—"}</div>
                <Link href={`/meetings/${m.id}`}>Ver</Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
