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
        // Only what the order success page shows; never the full session (email, phone, payment)
        const shipping = session.collected_information?.shipping_details ?? null;
        return Response.json({
            id: session.id,
            amount_total: session.amount_total,
            created: session.created,
            shipping_details: shipping ? { name: shipping.name, address: shipping.address } : null,
        });
    } catch (error) {
        console.error("Error retrieving session:", error);
        return Response.json({ error: "Order not found" }, { status: 404 });
    }
}
