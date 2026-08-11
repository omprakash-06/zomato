import { loadRazorpayScript } from "./loadRazorpay";

/**
 * Opens Razorpay checkout modal.
 * @param {object} orderData - { razorpayOrderId, amount, currency, key }
 * @param {object} prefill - { name, email }
 * @returns {Promise<{razorpay_order_id, razorpay_payment_id, razorpay_signature}>}
 */
export function openRazorpayCheckout(orderData, prefill = {}) {
  return new Promise(async (resolve, reject) => {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      reject(new Error("Failed to load Razorpay. Check your internet connection."));
      return;
    }

    const options = {
      key: orderData.key,
      amount: Math.round(orderData.amount * 100),
      currency: orderData.currency || "INR",
      order_id: orderData.razorpayOrderId,
      name: "coder.op",
      description: "Order Payment",
      prefill: { name: prefill.name || "", email: prefill.email || "" },
      theme: { color: "#4f46e5" },
      handler: (response) => resolve(response),
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled.")),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp) => reject(new Error(resp.error?.description || "Payment failed.")));
    rzp.open();
  });
}