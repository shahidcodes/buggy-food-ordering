import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

interface OrderItem {
  id: string;
  restaurantId: string;
  menuItem: {
    name: string;
    price: number;
    description: string;
    image: string;
  };
  quantity: number;
}

interface OrderDetails {
  items: OrderItem[];
  totalPrice: number;
  deliveryFee: number;
  displayPrice: number; // Bug: This is intentionally different from totalPrice
  paymentMethod: "card" | "cash";
  orderNumber: number;
  estimatedDelivery: string;
  orderDate: string;
}

const OrderConfirmationPage: NextPage = () => {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get order details from sessionStorage
    const storedOrderDetails = sessionStorage.getItem("orderDetails");

    if (!storedOrderDetails) {
      // Redirect to home if no order details
      router.push("/");
      return;
    }

    try {
      const parsedOrderDetails = JSON.parse(storedOrderDetails);
      setOrderDetails(parsedOrderDetails);
    } catch (error) {
      console.error("Failed to parse order details:", error);
    }

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">
            No order found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find your order details.
          </p>
          <Link href="/" legacyBehavior>
            <a className="inline-block bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition">
              Return to Home
            </a>
          </Link>
        </div>
      </div>
    );
  }

  // Format the date with bugs (showing wrong day)
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    // Bug: Always show "Today" even if it's not today
    return `Today, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  // Bug: Calculate wrong total by using the buggy displayPrice
  const calculatedTotal = orderDetails.displayPrice;

  // Bug: Show randomly wrong delivery fee sometimes
  const displayDeliveryFee =
    Math.random() > 0.7
      ? orderDetails.deliveryFee + 2
      : orderDetails.deliveryFee;

  // Bug: Sometimes mix up the items quantities
  const displayItems = orderDetails.items.map((item) => {
    if (Math.random() > 0.8 && item.quantity > 1) {
      // Return a wrong quantity
      return {
        ...item,
        quantity: item.quantity + (Math.random() > 0.5 ? 1 : -1),
      };
    }
    return item;
  });

  return (
    <>
      <Head>
        <title>Order Confirmation | Food Delivery</title>
      </Head>
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thank you for your order!
              </h1>
              <p className="text-gray-600">
                We&apos;ve received your order and will begin preparing it
                shortly.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order #{orderDetails.orderNumber}
                  </h2>
                  <p className="text-gray-600">
                    {formatDate(orderDetails.orderDate)}
                  </p>
                </div>
                <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Processing
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Order Details
                </h3>
                <div className="space-y-3">
                  {displayItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          {item.quantity} x {item.menuItem.name}
                        </span>
                      </div>
                      <div className="ml-4 text-gray-900">
                        ${(item.menuItem.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      ${orderDetails.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-gray-900">
                      ${displayDeliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">
                      ${calculatedTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Delivery Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Estimated Delivery Time
                  </h4>
                  <p className="text-gray-900">
                    {orderDetails.estimatedDelivery}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-1">
                    Payment Method
                  </h4>
                  <p className="text-gray-900">
                    {orderDetails.paymentMethod === "card"
                      ? "Credit/Debit Card"
                      : "Cash on Delivery"}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link href="/" legacyBehavior>
                <a className="inline-block bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition">
                  Continue Shopping
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;
