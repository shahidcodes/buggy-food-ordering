import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("admin_auth_token");

        if (!token) {
          router.push("/admin/login");
          return;
        }

        await axios.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAuthenticated(true);
      } catch (error) {
        console.error("Authentication error:", error);
        localStorage.removeItem("admin_auth_token");
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_auth_token");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!authenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white fixed h-full">
        <div className="p-5">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          <nav className="space-y-1">
            <Link
              href="/admin/dashboard"
              className={`block px-4 py-2 rounded-md ${
                router.pathname === "/admin/dashboard"
                  ? "bg-indigo-900 text-white"
                  : "text-indigo-100 hover:bg-indigo-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/orders"
              className={`block px-4 py-2 rounded-md ${
                router.pathname === "/admin/orders"
                  ? "bg-indigo-900 text-white"
                  : "text-indigo-100 hover:bg-indigo-700"
              }`}
            >
              Manage Orders
            </Link>
            <Link
              href="/admin/restaurants"
              className={`block px-4 py-2 rounded-md ${
                router.pathname === "/admin/restaurants"
                  ? "bg-indigo-900 text-white"
                  : "text-indigo-100 hover:bg-indigo-700"
              }`}
            >
              Manage Restaurants
            </Link>
            <Link
              href="/admin/menu-items"
              className={`block px-4 py-2 rounded-md ${
                router.pathname === "/admin/menu-items"
                  ? "bg-indigo-900 text-white"
                  : "text-indigo-100 hover:bg-indigo-700"
              }`}
            >
              Manage Menu Items
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded-md text-indigo-100 hover:bg-indigo-700"
            >
              Logout
            </button>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 flex-1">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h1 className="text-lg leading-6 font-semibold text-gray-900">
              {router.pathname === "/admin/dashboard" && "Dashboard"}
              {router.pathname === "/admin/orders" && "Manage Orders"}
              {router.pathname === "/admin/restaurants" && "Manage Restaurants"}
              {router.pathname === "/admin/menu-items" && "Manage Menu Items"}
            </h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
