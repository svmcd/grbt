import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";

async function verifyAuth(request: NextRequest) {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7);
    try {
        const decodedToken = await adminAuth.verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    const user = await verifyAuth(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Get orders from Firebase (only non-deleted orders) using Admin SDK
        const ordersRef = adminDb.collection('orders');
        const snapshot = await ordersRef.get();

        const orders: any[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Only include orders that are not deleted
            if (!data.deleted || data.deleted === false) {
                orders.push({
                    id: doc.id,
                    ...data
                });
            }
        });

        console.log(`✅ Loaded ${orders.length} orders from Firebase`);
        return NextResponse.json(orders);
    } catch (error) {
        console.error("❌ Error fetching Firebase orders:", error);
        // Temporarily return empty array instead of error to test Firebase Admin SDK
        console.log("🔄 Returning empty array due to Firebase error");
        return NextResponse.json([]);
    }
}

export async function POST(request: NextRequest) {
    const user = await verifyAuth(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { action, orderId, data } = await request.json();

        const orderRef = adminDb.collection('orders').doc(orderId);

        switch (action) {
            case 'update':
                await orderRef.update({
                    ...data,
                    updated_at: new Date().toISOString()
                });
                break;

            case 'delete':
                await orderRef.update({
                    deleted: true,
                    deleted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
                break;

            case 'create':
                await orderRef.set({
                    ...data,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
                break;

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: `Order ${orderId} ${action} operation completed`
        });
    } catch (error) {
        console.error("Error processing Firebase order action:", error);
        return NextResponse.json({ error: "Failed to process order action" }, { status: 500 });
    }
}
