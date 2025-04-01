import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import Link from "next/link";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  popular: boolean;
  available: boolean;
  allergens?: string[];
}

interface Restaurant {
  _id: string;
  name: string;
}

export default function MenuItemsManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const router = useRouter();
  const { restaurantId } = router.query;

  useEffect(() => {
    if (restaurantId && typeof restaurantId === "string") {
      fetchMenuItems(restaurantId);
    }
  }, [restaurantId]);

  const fetchMenuItems = async (id: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_auth_token");

      const response = await axios.get(
        `/api/admin/menu-items?restaurantId=${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Fetch restaurant details from the restaurants endpoint
      const restaurantResponse = await axios.get("/api/admin/restaurants", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const restaurantData = restaurantResponse.data.restaurants.find(
        (r: any) => r._id === id
      );

      setRestaurant(restaurantData || null);
      setMenuItems(response.data.menuItems);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      setError("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  };

  const updateMenuItemAvailability = async (
    menuItemId: string,
    available: boolean
  ) => {
    try {
      setUpdatingItemId(menuItemId);
      const token = localStorage.getItem("admin_auth_token");

      await axios.patch(
        "/api/admin/menu-items",
        {
          restaurantId,
          menuItemId,
          available,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setMenuItems(
        menuItems.map((item) =>
          item._id === menuItemId ? { ...item, available } : item
        )
      );

      toast.success(`Menu item ${available ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Failed to update menu item:", error);
      toast.error("Failed to update menu item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  // Group menu items by category
  const menuItemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <AdminLayout>
      <div className="py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              {restaurant ? `Menu Items - ${restaurant.name}` : "Menu Items"}
            </h2>
            {restaurant && (
              <p className="mt-1 text-sm text-gray-500">
                Manage menu item availability for this restaurant
              </p>
            )}
          </div>

          <Link
            href="/admin/restaurants"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Back to Restaurants
          </Link>
        </div>

        {!restaurantId ? (
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 p-4 rounded">
            Please select a restaurant to manage its menu items.
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-500 text-red-700 p-4 rounded">
            {error}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">
              No menu items found for this restaurant
            </p>
          </div>
        ) : (
          <div>
            {Object.entries(menuItemsByCategory).map(([category, items]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {category}
                </h3>
                <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Item
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item._id}>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              {item.image && (
                                <div className="flex-shrink-0 h-10 w-10 mr-4">
                                  <img
                                    className="h-10 w-10 rounded-full object-cover"
                                    src={item.image}
                                    alt={item.name}
                                  />
                                </div>
                              )}
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.name}
                                </div>
                                <div className="text-sm text-gray-500 max-w-xs">
                                  {item.description}
                                </div>
                                {item.allergens &&
                                  item.allergens.length > 0 && (
                                    <div className="text-xs text-gray-400 mt-1">
                                      Allergens: {item.allergens.join(", ")}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            ${item.price.toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                item.available
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.available ? "Available" : "Unavailable"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            <button
                              type="button"
                              onClick={() =>
                                updateMenuItemAvailability(
                                  item._id,
                                  !item.available
                                )
                              }
                              disabled={updatingItemId === item._id}
                              className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                                item.available
                                  ? "text-red-700 bg-red-100 hover:bg-red-200"
                                  : "text-green-700 bg-green-100 hover:bg-green-200"
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            >
                              {updatingItemId === item._id
                                ? "Updating..."
                                : item.available
                                ? "Mark as Unavailable"
                                : "Mark as Available"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
