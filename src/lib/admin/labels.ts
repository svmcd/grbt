// Shipping-label export: one row per order with the address split the way label tools ask for it.
// The column names are our own plain names (not a carrier's official import template); map them
// once in the label tool's CSV import.
import type { AdminOrder } from "./orders";

export type StreetParts = { street: string; houseNumber: string; addition: string };

// One short addition after the house number: "A", "hs", "bis", "3", "3B", "D: 3", "bte 3"
const ADDITION = String.raw`[a-zA-Z]{1,4}[.:]?(?:\s*\d{1,4}[a-zA-Z]?)?|\d{1,4}[a-zA-Z]?|[a-zA-Z]\d{1,3}`;
// Street (ending in a letter or dot) + number + optional addition: "Vrijheidweg 22", "Straat 12-A",
// "Hauptstraße 5a", "Hauptstr. 5 a", "1e Jan Steenstraat 3 hs", "Rue de la Paix 12 bte 3", "PO Box 123"
const NUMBER_LAST = new RegExp(String.raw`^(.*?[^\d\s,])[\s,]+(\d+)(?:\s*[-/]\s*(${ADDITION})|\s*(${ADDITION}))?$`);
// The street name itself ends in a number ("Plein 1944 2", "Laan 1940-1945 12"): the last number is the house number
const NUMBER_LAST_GREEDY = /^(.*[^\s,])[\s,]+(\d+)([a-zA-Z]{1,2})?$/;
// "12 rue de la Paix", "221 Baker St", "12b, Rue X" (not ordinals: "1e Jan Steenstraat", "2nd Avenue")
const NUMBER_FIRST = /^(\d+)([a-zA-Z]{1,2})?[\s,]+(.+)$/;
const ORDINAL = /^(e|de|ste|st|nd|rd|th|er)$/i;
// Turkish (and German "Nr.") style: "Atatürk Cad. No: 15 D: 3", "Hauptstraße Nr. 5"
const NUMBER_MARKED = /^(.+?)[\s,]+(?:No|Nr|N°|Nº)\s*[.:]?\s*(\d+)([a-zA-Z](?![a-zA-Z]))?[\s,/]*(.*)$/i;
// A comma-separated part that is a flat or unit, not the street: "Apt 4B", "Suite 200", "Daire 5", "#12"
const UNIT_PART = /^(?:(?:apt|apartment|appt|app|unit|suite|flat|floor|room|bldg|building|daire|kat|wohnung|whg|etage)\b\.?|#)\s*\S/i;

// Splits address line 1 into street, house number and addition. When the line does not look like
// "street + number" it is returned whole as the street, so nothing gets lost.
export function splitStreet(line1: string): StreetParts {
    const s = line1.trim().replace(/\s+/g, " ");
    if (!s) return { street: "", houseNumber: "", addition: "" };

    // "Apt 4B, 221 Baker St": the unit goes to the addition, the rest is parsed as the street
    const parts = s.split(/\s*,\s*/);
    const units = parts.length > 1 ? parts.filter((p) => UNIT_PART.test(p)) : [];
    const rest = units.length && units.length < parts.length ? parts.filter((p) => !units.includes(p)).join(", ") : s;
    const core = splitCore(rest);
    if (!core) return { street: s, houseNumber: "", addition: "" };
    return units.length && rest !== s ? { ...core, addition: [core.addition, ...units].filter(Boolean).join(", ") } : core;
}

function splitCore(s: string): StreetParts | null {
    const parts = (street: string, houseNumber: string, addition = ""): StreetParts => ({ street: street.trim(), houseNumber, addition: addition.trim() });

    const marked = s.match(NUMBER_MARKED);
    if (marked) return parts(marked[1], marked[2], [marked[3], marked[4]].filter(Boolean).join(" "));

    const last = s.match(NUMBER_LAST);
    // A year in the street name ("Plein 1944 2") reads as number 1944 + addition 2: the last
    // number is the house number instead
    const yearInStreet = last && last[2].length >= 4 && /^\d+$/.test(last[4] || "");
    if (last && !yearInStreet) return parts(last[1], last[2], last[3] || last[4] || "");
    const greedy = s.match(NUMBER_LAST_GREEDY);
    if (greedy) return parts(greedy[1], greedy[2], greedy[3] || "");

    const first = s.match(NUMBER_FIRST);
    if (first && !(first[2] && ORDINAL.test(first[2]))) return parts(first[3], first[1], first[2] || "");
    return null;
}

export function labelCsvRows(orders: AdminOrder[]) {
    const head = [
        "Reference",
        "Recipient name",
        "Company",
        "Street",
        "House number",
        "House number addition",
        "Address line 2",
        "Postal code",
        "City",
        "Country code",
        "Email",
        "Phone",
        "Weight (grams)",
    ];
    const rows = orders.map((o) => {
        const s = o.shipping;
        const parts = splitStreet(s.line1);
        return [
            o.number,
            s.name || o.customer.name,
            "",
            parts.street,
            parts.houseNumber,
            parts.addition,
            s.line2,
            s.postalCode,
            s.city,
            (s.country || "").toUpperCase(),
            o.customer.email,
            s.phone || o.customer.phone,
            "", // filled in per parcel
        ];
    });
    return [head, ...rows];
}
