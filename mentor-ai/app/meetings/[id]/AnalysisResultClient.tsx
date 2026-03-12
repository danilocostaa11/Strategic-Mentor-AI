"use client";

import AnalysisResult from "@/components/AnalysisResult";

export default function AnalysisResultClient({ analysis, meetingId, clientName }: { analysis: any; meetingId: string; clientName?: string | null }) {
    return <AnalysisResult analysis={analysis} meetingId={meetingId} clientName={clientName} />;
}
