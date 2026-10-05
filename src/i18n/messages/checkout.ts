import { defineMessages } from "../define";

// Checkout page (app/checkout/page.tsx). This page had English-only copy; tr is a new translation.
export default defineMessages({
    en: {
        checkoutFailed: "Checkout failed. Please check payment configuration and try again.",
        empty: "Your cart is empty",
        browse: "Browse Collection",
        title: "Checkout",
        orderSummary: "Order Summary",
        payment: "Payment",
        processing: "Processing...",
        payWithStripe: "Pay with Stripe",
        securePayment: "Secure payment powered by Stripe",
    },
    de: {
        checkoutFailed:
            "Der Bezahlvorgang ist fehlgeschlagen. Bitte überprüfen Sie die Zahlungskonfiguration und versuchen Sie es erneut.",
        empty: "Ihr Warenkorb ist leer",
        browse: "Kollektion ansehen",
        title: "Kasse",
        orderSummary: "Bestellübersicht",
        payment: "Zahlung",
        processing: "Wird verarbeitet...",
        payWithStripe: "Mit Stripe bezahlen",
        securePayment: "Sichere Zahlung über Stripe",
    },
    fr: {
        checkoutFailed: "Le paiement a échoué. Veuillez vérifier la configuration du paiement et réessayer.",
        empty: "Votre panier est vide",
        browse: "Parcourir la collection",
        title: "Validation de la commande",
        orderSummary: "Récapitulatif de la commande",
        payment: "Paiement",
        processing: "Traitement en cours...",
        payWithStripe: "Payer avec Stripe",
        securePayment: "Paiement sécurisé par Stripe",
    },
    tr: {
        checkoutFailed: "Ödeme başarısız. Lütfen ödeme yapılandırmasını kontrol edip tekrar deneyin.",
        empty: "Sepetiniz boş",
        browse: "Koleksiyonu Keşfet",
        title: "Ödeme",
        orderSummary: "Sipariş Özeti",
        payment: "Ödeme",
        processing: "İşleniyor...",
        payWithStripe: "Stripe ile öde",
        securePayment: "Stripe ile güvenli ödeme",
    },
});
