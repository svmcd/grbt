import Stripe from "stripe";
import { getAllShippingCountries } from "@/lib/shipping";

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
        const { items, shippingCountry, itemsTotal, itemsSubtotal, discount, shippingCost } = await request.json();

        if (!items || items.length === 0) {
            return Response.json({ error: "No items provided" }, { status: 400 });
        }

        // Get shipping countries for display name
        const shippingCountries = getAllShippingCountries();
        const selectedShipping = shippingCountries.find(c => c.code === shippingCountry);

        // Calculate total from all items (before discount)
        const calculatedSubtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const discountAmount = discount || 0;
        const expectedTotal = calculatedSubtotal - discountAmount;

        console.log("Checkout request:", {
            itemsCount: items.length,
            itemsTotal: itemsTotal,
            itemsSubtotal: itemsSubtotal,
            calculatedSubtotal: calculatedSubtotal,
            discount: discountAmount,
            expectedTotal: expectedTotal,
            shippingCost: shippingCost,
            shippingCountry: shippingCountry,
        });

        // Create Stripe checkout session
        // Apply discount to last item to keep clean prices on others
        const remainingDiscount = discountAmount || 0;
        const lineItems = items.map((item: any, index: number) => {
            let finalPrice = item.price;

            // Apply all discount to the last item to keep other prices clean
            if (index === items.length - 1 && remainingDiscount > 0) {
                // Apply discount per unit to last item
                const discountPerUnit = remainingDiscount / item.quantity;
                finalPrice = item.price - discountPerUnit;
                // Round to 2 decimals
                finalPrice = Math.round(finalPrice * 100) / 100;
            }

            return {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: `${item.city} ${item.productType === "hoodie" ? "Hoodie" : item.productType === "sweater" ? "Sweater" : "Tişört"} - ${item.color}, ${item.size}${item.personalization ? ` - ${item.personalization.method === 'printed' ? 'Baskı' : 'İşleme'}: "${item.personalization.text}" - ${item.personalization.placement} - Font: ${item.personalization.font} - Renk: ${item.personalization.color}` : ''}${item.giftPackage?.included ? ' - Hediye Paketi' : ''}`,
                        description: `${item.productType === "hoodie" ? "Hoodie" : item.productType === "sweater" ? "Sweater" : "Tişört"}, ${item.color}, ${item.size}${item.personalization ? ` - ${item.personalization.method === 'printed' ? 'Baskı' : 'İşleme'}: "${item.personalization.text}" - ${item.personalization.placement} - Font: ${item.personalization.font} - Renk: ${item.personalization.color}` : ''}${item.giftPackage?.included ? ' - Hediye Paketi' : ''}`,
                    },
                    unit_amount: Math.round(finalPrice * 100),
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: [
                "card",
                "paypal",
                "bancontact",
                "ideal"
            ],
            line_items: lineItems,
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
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
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
