import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

export async function GET(
    request: Request,
    { params }: { params: { sessionId: string } }
) {
    try {
        const session = await stripe.checkout.sessions.retrieve(params.sessionId);
        return Response.json(session);
    } catch (error) {
        console.error("Error retrieving session:", error);
        return Response.json({ error: "Order not found" }, { status: 404 });
    }
}
