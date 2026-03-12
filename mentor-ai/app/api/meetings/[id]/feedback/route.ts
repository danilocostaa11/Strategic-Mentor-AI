import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH /api/meetings/[id]/feedback
// Body: { discCorrections, feedbackNotes, dealOutcome }
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await req.json();

    const meeting = await prisma.meeting.findUnique({
        where: { id },
        include: { client: true },
    });

    if (!meeting) {
        return NextResponse.json({ error: "Reunião não encontrada." }, { status: 404 });
    }

    // Build userFeedback JSON
    const existingFeedback = meeting.userFeedback ? JSON.parse(meeting.userFeedback) : {};
    const updatedFeedback = {
        ...existingFeedback,
        ...(body.discCorrections ? { discCorrections: body.discCorrections } : {}),
        ...(body.feedbackNotes !== undefined ? { notes: body.feedbackNotes } : {}),
        updatedAt: new Date().toISOString(),
    };

    const updateData: any = {
        userFeedback: JSON.stringify(updatedFeedback),
    };

    // Update dealOutcome if provided
    if (body.dealOutcome !== undefined) {
        updateData.dealOutcome = body.dealOutcome;
    }

    // If DISC corrections were made, update the client's profileAI
    if (body.discCorrections && meeting.clientId && meeting.client) {
        // discCorrections: { participant: "CLIENTE_1", disc: "Analítico", confirmed: true }
        const correction = body.discCorrections;
        if (correction.confirmed && correction.disc) {
            await prisma.client.update({
                where: { id: meeting.clientId },
                data: {
                    profileAI: correction.disc,
                    profileConfidence: correction.confirmed ? 1.0 : (meeting.client.profileConfidence ?? 0.5),
                    profileConfirmed: correction.confirmed,
                },
            });
        }
    }

    const updated = await prisma.meeting.update({
        where: { id },
        data: updateData,
    });

    return NextResponse.json({ success: true, meeting: updated });
}
