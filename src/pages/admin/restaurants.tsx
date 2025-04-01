import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";

interface Restaurant {
  _id: string;
  name: string;
  description: string;
  cuisine: string[];
  manuallyClosed: boolean;
  deliveryTime: number;
  deliveryFee: number;
  minOrderAmount: number;
  openingHours: {
    open: string;
    close: string;
    daysOpen: number[];
  };
}

export default function RestaurantsManagement() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingRestaurant, setEditingRestaurant] = useState<string | null>(
    null
  );
  const [formData, setFormData] = useState({
    manuallyClosed: false,
    openingHours: {
      open: "",
      close: "",
      daysOpen: [] as number[],
    },
    deliveryTime: 0,
    minOrderAmount: 0,
    deliveryFee: 0,
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_auth_token");

      const response = await axios.get("/api/admin/restaurants", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRestaurants(response.data.restaurants);
      setError(null);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
      setError("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant._id);
    setFormData({
      manuallyClosed: restaurant.manuallyClosed,
      openingHours: {
        open: restaurant.openingHours.open,
        close: restaurant.openingHours.close,
        daysOpen: [...restaurant.openingHours.daysOpen],
      },
      deliveryTime: restaurant.deliveryTime,
      minOrderAmount: restaurant.minOrderAmount,
      deliveryFee: restaurant.deliveryFee,
    });
  };

  const handleCancel = () => {
    setEditingRestaurant(null);
  };

  const handleSubmit = async (restaurantId: string) => {
    try {
      const token = localStorage.getItem("admin_auth_token");

      await axios.patch(
        "/api/admin/restaurants",
        {
          restaurantId,
          ...formData,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setRestaurants(
        restaurants.map((restaurant) =>
          restaurant._id === restaurantId
            ? { ...restaurant, ...formData }
            : restaurant
        )
      );

      setEditingRestaurant(null);
      toast.success("Restaurant updated successfully");
    } catch (error) {
      console.error("Failed to update restaurant:", error);
      toast.error("Failed to update restaurant");
    }
  };

  const handleDayToggle = (day: number) => {
    const currentDays = [...formData.openingHours.daysOpen];
    const index = currentDays.indexOf(day);

    if (index === -1) {
      // Add the day
      setFormData({
        ...formData,
        openingHours: {
          ...formData.openingHours,
          daysOpen: [...currentDays, day].sort((a, b) => a - b),
        },
      });
    } else {
      // Remove the day
      currentDays.splice(index, 1);
      setFormData({
        ...formData,
        openingHours: {
          ...formData.openingHours,
          daysOpen: currentDays,
        },
      });
    }
  };

  const getDayName = (day: number) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[day];
  };

  const formatDaysOpen = (daysOpen: number[]) => {
    if (daysOpen.length === 7) return "Every day";
    if (daysOpen.length === 0) return "Closed all week";

    return daysOpen.map((day) => getDayName(day)).join(", ");
  };

  return (
    <AdminLayout>
      <div className="py-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Manage Restaurants
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-500 text-red-700 p-4 rounded">
            {error}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No restaurants found</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Restaurant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Cuisine
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
                    Opening Hours
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Delivery Details
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
                {restaurants.map((restaurant) => (
                  <tr key={restaurant._id}>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {restaurant.name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {restaurant.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {restaurant.cuisine.join(", ")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          restaurant.manuallyClosed
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {restaurant.manuallyClosed ? "Closed" : "Open"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {restaurant.openingHours.open} -{" "}
                        {restaurant.openingHours.close}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDaysOpen(restaurant.openingHours.daysOpen)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        Delivery: {restaurant.deliveryTime} mins
                      </div>
                      <div className="text-sm text-gray-500">
                        Min Order: ${restaurant.minOrderAmount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Delivery Fee: ${restaurant.deliveryFee.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {editingRestaurant === restaurant._id ? (
                        <div className="space-y-3">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.manuallyClosed}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  manuallyClosed: e.target.checked,
                                })
                              }
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-900">
                              Temporarily Closed
                            </span>
                          </label>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Opening Hours
                            </label>
                            <div className="mt-1 flex space-x-2">
                              <input
                                type="time"
                                value={formData.openingHours.open}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    openingHours: {
                                      ...formData.openingHours,
                                      open: e.target.value,
                                    },
                                  })
                                }
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                              <span className="text-gray-500">to</span>
                              <input
                                type="time"
                                value={formData.openingHours.close}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    openingHours: {
                                      ...formData.openingHours,
                                      close: e.target.value,
                                    },
                                  })
                                }
                                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Open Days
                            </label>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => handleDayToggle(day)}
                                  className={`px-2 py-1 text-xs rounded-md ${
                                    formData.openingHours.daysOpen.includes(day)
                                      ? "bg-indigo-600 text-white"
                                      : "bg-gray-200 text-gray-800"
                                  }`}
                                >
                                  {getDayName(day).substring(0, 3)}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Delivery Time (mins)
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={formData.deliveryTime}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  deliveryTime: parseInt(e.target.value) || 0,
                                })
                              }
                              className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Min Order Amount ($)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.minOrderAmount}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  minOrderAmount:
                                    parseFloat(e.target.value) || 0,
                                })
                              }
                              className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Delivery Fee ($)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.deliveryFee}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  deliveryFee: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="mt-1 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                          </div>

                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => handleSubmit(restaurant._id)}
                              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={handleCancel}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(restaurant)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Edit Details
                          </button>
                          <Link
                            href={`/admin/menu-items?restaurantId=${restaurant._id}`}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Manage Menu
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
