// Writes the payment method logos shown on the product page, in the cart and in the footer
// to public/payment-logos/*.svg. The artwork comes unchanged from two maintained npm packages:
//   @iconify-icons/logos (Gil Barbara's SVG Logos, CC0): Visa, Mastercard, American Express, Apple Pay
//   react-pay-icons (MIT): PayPal, iDEAL, Bancontact, Klarna
// They are served as separate files and shown with <img>, so the ids inside each SVG
// (gradients, clip paths) can never clash with each other or with the page.
//
// Run after updating either package: npm run payment-logos
import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const outDir = path.join(process.cwd(), "public", "payment-logos");
fs.mkdirSync(outDir, { recursive: true });

const write = (name, svg) => {
    const file = path.join(outDir, `${name}.svg`);
    fs.writeFileSync(file, svg.startsWith("<?xml") ? svg : svg + "\n");
    console.log("wrote", path.relative(process.cwd(), file));
};

// Iconify icon data → standalone SVG
const iconify = {
    visa: "@iconify-icons/logos/visa",
    mastercard: "@iconify-icons/logos/mastercard",
    amex: "@iconify-icons/logos/amex",
    "apple-pay": "@iconify-icons/logos/apple-pay",
};
for (const [name, spec] of Object.entries(iconify)) {
    const { default: icon } = await import(spec);
    const left = icon.left ?? 0;
    const top = icon.top ?? 0;
    write(
        name,
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${left} ${top} ${icon.width} ${icon.height}" width="${icon.width}" height="${icon.height}">${icon.body}</svg>`
    );
}

// react-pay-icons components → static SVG markup
const components = {
    paypal: "react-pay-icons/PaypalTransparent",
    ideal: "react-pay-icons/Ideal",
    bancontact: "react-pay-icons/Bancontact",
    klarna: "react-pay-icons/Klarna",
};
for (const [name, spec] of Object.entries(components)) {
    const { default: Icon } = await import(spec);
    write(name, renderToStaticMarkup(createElement(Icon, {})));
}
