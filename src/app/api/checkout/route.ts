import Stripe from "stripe";
import { getAllShippingCountries, getShippingPrice } from "@/lib/shipping";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const stripe = STRIPE_SECRET_KEY
    ? new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2024-12-18.acacia" })
    : (null as any);

export async function POST(request: Request) {
    try {
        if (!STRIPE_SECRET_KEY || !stripe) {
            return Response.json(
                { error: "Stripe secret key not configured" },
                { status: 500 }
            );
        }
        const { items, shippingCountry } = await request.json();

        if (!items || items.length === 0) {
            return Response.json({ error: "No items provided" }, { status: 400 });
        }

        // Calculate total items cost
        const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        // Calculate shipping cost
        const shippingCountries = getAllShippingCountries();
        const selectedShipping = shippingCountries.find(c => c.code === shippingCountry);
        const baseShippingCost = getShippingPrice(shippingCountry);

        // Apply free shipping for orders over €100
        const shippingCost = itemsTotal >= 100 ? 0 : baseShippingCost;

        // Create Stripe checkout session
        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
        const session = await stripe.checkout.sessions.create({
            payment_method_types: [
                "card",
                "paypal",
                "bancontact",
                "ideal"
            ],
            line_items: items.map((item: any) => {
                const image = typeof item.image === "string" ? item.image : "";
                const imageUrl = image.startsWith("http")
                    ? image
                    : baseUrl && image
                        ? `${baseUrl}${image.startsWith("/") ? image : `/${image}`}`
                        : undefined;
                const baseDescription = `${item.color} • ${item.size} • ${item.city} Tişört`;
                const personalizationDesc = item.personalization
                    ? ` • ${item.personalization.method === "printed" ? "Baskı" : "İşleme"} • "${item.personalization.text}" • ${item.personalization.placement} • Font: ${item.personalization.font} • Renk: ${item.personalization.color}`
                    : "";
                const giftPackageDesc = item.giftPackage
                    ? ` • Hediye Paketi${item.giftPackage.message ? ` • Mesaj: "${item.giftPackage.message}"` : ""}`
                    : "";

                return ({
                    price_data: {
                        currency: "eur",
                        product_data: {
                            name: `${item.city} Tee`,
                            description: baseDescription + personalizationDesc + giftPackageDesc,
                            ...(imageUrl ? { images: [imageUrl] } : {}),
                        },
                        unit_amount: item.price * 100, // Convert to cents
                    },
                    quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
                })
            }),
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
            // Pre-select the country to prevent shipping manipulation
            shipping_address_collection: {
                allowed_countries: shippingCountry ? [shippingCountry] : ['NL', 'DE', 'FR', 'CH', 'AT', 'GB', 'US', 'BE'],
            },
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout`,
        });

        return Response.json({ url: session.url });
    } catch (error) {
        console.error("Stripe error:", error);
        return Response.json(
            { error: "Payment processing failed" },
            { status: 500 }
        );
    }
}
