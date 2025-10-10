import Stripe from "stripe";
import { NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
});

export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated (you might want to add proper auth here)
        // For now, we'll just return the orders

        // Get all checkout sessions (orders)
        const sessions = await stripe.checkout.sessions.list({
            limit: 100, // Adjust as needed
            expand: ['data.line_items'], // Expand line items for more details
        });

        // Debug: Log all sessions to see their statuses and emails
        console.log('All sessions:', sessions.data.map(s => ({
            id: s.id,
            payment_status: s.payment_status,
            status: s.status,
            amount_total: s.amount_total,
            customer_email: s.customer_email,
            customer_details: s.customer_details
        })));

        // Filter only successful orders (paid and completed)
        const successfulSessions = sessions.data.filter(session =>
            session.payment_status === 'paid' &&
            session.status === 'complete'
        );

        console.log('Successful sessions:', successfulSessions.length);

        // Format the sessions for the admin dashboard
        const orders = successfulSessions.map(session => ({
            id: session.id,
            amount_total: session.amount_total || 0,
            customer_email: session.customer_email || session.customer_details?.email || 'No email',
            payment_status: session.payment_status,
            created: session.created,
            shipping_details: (session as any).shipping_details,
            line_items: session.line_items?.data || [],
            // Add shipping status (you can manage this in your database later)
            shipped: false, // Default to not shipped
        }));

        // Sort by creation date (newest first)
        orders.sort((a, b) => b.created - a.created);

        return Response.json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        return Response.json(
            { error: "Failed to fetch orders" },
            { status: 500 }
        );
    }
}
