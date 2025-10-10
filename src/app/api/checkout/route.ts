import Stripe from "stripe";
import { getAllShippingCountries, getShippingPrice } from "@/lib/shipping";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY
    ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" })
    : (null as any);

export async function POST(request: Request) {
    try {
        if (!STRIPE_SECRET_KEY || !stripe) {
            return Response.json(
                { error: "Stripe secret key not configured" },
                { status: 500 }
            );
        }
        const { items, shippingCountry, itemsTotal, shippingCost } = await request.json();

        if (!items || items.length === 0) {
            return Response.json({ error: "No items provided" }, { status: 400 });
        }

        // Get shipping countries for display name
        const shippingCountries = getAllShippingCountries();
        const selectedShipping = shippingCountries.find(c => c.code === shippingCountry);

        console.log("Checkout request:", {
            itemsCount: items.length,
            itemsTotal: itemsTotal,
            shippingCost: shippingCost,
            shippingCountry: shippingCountry
        });

        // Create Stripe checkout session
        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
        const session = await stripe.checkout.sessions.create({
            payment_method_types: [
                "card",
                "paypal",
                "bancontact",
                "ideal"
            ],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: "GRBT Order",
                            description: `Items: ${items.map((item: any) => `${item.city} Tişört (${item.color}, ${item.size})`).join(', ')}`,
                        },
                        unit_amount: Math.round(itemsTotal * 100), // Convert to cents
                    },
                    quantity: 1,
                }
            ],
            shipping_options: [{
                shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                        amount: Math.round(shippingCost * 100), // Convert to cents
                        currency: 'eur',
                    },
                    display_name: shippingCost === 0
                        ? `Free Shipping to ${selectedShipping?.name || 'Selected Country'}`
                        : `Shipping to ${selectedShipping?.name || 'Selected Country'}`,
                    delivery_estimate: {
                        minimum: {
                            unit: 'business_day',
                            value: selectedShipping?.estimatedDays.includes('1-2') ? 1 : 2,
                        },
                        maximum: {
                            unit: 'business_day',
                            value: selectedShipping?.estimatedDays.includes('5-7') ? 7 : 5,
                        },
                    },
                },
            }],
            mode: "payment",
            // Collect customer email
            customer_creation: "always",
            // Enable coupon codes in Stripe checkout
            allow_promotion_codes: true,
            // Pre-select the country to prevent shipping manipulation
            shipping_address_collection: {
                allowed_countries: shippingCountry ? [shippingCountry] : ['NL', 'DE', 'FR', 'CH', 'AT', 'GB', 'US', 'BE'],
            },
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
        });

        console.log("Stripe session created successfully:", session.id);
        return Response.json({ url: session.url });
    } catch (error) {
        console.error("Stripe error details:", error);
        return Response.json(
            { error: `Payment processing failed: ${error}` },
            { status: 500 }
        );
    }
}
