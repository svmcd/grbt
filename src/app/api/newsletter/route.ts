import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { resolveLocale } from "@/i18n/config";

// Newsletter sign-up from the footer. Stored in Firestore "waitlist" (one document per email).
export async function POST(request: NextRequest) {
    try {
        const { email, locale } = await request.json();
        const clean = String(email || "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean) || clean.length > 320) {
            return NextResponse.json({ error: "invalid_email" }, { status: 400 });
        }
        const ref = adminDb.collection("waitlist").doc(clean);
        const existing = await ref.get();
        if (!existing.exists) {
            await ref.set({ email: clean, timestamp: new Date(), source: "website", locale: resolveLocale(locale) });
        }
        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error("Newsletter sign-up failed:", error);
        return NextResponse.json({ error: "failed" }, { status: 500 });
    }
}
