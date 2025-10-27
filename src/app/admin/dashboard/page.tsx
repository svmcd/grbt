"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  collection,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

interface WaitlistUser {
  id: string;
  email: string;
  timestamp: unknown;
  source: string;
}

interface Order {
  id: string;
  amount_total: number;
  customer_email: string;
  payment_status: string;
  status?: string;
  created: number;
  shipping_details?: {
    name: string;
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
    address?: {
      line1: string;
      line2?: string;
      city: string;
      postal_code: string;
      country: string;
    };
  };
  line_items: any[];
  shipped: boolean;
  custom_flag?: string;
  notes?: string;
  customer_name?: string;
  customer_phone?: string;
  label_created?: boolean;
  shipped_out?: boolean;
  tracking_provider?: "DHL" | "PostNL" | null;
  tracking_code?: string | null;
}

interface EditingField {
  orderId: string;
  field: string;
  value: string;
}

// Create Order Form Component
function CreateOrderForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (data: Partial<Order>) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    customer_email: "",
    amount_total: "",
    payment_status: "paid",
    status: "complete",
    shipping_details: {
      name: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        postal_code: "",
        country: "NL",
      },
    },
    line_items: [
      {
        description: "",
        quantity: 1,
        amount_total: "",
      },
    ],
    custom_flag: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: `manual_${Date.now()}`,
      customer_email: formData.customer_email,
      amount_total: Math.round(parseFloat(formData.amount_total) * 100), // Convert to cents
      payment_status: formData.payment_status,
      status: formData.status,
      created: Math.floor(Date.now() / 1000),
      shipping_details: formData.shipping_details,
      line_items: formData.line_items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        amount_total: Math.round(parseFloat(item.amount_total) * 100),
      })),
      custom_flag: formData.custom_flag,
      notes: formData.notes,
      shipped: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">E-posta</label>
          <input
            type="email"
            value={formData.customer_email}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                customer_email: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
            required
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">
            Toplam Tutar (€)
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.amount_total}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amount_total: e.target.value }))
            }
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">
            Ödeme Durumu
          </label>
          <select
            value={formData.payment_status}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                payment_status: e.target.value,
              }))
            }
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-white/50"
          >
            <option value="paid">Ödendi</option>
            <option value="unpaid">Ödenmedi</option>
          </select>
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">Durum</label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-white/50"
          >
            <option value="complete">Tamamlandı</option>
            <option value="open">Açık</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-white/70 text-sm mb-2">
          Teslimat Bilgileri
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Ad Soyad"
            value={formData.shipping_details.name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                shipping_details: {
                  ...prev.shipping_details,
                  name: e.target.value,
                },
              }))
            }
            className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
          />
          <input
            type="text"
            placeholder="Adres"
            value={formData.shipping_details.address.line1}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                shipping_details: {
                  ...prev.shipping_details,
                  address: {
                    ...prev.shipping_details.address,
                    line1: e.target.value,
                  },
                },
              }))
            }
            className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
          />
          <input
            type="text"
            placeholder="Şehir"
            value={formData.shipping_details.address.city}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                shipping_details: {
                  ...prev.shipping_details,
                  address: {
                    ...prev.shipping_details.address,
                    city: e.target.value,
                  },
                },
              }))
            }
            className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
          />
          <input
            type="text"
            placeholder="Posta Kodu"
            value={formData.shipping_details.address.postal_code}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                shipping_details: {
                  ...prev.shipping_details,
                  address: {
                    ...prev.shipping_details.address,
                    postal_code: e.target.value,
                  },
                },
              }))
            }
            className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-white/70 text-sm mb-2">
          Ürün Açıklaması
        </label>
        <input
          type="text"
          placeholder="Örn: Kayseri Tişört - siyah, M"
          value={formData.line_items[0].description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              line_items: [
                { ...prev.line_items[0], description: e.target.value },
              ],
            }))
          }
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-white/70 text-sm mb-2">
            Özel Bayrak
          </label>
          <input
            type="text"
            placeholder="VIP, Öncelikli, vb."
            value={formData.custom_flag}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, custom_flag: e.target.value }))
            }
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
          />
        </div>
        <div>
          <label className="block text-white/70 text-sm mb-2">Notlar</label>
          <input
            type="text"
            placeholder="Özel notlar..."
            value={formData.notes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notes: e.target.value }))
            }
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
          />
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 text-white border border-white/30 rounded hover:bg-white/10 transition-colors"
        >
          İptal
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
        >
          Sipariş Oluştur
        </button>
      </div>
    </form>
  );
}

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [waitlistUsers, setWaitlistUsers] = useState<WaitlistUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<WaitlistUser[]>([]);
  const [allUsers, setAllUsers] = useState<WaitlistUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"waitlist" | "orders">("orders");

  // Order management states
  const [editingField, setEditingField] = useState<EditingField | null>(null);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [showOrderModal, setShowOrderModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState<string | null>(null);
  const [flagInputValue, setFlagInputValue] = useState("");
  const [showEditOrderModal, setShowEditOrderModal] = useState<string | null>(
    null
  );
  const [editOrderData, setEditOrderData] = useState<Partial<Order>>({});
  const [currentOrderPage, setCurrentOrderPage] = useState(1);
  const [showLabelModal, setShowLabelModal] = useState<string | null>(null);
  const [showShippedModal, setShowShippedModal] = useState<string | null>(null);
  const [trackingProvider, setTrackingProvider] = useState<
    "DHL" | "PostNL" | ""
  >("");
  const [trackingCode, setTrackingCode] = useState("");

  const USERS_PER_PAGE = 10;
  const ORDERS_PER_PAGE = 10;

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const token = await user?.getIdToken();
      return fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
    },
    [user]
  );

  // Order management functions (local state only for now)

  const dedupeByEmail = (users: WaitlistUser[]) => {
    const seenEmails = new Set<string>();
    return users.filter((u) => {
      const normalized =
        typeof u.email === "string" ? u.email.trim().toLowerCase() : "";
      if (!normalized) return false;
      if (seenEmails.has(normalized)) return false;
      seenEmails.add(normalized);
      return true;
    });
  };

  // Temporarily disable authentication redirect for testing
  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push("/admin");
  //   }
  // }, [user, loading, router]);

  // Fetch all users for search functionality
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setUsersLoading(true);
        const waitlistRef = collection(db, "waitlist");
        const q = query(waitlistRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const users: WaitlistUser[] = [];
        querySnapshot.forEach((doc) => {
          users.push({
            id: doc.id,
            ...doc.data(),
          } as WaitlistUser);
        });

        const deduped = dedupeByEmail(users);
        setAllUsers(deduped);
        setTotalUsers(deduped.length);
      } catch (error) {
        console.error("Error fetching all users:", error);
      } finally {
        setUsersLoading(false);
      }
    };

    // Temporarily bypass user check for testing
    // if (user) {
    fetchAllUsers();
    // }
  }, []); // Remove user dependency to prevent infinite loop

  // Fetch orders from Firebase
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);

        const response = await makeAuthenticatedRequest(
          "/api/admin/firebase-orders"
        );
        if (!response.ok) {
          throw new Error(
            `Failed to fetch Firebase orders: ${response.status}`
          );
        }

        const firebaseOrders = await response.json();
        setOrders(firebaseOrders);
      } catch {
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [user, makeAuthenticatedRequest]);

  // Derive current page users from deduped allUsers
  useEffect(() => {
    if (!user) return;
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const pageSlice = allUsers.slice(startIndex, endIndex);
    setWaitlistUsers(pageSlice);
    setHasNextPage(endIndex < totalUsers);
    setHasPrevPage(currentPage > 1);
  }, [allUsers, currentPage, totalUsers, user]);

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredUsers([]);
      setIsSearching(false);
    } else {
      const filtered = allUsers.filter((user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
      setIsSearching(true);
    }
  }, [allUsers, searchTerm]);

  const handleNextPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasNextPage) {
      const scrollPosition = window.scrollY;
      setCurrentPage((prev) => prev + 1);
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 0);
    }
  };

  const handlePrevPage = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasPrevPage) {
      const scrollPosition = window.scrollY;
      setCurrentPage((prev) => prev - 1);
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 0);
    }
  };

  const handleLogout = async () => {
    // Mock logout function
    router.push("/admin");
  };

  // Order management functions
  const startEditing = (
    orderId: string,
    field: string,
    currentValue: string
  ) => {
    setEditingField({ orderId, field, value: currentValue });
  };

  const saveEdit = async () => {
    if (!editingField) return;

    try {
      // Find the Firebase document for this order
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("stripe_id", "==", editingField.orderId)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const orderDoc = querySnapshot.docs[0];
        await updateDoc(orderDoc.ref, {
          [editingField.field]: editingField.value,
          updated_at: new Date(),
        });

        // Update local state
        setOrders((prev) =>
          prev.map((order) =>
            order.id === editingField.orderId
              ? { ...order, [editingField.field]: editingField.value }
              : order
          )
        );

        setEditingField(null);
        console.log(
          `Updated ${editingField.field} for order ${editingField.orderId}`
        );
      } else {
        console.error(`Order ${editingField.orderId} not found in Firebase`);
      }
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
  };

  const openFlagModal = (orderId: string, currentFlag: string) => {
    setFlagInputValue(currentFlag || "");
    setShowFlagModal(orderId);
  };

  const confirmFlagUpdate = async () => {
    if (!showFlagModal) return;

    try {
      const response = await makeAuthenticatedRequest(
        "/api/admin/firebase-orders",
        {
          method: "POST",
          body: JSON.stringify({
            action: "update",
            orderId: showFlagModal,
            data: {
              custom_flag: flagInputValue,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update flag for order ${showFlagModal}`);
      }

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === showFlagModal ? { ...o, custom_flag: flagInputValue } : o
        )
      );

      console.log(`Updated flag for order ${showFlagModal}: ${flagInputValue}`);
    } catch (error) {
      console.error("Error updating flag:", error);
    }

    setShowFlagModal(null);
    setFlagInputValue("");
  };

  const openEditOrderModal = (order: Order) => {
    setEditOrderData({
      id: order.id,
      customer_email: order.customer_email,
      amount_total: order.amount_total,
      payment_status: order.payment_status,
      status: order.status,
      shipping_details: order.shipping_details,
      line_items: order.line_items,
      shipped: order.shipped,
      custom_flag: order.custom_flag,
      notes: order.notes,
      created: order.created,
    });
    setShowEditOrderModal(order.id);
  };

  const saveOrderChanges = async () => {
    if (!showEditOrderModal) return;

    try {
      // Only include defined values to avoid Firebase errors
      const updateData: any = {};

      if (editOrderData.customer_email !== undefined)
        updateData.customer_email = editOrderData.customer_email;
      if (editOrderData.amount_total !== undefined)
        updateData.amount_total = editOrderData.amount_total;
      if (editOrderData.payment_status !== undefined)
        updateData.payment_status = editOrderData.payment_status;
      if (editOrderData.status !== undefined)
        updateData.status = editOrderData.status;
      if (editOrderData.shipping_details !== undefined)
        updateData.shipping_details = editOrderData.shipping_details;
      if (editOrderData.line_items !== undefined)
        updateData.line_items = editOrderData.line_items;
      if (editOrderData.shipped !== undefined)
        updateData.shipped = editOrderData.shipped;
      if (editOrderData.custom_flag !== undefined)
        updateData.custom_flag = editOrderData.custom_flag;
      if (editOrderData.notes !== undefined)
        updateData.notes = editOrderData.notes;
      if (editOrderData.created !== undefined)
        updateData.created = editOrderData.created;

      const response = await makeAuthenticatedRequest(
        "/api/admin/firebase-orders",
        {
          method: "POST",
          body: JSON.stringify({
            action: "update",
            orderId: showEditOrderModal,
            data: updateData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update order ${showEditOrderModal}`);
      }

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === showEditOrderModal ? { ...o, ...editOrderData } : o
        )
      );
    } catch (error) {
      console.error("Error updating order:", error);
    }

    setShowEditOrderModal(null);
    setEditOrderData({});
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/admin/firebase-orders",
        {
          method: "POST",
          body: JSON.stringify({
            action: "delete",
            orderId: orderId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete order ${orderId}`);
      }

      // Remove from local state
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setShowDeleteModal(null);

      console.log(`Order ${orderId} marked as deleted`);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  const updateOrderNotes = async (orderId: string, notes: string) => {
    try {
      const response = await makeAuthenticatedRequest(
        "/api/admin/firebase-orders",
        {
          method: "POST",
          body: JSON.stringify({
            action: "update",
            orderId: orderId,
            data: {
              notes: notes,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update notes for order ${orderId}`);
      }

      // Update local state
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, notes } : o))
      );

      console.log(`Updated notes for order ${orderId}`);
    } catch (error) {
      console.error("Error updating notes:", error);
    }
  };

  const handleLabelCreated = async () => {
    if (!showLabelModal) return;

    const order = orders.find((o) => o.id === showLabelModal);
    if (!order) return;

    try {
      // Update Firebase
      const response = await makeAuthenticatedRequest(
        "/api/admin/firebase-orders",
        {
          method: "POST",
          body: JSON.stringify({
            action: "update",
            orderId: showLabelModal,
            data: {
              label_created: true,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update label status for order ${showLabelModal}`
        );
      }

      // Send email
      await makeAuthenticatedRequest("/api/admin/send-status-email", {
        method: "POST",
        body: JSON.stringify({
          orderId: showLabelModal,
          status: "label_created",
          email: order.customer_email,
        }),
      });

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === showLabelModal ? { ...o, label_created: true } : o
        )
      );

      setShowLabelModal(null);
      console.log(`Marked order ${showLabelModal} as label created`);
    } catch (error) {
      console.error("Error updating label status:", error);
    }
  };

  const handleShippedOut = async () => {
    if (!showShippedModal) return;

    if (!trackingProvider || !trackingCode) {
      alert("Please provide both tracking provider and tracking code");
      return;
    }

    const order = orders.find((o) => o.id === showShippedModal);
    if (!order) return;

    try {
      // Update Firebase
      const response = await makeAuthenticatedRequest(
        "/api/admin/firebase-orders",
        {
          method: "POST",
          body: JSON.stringify({
            action: "update",
            orderId: showShippedModal,
            data: {
              shipped_out: true,
              tracking_provider: trackingProvider as "DHL" | "PostNL",
              tracking_code: trackingCode,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to update shipped status for order ${showShippedModal}`
        );
      }

      // Send email
      await makeAuthenticatedRequest("/api/admin/send-status-email", {
        method: "POST",
        body: JSON.stringify({
          orderId: showShippedModal,
          status: "shipped_out",
          email: order.customer_email,
          trackingProvider,
          trackingCode,
          postalCode:
            order.shipping_details?.postal_code ||
            order.shipping_details?.address?.postal_code ||
            "",
          country:
            order.shipping_details?.country ||
            order.shipping_details?.address?.country ||
            "NL",
        }),
      });

      // Update local state
      setOrders((prev) =>
        prev.map((o) =>
          o.id === showShippedModal
            ? {
                ...o,
                shipped_out: true,
                tracking_provider: trackingProvider as "DHL" | "PostNL",
                tracking_code: trackingCode,
              }
            : o
        )
      );

      setShowShippedModal(null);
      setTrackingProvider("");
      setTrackingCode("");
      console.log(`Marked order ${showShippedModal} as shipped out`);
    } catch (error) {
      console.error("Error updating shipped status:", error);
    }
  };

  // Manual order management functions
  const createManualOrder = async (orderData: Partial<Order>) => {
    try {
      const newOrder = {
        stripe_id: orderData.id || `manual_${Date.now()}`,
        amount_total: orderData.amount_total || 0,
        customer_email: orderData.customer_email || "",
        payment_status: orderData.payment_status || "paid",
        status: orderData.status || "complete",
        created: orderData.created || Math.floor(Date.now() / 1000),
        shipping_details: orderData.shipping_details || {},
        line_items: orderData.line_items || [],
        shipped: orderData.shipped || false,
        custom_flag: orderData.custom_flag || "",
        notes: orderData.notes || "",
        deleted: false,
        manual: true, // Mark as manually created
      };

      const response = await makeAuthenticatedRequest(
        "/api/admin/firebase-orders",
        {
          method: "POST",
          body: JSON.stringify({
            action: "create",
            orderId: newOrder.stripe_id,
            data: newOrder,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create manual order ${newOrder.stripe_id}`);
      }

      // Add to local state
      const newOrderForState: Order = {
        id: newOrder.stripe_id,
        amount_total: newOrder.amount_total,
        customer_email: newOrder.customer_email,
        payment_status: newOrder.payment_status,
        status: newOrder.status,
        created: newOrder.created,
        shipping_details:
          newOrder.shipping_details && (newOrder.shipping_details as any).name
            ? (newOrder.shipping_details as any)
            : undefined,
        line_items: newOrder.line_items,
        shipped: newOrder.shipped,
        custom_flag: newOrder.custom_flag,
        notes: newOrder.notes,
      };
      setOrders((prev) => [...prev, newOrderForState]);

      setShowCreateOrderModal(false);
      console.log(`✅ Created manual order: ${newOrder.stripe_id}`);
    } catch (error) {
      console.error("Error creating manual order:", error);
    }
  };

  const getFilteredOrders = () => {
    let filtered = orders;

    // Search filter
    if (orderSearchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customer_email
            .toLowerCase()
            .includes(orderSearchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
          (order.shipping_details?.name || "")
            .toLowerCase()
            .includes(orderSearchTerm.toLowerCase())
      );
    }

    // Sort by date (newest first)
    filtered = filtered.sort((a, b) => b.created - a.created);

    return filtered;
  };

  const getPaginatedOrders = () => {
    const filtered = getFilteredOrders();
    const startIndex = (currentOrderPage - 1) * ORDERS_PER_PAGE;
    const endIndex = startIndex + ORDERS_PER_PAGE;
    return {
      orders: filtered.slice(startIndex, endIndex),
      totalPages: Math.ceil(filtered.length / ORDERS_PER_PAGE),
      totalOrders: filtered.length,
    };
  };

  const {
    orders: paginatedOrders,
    totalPages,
    totalOrders,
  } = getPaginatedOrders();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) {
    router.push("/admin");
    return null;
  }

  return (
    <div
      className="min-h-screen bg-black flex p-8 flex-col items-center justify-between"
      style={{ minHeight: "200vh" }}
    >
      {/* Logo */}
      <div className="items-center flex flex-col gap-2">
        <div className="flex justify-center">
          <Image
            src="/grbt.svg"
            alt="grbt."
            width={400}
            height={172}
            className="w-auto h-20 sm:h-24 lg:h-28"
            priority
          />
        </div>
        <p className="text-lg text-white font-light italic mb-2">
          Yönetici Paneli
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="w-full max-w-7xl text-center h-full flex flex-col justify-start items-center flex-1">
        <div className="bg-white/5 border border-white/10 rounded-none p-8 w-full mb-8">
          <h2 className="text-2xl text-white font-light mb-4">
            Hoş geldiniz, Admin
          </h2>
          <p className="text-muted/70 mb-6">
            Yönetici paneline başarıyla eriştiniz.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="px-6 py-2 text-black font-medium tracking-wider uppercase text-sm transition-all duration-300 whitespace-nowrap !bg-white hover:!bg-white/90 w-full max-w-md"
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/5 border border-white/10 rounded-none p-8 w-full mb-8">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setActiveTab("waitlist")}
              className={`px-4 py-2 transition-colors ${
                activeTab === "waitlist"
                  ? "bg-white text-black"
                  : "bg-transparent text-white border border-white/30"
              }`}
            >
              Bekleme Listesi
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 transition-colors ${
                activeTab === "orders"
                  ? "bg-white text-black"
                  : "bg-transparent text-white border border-white/30"
              }`}
            >
              Siparişler ({orders.length})
            </button>
          </div>
        </div>

        {/* Waitlist Users */}
        {activeTab === "waitlist" && (
          <div className="bg-white/5 border border-white/10 rounded-none p-8 w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-white font-light">
                Bekleme Listesi Kullanıcıları (
                {isSearching ? filteredUsers.length : totalUsers} toplam)
              </h3>
              <div className="text-muted/70 text-sm">Sayfa {currentPage}</div>
            </div>

            {/* Search Input */}
            <div className="mb-6">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="E-posta ile ara..."
                className="w-full px-4 py-2 bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-300 rounded"
              />
            </div>

            {usersLoading ? (
              <p className="text-muted/70">Kullanıcılar yükleniyor...</p>
            ) : (isSearching ? filteredUsers : waitlistUsers).length === 0 ? (
              <p className="text-muted/70">
                {isSearching
                  ? "Aramanızla eşleşen kullanıcı bulunamadı."
                  : "Henüz hiç kullanıcı kaydolmadı."}
              </p>
            ) : (
              <>
                <div className="overflow-x-auto mb-6 min-h-[400px]">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-white/70 font-light py-3 px-4">
                          E-posta
                        </th>
                        <th className="text-white/70 font-light py-3 px-4">
                          Kaynak
                        </th>
                        <th className="text-white/70 font-light py-3 px-4">
                          Tarih
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(isSearching ? filteredUsers : waitlistUsers).map(
                        (user) => (
                          <tr key={user.id} className="border-b border-white/5">
                            <td className="text-white py-3 px-4">
                              {user.email}
                            </td>
                            <td className="text-muted/70 py-3 px-4">
                              {user.source}
                            </td>
                            <td className="text-muted/70 py-3 px-4">
                              {user.timestamp &&
                              typeof user.timestamp === "object" &&
                              "toDate" in user.timestamp
                                ? (user.timestamp as { toDate: () => Date })
                                    .toDate()
                                    .toLocaleDateString()
                                : "N/A"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls - Only show when not searching */}
                {!isSearching && (
                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      onClick={handlePrevPage}
                      disabled={!hasPrevPage || usersLoading}
                      className="px-4 py-2 text-white border border-white/30 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                    >
                      Önceki
                    </button>

                    <span className="text-muted/70 text-sm">
                      {waitlistUsers.length} / {totalUsers} kullanıcı
                      gösteriliyor
                    </span>

                    <button
                      type="button"
                      onClick={handleNextPage}
                      disabled={!hasNextPage || usersLoading}
                      className="px-4 py-2 text-white border border-white/30 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                    >
                      Sonraki
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="bg-white/5 border border-white/10 rounded-none p-8 w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl text-white font-light">
                Siparişler ({totalOrders} toplam) - Sayfa {currentOrderPage} /{" "}
                {totalPages}
              </h3>
              <button
                onClick={() => setShowCreateOrderModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                + Yeni Sipariş
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                value={orderSearchTerm}
                onChange={(e) => setOrderSearchTerm(e.target.value)}
                placeholder="E-posta, ID veya isim ile ara..."
                className="w-full px-4 py-2 bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-300 rounded text-sm"
              />
            </div>

            {ordersLoading ? (
              <p className="text-muted/70">Siparişler yükleniyor...</p>
            ) : totalOrders === 0 ? (
              <p className="text-muted/70">
                {orderSearchTerm
                  ? "Arama kriterlerinize uygun sipariş bulunamadı."
                  : "Henüz hiç sipariş alınmadı."}
              </p>
            ) : (
              <div className="overflow-x-auto mb-6 min-h-[400px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-white/70 font-light py-2 px-4">
                        E-posta
                      </th>
                      <th className="text-white/70 font-light py-2 px-4">
                        Ürünler
                      </th>
                      <th className="text-white/70 font-light py-2 px-4">
                        Tutar
                      </th>
                      <th className="text-white/70 font-light py-2 px-4">
                        Tarih
                      </th>
                      <th className="text-white/70 font-light py-2 px-4">
                        Adres
                      </th>
                      <th className="text-white/70 font-light py-2 px-4">
                        Bayrak
                      </th>
                      <th className="text-white/70 font-light py-2 px-4">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="text-white py-2 px-4">
                          <div className="flex items-center gap-2">
                            {order.shipped_out ? (
                              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                            ) : order.label_created ? (
                              <span className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
                            )}
                            <div className="text-xs">
                              {editingField?.orderId === order.id &&
                              editingField.field === "customer_email" ? (
                                <div className="flex gap-1">
                                  <input
                                    type="email"
                                    value={editingField.value}
                                    onChange={(e) =>
                                      setEditingField({
                                        ...editingField,
                                        value: e.target.value,
                                      })
                                    }
                                    className="px-2 py-1 bg-white/10 border border-white/30 text-white text-xs rounded"
                                  />
                                  <button
                                    onClick={saveEdit}
                                    className="text-green-400 text-xs"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="text-red-400 text-xs"
                                  >
                                    ✗
                                  </button>
                                </div>
                              ) : (
                                <span
                                  onClick={() =>
                                    startEditing(
                                      order.id,
                                      "customer_email",
                                      order.customer_email || ""
                                    )
                                  }
                                  className="cursor-pointer hover:bg-white/10 px-1 py-1 rounded text-xs"
                                >
                                  {order.customer_email || "N/A"}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-white py-2 px-4">
                          <div className="text-xs max-w-xs">
                            {order.line_items.map((item, index) => {
                              // Extract product name from Stripe line item
                              // For newer orders, description contains full details
                              // For older orders, use product_details.description if name is "GRBT Order", otherwise use name
                              let productName = item.description || "Ürün";
                              if ((item as any).product_details?.name) {
                                if (
                                  (item as any).product_details.name ===
                                    "GRBT Order" &&
                                  (item as any).product_details.description
                                ) {
                                  // Extract product name from description like "Items: Ardahan Tişört (siyah, M)"
                                  const match = (
                                    item as any
                                  ).product_details.description.match(
                                    /Items: ([^(]+)/
                                  );
                                  productName = match
                                    ? match[1].trim()
                                    : (item as any).product_details.description;
                                } else {
                                  productName = (item as any).product_details
                                    .name;
                                }
                              }

                              return (
                                <div
                                  key={index}
                                  className="mb-1 p-2 rounded text-xs bg-white/5"
                                >
                                  <div className="font-medium text-white text-xs mb-1">
                                    {productName.split(" - ")[0]}
                                  </div>
                                  <div className="text-white/60 text-xs">
                                    {item.description === "GRBT Order" ? (
                                      <>
                                        <div className="mb-1 text-white/50">
                                          {(item as any).product_details
                                            ?.description || "Detay yok"}
                                        </div>
                                        <div className="text-white/50">
                                          {item.quantity}x €
                                          {(
                                            (item.amount_total ||
                                              item.amount ||
                                              0) / 100
                                          ).toFixed(2)}
                                        </div>
                                      </>
                                    ) : (
                                      <>
                                        {item.description &&
                                          item.description !==
                                            productName.split(" - ")[0] && (
                                            <div className="mb-1 text-white/50">
                                              {item.description}
                                            </div>
                                          )}
                                        {item.quantity}x €
                                        {(
                                          (item.amount_total ||
                                            item.amount ||
                                            0) / 100
                                        ).toFixed(2)}
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="text-white py-2 px-4 text-xs">
                          €{(order.amount_total / 100).toFixed(2)}
                        </td>
                        <td className="text-muted/70 py-2 px-4 text-xs">
                          {new Date(order.created * 1000).toLocaleDateString(
                            "tr-TR"
                          )}
                        </td>
                        <td className="text-muted/70 py-2 px-4">
                          {order.shipping_details ? (
                            <div className="text-xs">
                              <div className="font-medium">
                                {order.shipping_details.name ||
                                  order.customer_email}
                              </div>
                              <div>
                                {order.shipping_details.line1 ||
                                  order.shipping_details.address?.line1}
                              </div>
                              {(order.shipping_details.line2 ||
                                order.shipping_details.address?.line2) && (
                                <div>
                                  {order.shipping_details.line2 ||
                                    order.shipping_details.address?.line2}
                                </div>
                              )}
                              <div>
                                {order.shipping_details.postal_code ||
                                  order.shipping_details.address
                                    ?.postal_code}{" "}
                                {order.shipping_details.city ||
                                  order.shipping_details.address?.city}
                              </div>
                              <div>
                                {order.shipping_details.country ||
                                  order.shipping_details.address?.country}
                              </div>
                            </div>
                          ) : (
                            <div className="text-xs text-red-400">
                              No shipping details
                            </div>
                          )}
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() =>
                                openFlagModal(order.id, order.custom_flag || "")
                              }
                              className="px-2 py-1 bg-white/10 border border-white/30 text-white text-xs rounded w-full hover:bg-white/20 transition-colors"
                            >
                              {order.custom_flag || "Bayrak ekle..."}
                            </button>
                            {order.custom_flag && (
                              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                                {order.custom_flag}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex gap-1">
                              {!order.label_created && (
                                <button
                                  onClick={() => setShowLabelModal(order.id)}
                                  className="flex-1 px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                                  title="Label Created"
                                >
                                  Label
                                </button>
                              )}
                              {!order.shipped_out && order.label_created && (
                                <button
                                  onClick={() => setShowShippedModal(order.id)}
                                  className="flex-1 px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors"
                                  title="Shipped Out"
                                >
                                  Ship
                                </button>
                              )}
                              {order.shipped_out && order.tracking_code && (
                                <div className="text-xs px-2 py-1 bg-green-600 text-white rounded">
                                  {order.tracking_provider}:{" "}
                                  {order.tracking_code}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => setShowOrderModal(order.id)}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
                            >
                              Detaylar
                            </button>
                            <button
                              onClick={() => openEditOrderModal(order)}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs hover:bg-blue-500/30 transition-colors"
                            >
                              Düzenle
                            </button>
                            <button
                              onClick={() => setShowDeleteModal(order.id)}
                              className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                            >
                              Sil
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalOrders > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-white/70 text-sm">
                  Sayfa {currentOrderPage} / {totalPages} ({totalOrders}{" "}
                  sipariş)
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentOrderPage(Math.max(1, currentOrderPage - 1))
                    }
                    disabled={currentOrderPage === 1}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                  >
                    ← Önceki
                  </button>
                  <button
                    onClick={() =>
                      setCurrentOrderPage(
                        Math.min(totalPages, currentOrderPage + 1)
                      )
                    }
                    disabled={currentOrderPage === totalPages}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded text-sm transition-colors"
                  >
                    Sonraki →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/20 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-white font-light">
                Sipariş Detayları
              </h3>
              <button
                onClick={() => setShowOrderModal(null)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            {(() => {
              const order = orders.find((o) => o.id === showOrderModal);
              if (!order) return null;

              return (
                <div className="space-y-6">
                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">
                        Sipariş Bilgileri
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>ID:</strong> ...{order.id.slice(-8)}
                        </div>
                        <div>
                          <strong>E-posta:</strong> {order.customer_email}
                        </div>
                        <div>
                          <strong>Tutar:</strong> €
                          {(order.amount_total / 100).toFixed(2)}
                        </div>
                        <div>
                          <strong>Tarih:</strong>{" "}
                          {new Date(order.created * 1000).toLocaleString(
                            "tr-TR"
                          )}
                        </div>
                        <div>
                          <strong>Durum:</strong> {order.payment_status}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-medium mb-2">
                        Teslimat Bilgileri
                      </h4>
                      {order.shipping_details ? (
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>İsim:</strong> {order.shipping_details.name}
                          </div>
                          <div>
                            <strong>Adres:</strong>{" "}
                            {order.shipping_details.line1 ||
                              order.shipping_details.address?.line1}
                          </div>
                          {order.shipping_details.line2 ||
                            (order.shipping_details.address?.line2 && (
                              <div>
                                <strong>Adres 2:</strong>{" "}
                                {order.shipping_details.line2 ||
                                  order.shipping_details.address?.line2}
                              </div>
                            ))}
                          <div>
                            <strong>Şehir:</strong>{" "}
                            {order.shipping_details.city ||
                              order.shipping_details.address?.city}
                          </div>
                          <div>
                            <strong>Posta Kodu:</strong>{" "}
                            {order.shipping_details.postal_code ||
                              order.shipping_details.address?.postal_code}
                          </div>
                          <div>
                            <strong>Ülke:</strong>{" "}
                            {order.shipping_details.country ||
                              order.shipping_details.address?.country}
                          </div>
                        </div>
                      ) : (
                        <div className="text-red-400 text-sm">
                          Teslimat bilgileri bulunamadı
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Products */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Ürünler</h4>
                    <div className="space-y-3">
                      {order.line_items.map((item, index) => {
                        // Extract product name from Stripe line item
                        // For newer orders, description contains full details
                        // For older orders, description might just be "GRBT Order" or product name
                        const productName = item.description || "Ürün";

                        return (
                          <div key={index} className="bg-white/5 p-4 rounded">
                            <div className="font-medium text-white">
                              {productName}
                            </div>
                            <div className="text-white/70 text-sm mt-1">
                              {item.quantity}x €
                              {(
                                (item.amount_total || item.amount || 0) / 100
                              ).toFixed(2)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <h4 className="text-white font-medium mb-2">Notlar</h4>
                    <textarea
                      value={order.notes || ""}
                      onChange={(e) =>
                        updateOrderNotes(order.id, e.target.value)
                      }
                      placeholder="Sipariş notları..."
                      className="w-full h-24 px-3 py-2 bg-white/10 border border-white/30 text-white placeholder-white/50 rounded resize-none"
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/20 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-white font-light">Siparişi Sil</h3>
              <button
                onClick={() => setShowDeleteModal(null)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-white/70">
                Bu siparişi silmek istediğinizden emin misiniz? Bu işlem geri
                alınamaz.
              </p>

              {(() => {
                const order = orders.find((o) => o.id === showDeleteModal);
                if (!order) return null;

                return (
                  <div className="bg-white/5 p-4 rounded">
                    <div className="text-white font-medium mb-2">
                      Sipariş: ...{order.id.slice(-8)}
                    </div>
                    <div className="text-white/70 text-sm">
                      <div>E-posta: {order.customer_email}</div>
                      <div>Tutar: €{(order.amount_total / 100).toFixed(2)}</div>
                      <div>
                        Tarih:{" "}
                        {new Date(order.created * 1000).toLocaleDateString(
                          "tr-TR"
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 text-white border border-white/30 rounded hover:bg-white/10 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => deleteOrder(showDeleteModal)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showCreateOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black border border-white/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Yeni Sipariş Oluştur
              </h2>
              <button
                onClick={() => setShowCreateOrderModal(false)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <CreateOrderForm
              onSubmit={createManualOrder}
              onCancel={() => setShowCreateOrderModal(false)}
            />
          </div>
        </div>
      )}

      {/* Flag Confirmation Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black border border-white/20 rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                Bayrak Ekle/Düzenle
              </h2>
              <button
                onClick={() => setShowFlagModal(null)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Bayrak
                </label>
                <input
                  type="text"
                  value={flagInputValue}
                  onChange={(e) => setFlagInputValue(e.target.value)}
                  placeholder="VIP, Öncelikli, vb."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setShowFlagModal(null)}
                  className="flex-1 px-4 py-2 text-white border border-white/30 rounded hover:bg-white/10 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={confirmFlagUpdate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {showEditOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black border border-white/20 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Sipariş Düzenle</h2>
              <button
                onClick={() => setShowEditOrderModal(null)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={editOrderData.customer_email || ""}
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        customer_email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Toplam Tutar (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={
                      editOrderData.amount_total
                        ? (editOrderData.amount_total / 100).toFixed(2)
                        : ""
                    }
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        amount_total: Math.round(
                          parseFloat(e.target.value) * 100
                        ),
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Sipariş Tarihi
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      editOrderData.created
                        ? new Date(editOrderData.created * 1000)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        created: Math.floor(
                          new Date(e.target.value).getTime() / 1000
                        ),
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Ödeme Durumu
                  </label>
                  <select
                    value={editOrderData.payment_status || "paid"}
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        payment_status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-white/50"
                  >
                    <option value="paid">Ödendi</option>
                    <option value="unpaid">Ödenmedi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Durum
                  </label>
                  <select
                    value={editOrderData.status || "complete"}
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-white/50"
                  >
                    <option value="complete">Tamamlandı</option>
                    <option value="open">Açık</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Teslimat Bilgileri
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    value={editOrderData.shipping_details?.name || ""}
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        shipping_details: {
                          ...prev.shipping_details,
                          name: e.target.value,
                        },
                      }))
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                  <input
                    type="text"
                    placeholder="Adres"
                    value={editOrderData.shipping_details?.address?.line1 || ""}
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        shipping_details: {
                          ...prev.shipping_details,
                          address: {
                            ...prev.shipping_details?.address,
                            line1: e.target.value,
                          },
                        } as any,
                      }))
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                  <input
                    type="text"
                    placeholder="Şehir"
                    value={editOrderData.shipping_details?.address?.city || ""}
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        shipping_details: {
                          ...prev.shipping_details,
                          address: {
                            ...prev.shipping_details?.address,
                            city: e.target.value,
                          },
                        } as any,
                      }))
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                  <input
                    type="text"
                    placeholder="Posta Kodu"
                    value={
                      editOrderData.shipping_details?.address?.postal_code || ""
                    }
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        shipping_details: {
                          ...prev.shipping_details,
                          address: {
                            ...prev.shipping_details?.address,
                            postal_code: e.target.value,
                          },
                        } as any,
                      }))
                    }
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Özel Bayrak
                  </label>
                  <input
                    type="text"
                    placeholder="VIP, Öncelikli, vb."
                    value={editOrderData.custom_flag || ""}
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        custom_flag: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                </div>
                <div>
                  <label className="block text-white/70 text-sm mb-2">
                    Notlar
                  </label>
                  <input
                    type="text"
                    placeholder="Özel notlar..."
                    value={editOrderData.notes || ""}
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  />
                </div>
              </div>

              {/* Product Editing Section */}
              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Ürünler
                </label>
                <div className="space-y-2">
                  {editOrderData.line_items?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="bg-white/5 border border-white/20 rounded p-3"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-white/50 text-xs mb-1">
                            Ürün Adı
                          </label>
                          <input
                            type="text"
                            value={item.description || ""}
                            onChange={(e) => {
                              const newLineItems = [
                                ...(editOrderData.line_items || []),
                              ];
                              newLineItems[index] = {
                                ...newLineItems[index],
                                description: e.target.value,
                              };
                              setEditOrderData((prev) => ({
                                ...prev,
                                line_items: newLineItems,
                              }));
                            }}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-white/50 focus:outline-none focus:border-white/50"
                          />
                        </div>
                        <div>
                          <label className="block text-white/50 text-xs mb-1">
                            Miktar
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity || 1}
                            onChange={(e) => {
                              const newLineItems = [
                                ...(editOrderData.line_items || []),
                              ];
                              newLineItems[index] = {
                                ...newLineItems[index],
                                quantity: parseInt(e.target.value) || 1,
                              };
                              setEditOrderData((prev) => ({
                                ...prev,
                                line_items: newLineItems,
                              }));
                            }}
                            className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-white/50 focus:outline-none focus:border-white/50"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-white/50 text-xs mb-1">
                          Tutar (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={
                            item.amount_total
                              ? (item.amount_total / 100).toFixed(2)
                              : ""
                          }
                          onChange={(e) => {
                            const newLineItems = [
                              ...(editOrderData.line_items || []),
                            ];
                            newLineItems[index] = {
                              ...newLineItems[index],
                              amount_total: Math.round(
                                parseFloat(e.target.value || "0") * 100
                              ),
                            };
                            setEditOrderData((prev) => ({
                              ...prev,
                              line_items: newLineItems,
                            }));
                          }}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-white/50 focus:outline-none focus:border-white/50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-white/70">
                  <input
                    type="checkbox"
                    checked={editOrderData.shipped || false}
                    onChange={(e) =>
                      setEditOrderData((prev) => ({
                        ...prev,
                        shipped: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <span className="text-sm">Kargoya Verildi</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowEditOrderModal(null)}
                  className="flex-1 px-4 py-2 text-white border border-white/30 rounded hover:bg-white/10 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={saveOrderChanges}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Label Created Confirmation Modal */}
      {showLabelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/20 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-white font-light">
                Mark Label as Created
              </h3>
              <button
                onClick={() => setShowLabelModal(null)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-white/70">
                An email will be sent to the customer informing them that their
                order is being packed.
              </p>

              {(() => {
                const order = orders.find((o) => o.id === showLabelModal);
                if (!order) return null;

                return (
                  <div className="bg-white/5 p-4 rounded">
                    <div className="text-white font-medium mb-2">
                      Order: ...{order.id.slice(-8)}
                    </div>
                    <div className="text-white/70 text-sm">
                      <div>Email: {order.customer_email}</div>
                      <div>
                        Amount: €{(order.amount_total / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-4">
                <button
                  onClick={() => setShowLabelModal(null)}
                  className="flex-1 px-4 py-2 text-white border border-white/30 rounded hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLabelCreated}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipped Out Confirmation Modal */}
      {showShippedModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-black border border-white/20 rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl text-white font-light">Mark as Shipped</h3>
              <button
                onClick={() => setShowShippedModal(null)}
                className="text-white/70 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-white/70">
                Provide tracking information. An email will be sent to the
                customer with tracking details.
              </p>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Shipping Provider
                </label>
                <select
                  value={trackingProvider}
                  onChange={(e) =>
                    setTrackingProvider(e.target.value as "DHL" | "PostNL" | "")
                  }
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-white/50"
                  required
                >
                  <option value="">Select provider...</option>
                  <option value="DHL">DHL</option>
                  <option value="PostNL">PostNL</option>
                </select>
              </div>

              <div>
                <label className="block text-white/70 text-sm mb-2">
                  Tracking Code
                </label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Enter tracking code..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:border-white/50"
                  required
                />
              </div>

              {(() => {
                const order = orders.find((o) => o.id === showShippedModal);
                if (!order) return null;

                return (
                  <div className="bg-white/5 p-4 rounded">
                    <div className="text-white font-medium mb-2">
                      Order: ...{order.id.slice(-8)}
                    </div>
                    <div className="text-white/70 text-sm">
                      <div>Email: {order.customer_email}</div>
                      <div>
                        Amount: €{(order.amount_total / 100).toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowShippedModal(null);
                    setTrackingProvider("");
                    setTrackingCode("");
                  }}
                  className="flex-1 px-4 py-2 text-white border border-white/30 rounded hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleShippedOut}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
