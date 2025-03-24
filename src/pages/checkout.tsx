import { useCartStore } from "@/store/cartStore";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const CheckoutPage: NextPage = () => {
  const { items, clearCart, getTotalPrice } = useCartStore();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("cash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [calculatedSubtotal, setCalculatedSubtotal] = useState(0);

  // Bug: Initial card values accept anything
  const [cardDetails, setCardDetails] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });

  // Update calculated prices when items change
  useEffect(() => {
    const subtotal = parseFloat(getTotalPrice().toFixed(2));
    const total = parseFloat((subtotal + 5).toFixed(2));

    setCalculatedSubtotal(subtotal);
    setCalculatedTotal(total);
  }, [items, getTotalPrice]);

  // Handle form input changes
  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardDetails({ ...cardDetails, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      // Bug: Always mark payment as successful regardless of input
      // In a real app, we would validate card details here

      // Generate a fake order number
      const orderNumber = Math.floor(10000000 + Math.random() * 90000000);

      // Store order details in sessionStorage for the confirmation page
      const orderDetails = {
        items,
        totalPrice: calculatedSubtotal, // Use buggy calculated price
        deliveryFee: 5,
        // Bug: Use buggy total price for order confirmation
        displayPrice: calculatedTotal,
        paymentMethod,
        orderNumber,
        // Bug: Show incorrect delivery time
        estimatedDelivery: Math.floor(15 + Math.random() * 30) + " minutes",
        orderDate: new Date().toISOString(),
      };

      sessionStorage.setItem("orderDetails", JSON.stringify(orderDetails));

      // Clear the cart
      clearCart();

      setIsProcessing(false);
      router.push("/order-confirmation");
    }, 2000);
  };

  return (
    <>
      <Head>
        <title>Checkout | Food Delivery</title>
      </Head>
      <div className="min-h-screen bg-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

          {items.length === 0 ? (
            <div className="text-center py-16">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6">
                You need to add items to your cart before checking out.
              </p>
              <Link href="/" legacyBehavior>
                <a className="inline-block bg-red-600 text-white px-6 py-3 rounded-md font-medium hover:bg-red-700 transition">
                  Browse Restaurants
                </a>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Payment Method
                  </h2>

                  <div className="mb-6">
                    <div className="flex space-x-4">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="cash"
                          name="paymentMethod"
                          value="cash"
                          checked={paymentMethod === "cash"}
                          onChange={() => setPaymentMethod("cash")}
                          className="h-4 w-4 text-red-600 focus:ring-red-500"
                        />
                        <label htmlFor="cash" className="ml-2 text-gray-700">
                          Cash on Delivery
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="card"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={() => setPaymentMethod("card")}
                          className="h-4 w-4 text-red-600 focus:ring-red-500"
                        />
                        <label htmlFor="card" className="ml-2 text-gray-700">
                          Credit/Debit Card
                        </label>
                      </div>
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Name on Card
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={cardDetails.name}
                          onChange={handleCardInputChange}
                          placeholder="John Doe"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="number"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Card Number
                        </label>
                        <input
                          type="text"
                          id="number"
                          name="number"
                          value={cardDetails.number}
                          onChange={handleCardInputChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label
                            htmlFor="expiry"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            Expiry Date
                          </label>
                          <input
                            type="text"
                            id="expiry"
                            name="expiry"
                            value={cardDetails.expiry}
                            onChange={handleCardInputChange}
                            placeholder="MM/YY"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            required
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="cvv"
                            className="block text-sm font-medium text-gray-700 mb-1"
                          >
                            CVV
                          </label>
                          <input
                            type="text"
                            id="cvv"
                            name="cvv"
                            value={cardDetails.cvv}
                            onChange={handleCardInputChange}
                            placeholder="123"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                            required
                          />
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Delivery Address
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        placeholder="123 Main St"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          City
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          placeholder="New York"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="zipCode"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          ZIP Code
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          placeholder="10001"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        placeholder="(123) 456-7890"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">
                    Order Summary
                  </h2>
                  <div className="space-y-4">
                    <div className="max-h-60 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between py-2 border-b"
                        >
                          <span className="text-gray-600">
                            {item.quantity} x {item.menuItem.name}
                          </span>
                          <span className="text-gray-900">
                            ${(item.menuItem.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">
                          ${calculatedSubtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between mt-2">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="text-gray-900">$5.00</span>
                      </div>
                      <div className="border-t pt-4 mt-4 flex justify-between font-medium">
                        <span className="text-gray-900">Total</span>
                        <span className="text-gray-900">
                          ${calculatedTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className={`mt-6 w-full py-3 px-4 rounded-md font-medium text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      isProcessing
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-red-600 hover:bg-red-700 transition"
                    }`}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                  </button>

                  <Link href="/cart" legacyBehavior>
                    <a className="mt-4 block text-center text-sm text-red-600 hover:text-red-800">
                      Return to Cart
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CheckoutPage;
