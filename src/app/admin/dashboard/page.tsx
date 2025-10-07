"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface WaitlistUser {
  id: string;
  email: string;
  timestamp: unknown;
  source: string;
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

  const USERS_PER_PAGE = 10;

  const dedupeByEmail = (users: WaitlistUser[]) => {
    const seenEmails = new Set<string>();
    return users.filter((u) => {
      if (!u.email) return false;
      if (seenEmails.has(u.email)) return false;
      seenEmails.add(u.email);
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
          Admin Dashboard
        </p>
      </div>

      {/* Dashboard Content */}
      <div className="w-full max-w-6xl text-center h-full flex flex-col justify-start items-center flex-1">
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 w-full mb-8">
          <h2 className="text-2xl text-white font-light mb-4">
            Welcome, {user.email}
          </h2>
          <p className="text-muted/70 mb-6">
            You have successfully accessed the admin dashboard.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="px-6 py-2 text-black font-medium tracking-wider uppercase text-sm transition-all duration-300 whitespace-nowrap !bg-white hover:!bg-white/90 w-full max-w-md"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Waitlist Users */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-8 w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl text-white font-light">
              Waitlist Users ({isSearching ? filteredUsers.length : totalUsers}{" "}
              total)
            </h3>
            <div className="text-muted/70 text-sm">Page {currentPage}</div>
          </div>

          {/* Search Input */}
          <div className="mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by email..."
              className="w-full px-4 py-2 bg-transparent border border-white/30 text-white placeholder-white/50 focus:outline-none focus:border-white transition-all duration-300 rounded"
            />
          </div>

          {usersLoading ? (
            <p className="text-muted/70">Loading users...</p>
          ) : (isSearching ? filteredUsers : waitlistUsers).length === 0 ? (
            <p className="text-muted/70">
              {isSearching
                ? "No users found matching your search."
                : "No users have signed up yet."}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto mb-6 min-h-[400px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-white/70 font-light py-3 px-4">
                        Email
                      </th>
                      <th className="text-white/70 font-light py-3 px-4">
                        Source
                      </th>
                      <th className="text-white/70 font-light py-3 px-4">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {(isSearching ? filteredUsers : waitlistUsers).map(
                      (user) => (
                        <tr key={user.id} className="border-b border-white/5">
                          <td className="text-white py-3 px-4">{user.email}</td>
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
                    Previous
                  </button>

                  <span className="text-muted/70 text-sm">
                    Showing {waitlistUsers.length} of {totalUsers} users
                  </span>

                  <button
                    type="button"
                    onClick={handleNextPage}
                    disabled={!hasNextPage || usersLoading}
                    className="px-4 py-2 text-white border border-white/30 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-muted/100 w-full text-center pt-2 max-w-md">
        <p className="text-xs tracking-widest text-muted/100 uppercase">
          grbt.studio
        </p>
      </div>
    </div>
  );
}
