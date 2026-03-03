import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Strategic Mentor AI</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        Cole uma transcrição e receba diagnóstico estratégico + perfil comportamental + plano da próxima reunião.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <Link href="/meetings/new">Nova análise</Link>
        <Link href="/clients">Clientes</Link>
        <Link href="/dashboard">Histórico</Link>
        <Link href="/patterns">Análise de padrões</Link>
      </div>
    </main>
  );
}
