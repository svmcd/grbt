// One-off: gives every order document an `order_number` field (the number customers see: the last
// 8 characters of the Stripe session id, uppercased, as in src/lib/order-number.ts), so /api/track
// can find an order with one indexed query instead of reading the whole collection.
//
// Additive only: writes `order_number` on documents that do not have it (or have a different
// value) and touches no other field.
//
// Dry run first:  node --env-file=.env.local scripts/backfill-order-number.mjs --dry
// Then for real:  node --env-file=.env.local scripts/backfill-order-number.mjs

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const dry = process.argv.includes("--dry");

const app = initializeApp({
    credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    projectId: process.env.FIREBASE_PROJECT_ID,
});
const db = getFirestore(app);

// Same as orderNumber() in src/lib/order-number.ts and `number` in src/lib/admin/orders.ts
const orderNumber = (id) => String(id).slice(-8).toUpperCase();

const snap = await db.collection("orders").get();
let alreadySet = 0;
const toWrite = [];
for (const doc of snap.docs) {
    const data = doc.data();
    const want = orderNumber(data.stripe_id || doc.id);
    if (data.order_number === want) alreadySet++;
    else toWrite.push({ ref: doc.ref, id: doc.id, before: data.order_number, want });
}

// Two orders with the same number would both be returned by the track query (the email then
// decides); list them so they can be checked
const byNumber = new Map();
for (const doc of snap.docs) {
    const n = orderNumber(doc.data().stripe_id || doc.id);
    byNumber.set(n, [...(byNumber.get(n) || []), doc.id]);
}
const duplicates = [...byNumber].filter(([, ids]) => ids.length > 1);

console.log(`orders: ${snap.size}`);
console.log(`already have order_number: ${alreadySet}`);
console.log(`${dry ? "would write" : "writing"} order_number: ${toWrite.length}`);
const changed = toWrite.filter((w) => w.before !== undefined);
if (changed.length) console.log(`  of which have a different order_number now: ${changed.map((w) => `${w.id} (${w.before} → ${w.want})`).join(", ")}`);
console.log(`numbers shared by more than one order: ${duplicates.length}${duplicates.length ? ` (${duplicates.map(([n, ids]) => `${n}: ${ids.join(" + ")}`).join("; ")})` : ""}`);

if (!dry && toWrite.length) {
    // Firestore allows 500 writes per batch
    for (let i = 0; i < toWrite.length; i += 400) {
        const batch = db.batch();
        for (const w of toWrite.slice(i, i + 400)) batch.update(w.ref, { order_number: w.want });
        await batch.commit();
    }
    const after = await db.collection("orders").get();
    const missing = after.docs.filter((d) => d.data().order_number !== orderNumber(d.data().stripe_id || d.id)).length;
    console.log(`done. orders without the right order_number now: ${missing}`);
}
