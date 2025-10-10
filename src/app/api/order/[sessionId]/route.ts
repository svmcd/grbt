import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
});

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const resolvedParams = await params;
        const session = await stripe.checkout.sessions.retrieve(resolvedParams.sessionId);
        return Response.json(session);
    } catch (error) {
        console.error("Error retrieving session:", error);
        return Response.json({ error: "Order not found" }, { status: 404 });
    }
}
