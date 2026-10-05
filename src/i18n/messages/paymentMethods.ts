import { defineMessages } from "../define";

type Labels = Record<string, { name: string; description: string }>;

// Display labels for lib/payment-methods.ts, keyed by payment method id
export default defineMessages<Labels>({
    en: {
        card: { name: "Credit Card", description: "Visa, Mastercard, American Express" },
        apple_pay: { name: "Apple Pay", description: "Pay with Touch ID or Face ID" },
        paypal: { name: "PayPal", description: "Pay with your PayPal account" },
        bancontact: { name: "Bancontact", description: "Belgian bank transfer" },
        ideal: { name: "iDEAL", description: "Dutch bank transfer" },
        revolut_pay: { name: "Revolut Pay", description: "Pay with Revolut" },
    },
    de: {
        card: { name: "Kreditkarte", description: "Visa, Mastercard, American Express" },
        apple_pay: { name: "Apple Pay", description: "Mit Touch ID oder Face ID bezahlen" },
        paypal: { name: "PayPal", description: "Mit Ihrem PayPal-Konto bezahlen" },
        bancontact: { name: "Bancontact", description: "Belgische Banküberweisung" },
        ideal: { name: "iDEAL", description: "Niederländische Banküberweisung" },
        revolut_pay: { name: "Revolut Pay", description: "Mit Revolut bezahlen" },
    },
    fr: {
        card: { name: "Carte bancaire", description: "Visa, Mastercard, American Express" },
        apple_pay: { name: "Apple Pay", description: "Payez avec Touch ID ou Face ID" },
        paypal: { name: "PayPal", description: "Payez avec votre compte PayPal" },
        bancontact: { name: "Bancontact", description: "Virement bancaire belge" },
        ideal: { name: "iDEAL", description: "Virement bancaire néerlandais" },
        revolut_pay: { name: "Revolut Pay", description: "Payez avec Revolut" },
    },
    tr: {
        card: { name: "Kredi Kartı", description: "Visa, Mastercard, American Express" },
        apple_pay: { name: "Apple Pay", description: "Touch ID veya Face ID ile ödeyin" },
        paypal: { name: "PayPal", description: "PayPal hesabınızla ödeyin" },
        bancontact: { name: "Bancontact", description: "Belçika banka havalesi" },
        ideal: { name: "iDEAL", description: "Hollanda banka havalesi" },
        revolut_pay: { name: "Revolut Pay", description: "Revolut ile ödeyin" },
    },
});
