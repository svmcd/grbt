import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
});

export async function GET(
    request: Request,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;
        if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
            return Response.json({ error: "Order not found" }, { status: 404 });
        }
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        // Only what the order success page shows; never the full session (email, phone, payment)
        const shipping = session.collected_information?.shipping_details ?? null;
        return Response.json(
            {
                id: session.id,
                payment_status: session.payment_status,
                amount_total: session.amount_total,
                created: session.created,
                shipping_details: shipping ? { name: shipping.name, address: shipping.address } : null,
            },
            { headers: { "Cache-Control": "private, no-store" } }
        );
    } catch (error) {
        console.error("Error retrieving session:", error);
        return Response.json({ error: "Order not found" }, { status: 404 });
    }
}
