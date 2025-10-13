import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
});

export async function GET() {
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
                        const detailedSession = await stripe.checkout.sessions.retrieve(session.id);
                        return detailedSession;
                    } catch (error) {
                        console.error(`Error fetching details for session ${session.id}:`, error);
                        return session;
                    }
                })
        );


        // Filter ONLY successful paid orders from detailed sessions
        const finalSuccessfulSessions = detailedSessions.filter(session =>
            session.payment_status === 'paid' &&
            session.status === 'complete'
        );


        // Format successful orders for the admin dashboard with product details
        const orders = await Promise.all(finalSuccessfulSessions.map(async (session) => {
            // Fetch product details for each line item
            const lineItemsWithProducts = await Promise.all((session.line_items?.data || []).map(async (item: any) => {
                if (item.price?.product) {
                    try {
                        // Fetch product details from Stripe
                        const product = await stripe.products.retrieve(item.price.product);
                        return {
                            ...item,
                            product_details: {
                                name: product.name,
                                description: product.description,
                                images: product.images,
                                metadata: product.metadata
                            }
                        };
                    } catch (error) {
                        console.error(`Error fetching product ${item.price.product}:`, error);
                        return item; // Return original item if product fetch fails
                    }
                }
                return item;
            }));

            return {
                id: session.id,
                amount_total: session.amount_total || 0,
                customer_email: session.customer_email || session.customer_details?.email || 'No email',
                payment_status: session.payment_status,
                status: session.status,
                created: session.created,
                shipping_details: (session as any).shipping_details || (session as any).shipping || session.customer_details?.address || null,
                line_items: lineItemsWithProducts,
                // Add shipping status (you can manage this in your database later)
                shipped: false, // Default to not shipped
            };
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
