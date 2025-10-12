import Stripe from "stripe";
import { NextRequest } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
});

export async function GET(request: NextRequest) {
    try {
        // Check if user is authenticated (you might want to add proper auth here)
        // For now, we'll just return the orders

        // Get all checkout sessions (orders) with shipping details
        const sessions = await stripe.checkout.sessions.list({
            limit: 100, // Adjust as needed
            expand: ['data.line_items'], // Just expand line items
        });

        // For each successful session, get detailed shipping info
        const detailedSessions = await Promise.all(
            sessions.data
                .filter(session => session.payment_status === 'paid' && session.status === 'complete')
                .map(async (session) => {
                    try {
                        const detailedSession = await stripe.checkout.sessions.retrieve(session.id, {
                            expand: ['shipping_details']
                        });
                        return detailedSession;
                    } catch (error) {
                        console.error(`Error fetching details for session ${session.id}:`, error);
                        return session;
                    }
                })
        );

        // Debug: Log EVERYTHING from Stripe
        console.log('=== FULL STRIPE SESSIONS DATA ===');
        sessions.data.forEach((session, index) => {
            console.log(`\n--- SESSION ${index + 1} ---`);
            console.log('Session ID:', session.id);
            console.log('Payment Status:', session.payment_status);
            console.log('Status:', session.status);
            console.log('Amount Total:', session.amount_total);
            console.log('Customer Email:', session.customer_email);
            console.log('Customer Details:', session.customer_details);
            console.log('Shipping Details:', (session as any).shipping_details);
            console.log('Line Items Count:', session.line_items?.data?.length || 0);

            if (session.line_items?.data) {
                session.line_items.data.forEach((item, itemIndex) => {
                    console.log(`\n  --- LINE ITEM ${itemIndex + 1} ---`);
                    console.log('  Description:', item.description);
                    console.log('  Quantity:', item.quantity);
                    console.log('  Amount Total:', (item as any).amount_total);
                    console.log('  Price Data:', (item as any).price_data);
                    console.log('  Full Item Object:', JSON.stringify(item, null, 2));
                });
            }
        });

        // Filter ONLY successful paid orders from detailed sessions
        const successfulSessions = detailedSessions.filter(session =>
            session.payment_status === 'paid' &&
            session.status === 'complete'
        );

        console.log(`Found ${successfulSessions.length} successful paid orders with shipping details`);

        // Debug: Log shipping details for each successful session
        successfulSessions.forEach((session, index) => {
            console.log(`\n--- SUCCESSFUL SESSION ${index + 1} ---`);
            console.log('Session ID:', session.id);
            console.log('Customer Email:', session.customer_email);
            console.log('Shipping Details:', JSON.stringify((session as any).shipping_details, null, 2));
            console.log('Customer Details:', JSON.stringify(session.customer_details, null, 2));
        });

        // Format successful orders for the admin dashboard
        const orders = successfulSessions.map(session => ({
            id: session.id,
            amount_total: session.amount_total || 0,
            customer_email: session.customer_email || session.customer_details?.email || 'No email',
            payment_status: session.payment_status,
            status: session.status,
            created: session.created,
            shipping_details: (session as any).shipping_details || (session as any).shipping || null,
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
