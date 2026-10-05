import Stripe from "stripe";
import { getAllShippingCountries } from "@/lib/shipping";
import { intlLocales, isLocale, type Locale } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import common from "@/i18n/messages/common";
import emails from "@/i18n/messages/emails";
import { checkoutItemMetadata, countryName, describeCheckoutItem } from "@/lib/emails/line-items";

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
        const { items, shippingCountry, discount, shippingCost, locale: requestedLocale } = await request.json();
        const locale: Locale = isLocale(requestedLocale) ? requestedLocale : await getLocale();
        const ship = emails[locale].lineItem;

        if (!items || items.length === 0) {
            return Response.json({ error: "No items provided" }, { status: 400 });
        }

        // Get shipping countries for display name
        const shippingCountries = getAllShippingCountries();
        const selectedShipping = shippingCountries.find(c => c.code === shippingCountry);
        const shippingCountryName =
            countryName(selectedShipping?.code, selectedShipping?.name, intlLocales[locale]) || ship.selectedCountry;

        // discount is in euros, convert to cents
        const discountAmountCents = (discount || 0) * 100;

        // Create Stripe checkout session
        // Apply discount to last item to keep clean prices on others
        const remainingDiscount = discountAmountCents || 0;
        const lineItems = items.map((item: any, index: number) => {
            let finalPrice = item.price; // Already in cents

            // Apply all discount to the last item to keep other prices clean
            if (index === items.length - 1 && remainingDiscount > 0) {
                // Apply discount per unit to last item
                const discountPerUnit = Math.round(remainingDiscount / item.quantity);
                finalPrice = item.price - discountPerUnit;
                // Ensure price doesn't go negative
                finalPrice = Math.max(0, finalPrice);
            }

            const text = describeCheckoutItem(item, locale);

            return {
                price_data: {
                    currency: "eur",
                    product_data: {
                        name: text.name,
                        description: text.description,
                        // Lets the webhook store the Turkish name for the admin dashboard
                        metadata: checkoutItemMetadata(item),
                    },
                    unit_amount: Math.round(finalPrice), // finalPrice is already in cents
                },
                quantity: item.quantity,
            };
        });

        // Collect all gift messages for metadata (read by the shop, so always Turkish)
        const trTypes = common.tr.productTypes;
        const giftMessages: string[] = [];
        items.forEach((item: any) => {
            if (item.giftPackage?.included && item.giftPackage?.message) {
                const productName = `${item.city} ${item.productType === "hoodie" ? trTypes.hoodie : item.productType === "sweater" ? trTypes.sweater : trTypes.tshirt}`;
                const variant = `${item.color}, ${item.size}`;
                giftMessages.push(`${productName} (${variant}): "${item.giftPackage.message}"`);
            }
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
                        ? ship.freeShippingTo(shippingCountryName)
                        : ship.shippingTo(shippingCountryName),
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
            // Stripe Checkout page language
            locale,
            // Gift messages (Turkish, for the shop) and the customer's language for emails
            metadata: {
                ...(giftMessages.length > 0 ? { gift_messages: giftMessages.join(' | ') } : {}),
                locale,
            },
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/`,
        });

        return Response.json({ url: session.url });
    } catch (error) {
        console.error("Stripe error details:", error);
        return Response.json(
            { error: `Payment processing failed: ${error}` },
            { status: 500 }
        );
    }
}
