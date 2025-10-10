"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Stripe from "stripe";

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
  created: number;
  shipping_details?: {
    name: string;
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
}

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
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
  const [activeTab, setActiveTab] = useState<"waitlist" | "orders">("waitlist");

  const USERS_PER_PAGE = 10;

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

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin");
    }
  }, [user, loading, router]);

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

    if (user) {
      fetchAllUsers();
    }
  }, [user]);

  // Fetch orders from Stripe
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const response = await fetch("/api/admin/orders");
        if (response.ok) {
          const ordersData = await response.json();
          setOrders(ordersData);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Derive current page users from deduped allUsers
  useEffect(() => {
    if (!user) return;
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    const endIndex = startIndex + USERS_PER_PAGE;
    const pageSlice = allUsers.slice(startIndex, endIndex);
    setWaitlistUsers(pageSlice);
    setHasNextPage(endIndex < totalUsers);
    setHasPrevPage(currentPage > 1);
  }, [user, allUsers, currentPage, totalUsers]);

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
      // Restore scroll position after state update
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
      // Restore scroll position after state update
      setTimeout(() => {
        window.scrollTo(0, scrollPosition);
      }, 0);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/admin");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!user) {
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
      <div className="w-full max-w-6xl text-center h-full flex flex-col justify-start items-center flex-1">
        <div className="bg-white/5 border border-white/10 rounded-none p-8 w-full mb-8">
          <h2 className="text-2xl text-white font-light mb-4">
            Hoş geldiniz, {user.email}
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
                Siparişler ({orders.length} toplam)
              </h3>
            </div>

            {ordersLoading ? (
              <p className="text-muted/70">Siparişler yükleniyor...</p>
            ) : orders.length === 0 ? (
              <p className="text-muted/70">Henüz hiç sipariş alınmadı.</p>
            ) : (
              <div className="overflow-x-auto mb-6 min-h-[400px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-white/70 font-light py-3 px-4">
                        E-posta
                      </th>
                      <th className="text-white/70 font-light py-3 px-4">
                        Ürünler
                      </th>
                      <th className="text-white/70 font-light py-3 px-4">
                        Tutar
                      </th>
                      <th className="text-white/70 font-light py-3 px-4">
                        Tarih
                      </th>
                      <th className="text-white/70 font-light py-3 px-4">
                        Adres
                      </th>
                      <th className="text-white/70 font-light py-3 px-4">
                        Durum
                      </th>
                      <th className="text-white/70 font-light py-3 px-4">
                        Debug
                      </th>
                      <th className="text-white/70 font-light py-3 px-4">
                        Raw Desc
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5">
                        <td className="text-white py-3 px-4">
                          {order.customer_email || "N/A"}
                        </td>
                        <td className="text-white py-3 px-4">
                          <div className="text-sm">
                            {order.line_items.map((item, index) => (
                              <div
                                key={index}
                                className="mb-2 p-2 bg-white/5 rounded"
                              >
                                <div className="font-medium">
                                  {item.description ||
                                    item.price_data?.product_data?.name ||
                                    "Ürün"}
                                </div>
                                <div className="text-white/60 text-xs mt-1">
                                  {item.quantity}x €
                                  {(item.price_data?.unit_amount ||
                                    item.amount ||
                                    0) / 100}
                                </div>
                                {/* Extract color and size from description */}
                                <div className="text-white/50 text-xs mt-1">
                                  {(() => {
                                    const desc = item.description || "";
                                    console.log("Item description:", desc); // Debug log

                                    // Look for color and size patterns - more comprehensive
                                    const colorMatch = desc.match(
                                      /(beyaz|siyah|mavi|kırmızı|yeşil|sarı|mor|pembe|turuncu|gri|white|black|blue|red|green|yellow|purple|pink|orange|gray)/i
                                    );
                                    const sizeMatch =
                                      desc.match(/(S|M|L|XL|XXL)/);

                                    // Also check if description contains "•" separator
                                    const parts = desc
                                      .split("•")
                                      .map((p: string) => p.trim());
                                    const colorFromParts = parts.find(
                                      (p: string) =>
                                        /(beyaz|siyah|mavi|kırmızı|yeşil|sarı|mor|pembe|turuncu|gri|white|black|blue|red|green|yellow|purple|pink|orange|gray)/i.test(
                                          p
                                        )
                                    );
                                    const sizeFromParts = parts.find(
                                      (p: string) => /(S|M|L|XL|XXL)/.test(p)
                                    );

                                    const finalColor =
                                      colorMatch?.[1] ||
                                      colorFromParts ||
                                      "N/A";
                                    const finalSize =
                                      sizeMatch?.[1] || sizeFromParts || "N/A";

                                    return (
                                      <div className="flex gap-2">
                                        <span className="px-1 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase">
                                          {finalColor}
                                        </span>
                                        <span className="px-1 py-0.5 bg-white/10 rounded text-[10px] font-bold">
                                          {finalSize}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="text-white py-3 px-4">
                          €{(order.amount_total / 100).toFixed(2)}
                        </td>
                        <td className="text-muted/70 py-3 px-4">
                          {new Date(order.created * 1000).toLocaleDateString(
                            "tr-TR"
                          )}
                        </td>
                        <td className="text-muted/70 py-3 px-4">
                          {order.shipping_details ? (
                            <div className="text-xs">
                              <div className="font-medium">
                                {order.shipping_details.name}
                              </div>
                              <div>{order.shipping_details.address?.line1}</div>
                              {order.shipping_details.address?.line2 && (
                                <div>
                                  {order.shipping_details.address.line2}
                                </div>
                              )}
                              <div>
                                {order.shipping_details.address?.postal_code}{" "}
                                {order.shipping_details.address?.city}
                              </div>
                              <div>
                                {order.shipping_details.address?.country}
                              </div>
                            </div>
                          ) : (
                            "N/A"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              order.shipped
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {order.shipped ? "Kargoya Verildi" : "Beklemede"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-white/50">
                          {order.payment_status}
                          <br />
                          Email: {order.customer_email}
                        </td>
                        <td className="py-3 px-4 text-xs text-white/30">
                          {order.line_items.map((item, index) => (
                            <div key={index} className="mb-1">
                              {item.description || "No description"}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer removed - global Footer handles this */}
    </div>
  );
}
