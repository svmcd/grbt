// Checks for the pure admin helpers: address splitting for the label export, the CSV formula
// guard, paid statuses and the address length check.
// Run: npx tsx scripts/test-admin-edge-cases.ts
import { splitStreet } from "../src/lib/admin/labels";
import { toCsv } from "../src/lib/admin/metrics";
import { addressTooLong, isPaidStatus, normalizeOrder } from "../src/lib/admin/orders";
import { orderNumber } from "../src/lib/order-number";

let failed = 0;
const check = (name: string, got: unknown, want: unknown) => {
    const ok = JSON.stringify(got) === JSON.stringify(want);
    if (!ok) failed++;
    console.log(`${ok ? "ok  " : "FAIL"} ${name}${ok ? "" : `\n     got  ${JSON.stringify(got)}\n     want ${JSON.stringify(want)}`}`);
};

// splitStreet: "street|number|addition"
const streets: [string, string][] = [
    ["Vrijheidweg 22", "Vrijheidweg|22|"],
    ["Straat 12-A", "Straat|12|A"],
    ["1e Jan Steenstraat 3 hs", "1e Jan Steenstraat|3|hs"],
    ["Hauptstraße 5a", "Hauptstraße|5|a"],
    ["Plein 1944 2", "Plein 1944|2|"],
    ["Laan 1940-1945 12", "Laan 1940-1945|12|"],
    ["221 Baker St", "Baker St|221|"],
    ["Apt 4B, 221 Baker St", "Baker St|221|Apt 4B"],
    ["Atatürk Cad. No: 15 D: 3", "Atatürk Cad.|15|D: 3"],
    ["Rue de la Paix", "Rue de la Paix||"],
    ["PO Box 123", "PO Box|123|"],
    // earlier behaviour that must hold
    ["Vrijheidweg 22A", "Vrijheidweg|22|A"],
    ["Vrijheidweg 22-3", "Vrijheidweg|22|3"],
    ["Hauptstr. 5 a", "Hauptstr.|5|a"],
    ["Rue de la Paix 12 bte 3", "Rue de la Paix|12|bte 3"],
    ["12 rue de la Paix", "rue de la Paix|12|"],
    ["12b, Rue X", "Rue X|12|b"],
    ["  ", "||"],
];
for (const [input, want] of streets) {
    const p = splitStreet(input);
    check(`splitStreet ${JSON.stringify(input)}`, `${p.street}|${p.houseNumber}|${p.addition}`, want);
}

// CSV formula guard: phone numbers stay as they are, formulas get a leading '
const csv = (v: string) => toCsv([[v]]).slice(1);
check("csv phone +31", csv("+31 6 12345678"), "+31 6 12345678");
check("csv phone brackets", csv("+90 (532) 123-45-67"), "+90 (532) 123-45-67");
check("csv formula =", csv("=HYPERLINK(\"x\")"), `"'=HYPERLINK(""x"")"`);
check("csv formula +cmd", csv("+cmd|' /C calc'!A0"), "'+cmd|' /C calc'!A0");
check("csv formula -", csv("-2+3+cmd"), "'-2+3+cmd");
check("csv @", csv("@SUM(1)"), "'@SUM(1)");
check("csv short +12", csv("+12"), "'+12");

// Paid statuses
check("paid", isPaidStatus("paid"), true);
check("no_payment_required", isPaidStatus("no_payment_required"), true);
check("unpaid", isPaidStatus("unpaid"), false);
const free = normalizeOrder("cs_test_abcdefgh12345678", { payment_status: "no_payment_required", amount_total: 0, line_items: [] });
check("100% promo order is paid", free.payment.status, "paid");
const refunded = normalizeOrder("cs_x", { payment_status: "paid", amount_total: 3000, refunded_amount: 3000 });
check("fully refunded", refunded.payment.status, "refunded");

// Order number: same derivation as the admin number
check("orderNumber", orderNumber("cs_live_a1b2c3d4e5f6g7h8"), "E5F6G7H8");
check("orderNumber = admin number", free.number, orderNumber("cs_test_abcdefgh12345678"));

// Address length check
check("address ok", addressTooLong({ line1: "Vrijheidweg 22", city: "Wormerveer" }), null);
check("address too long", addressTooLong({ line1: "x".repeat(201) }), "Address is 201 characters; the limit is 200.");
check("postal code too long", addressTooLong({ postalCode: "1".repeat(21) }), "Postal code is 21 characters; the limit is 20.");

console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
