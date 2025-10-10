import Stripe from "stripe";
import { headers } from "next/headers";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-12-18.acacia",
});

export async function POST(req: Request) {
    const rawBody = await req.text();
    const sig = (await headers()).get("stripe-signature");
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
        return new Response("Missing signature or secret", { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    } catch (err: any) {
        console.error("Webhook signature verification failed.", err.message);
        return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        try {
            const customerEmail = (session.customer_details && session.customer_details.email) || "";
            if (customerEmail) {
                await sendOrderConfirmationEmail(customerEmail, {
                    orderId: session.id,
                    amountTotal: session.amount_total || 0,
                });
            }
        } catch (e) {
            console.error("Failed to send confirmation email", e);
        }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
}

export const config = {
    api: {
        bodyParser: false,
    },
};


