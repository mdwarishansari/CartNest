const Razorpay = require("razorpay");

let razorpayInstance = null;

const initRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("⚠️  Razorpay config not set — payment features disabled");
    return null;
  }

  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log("✅ Razorpay initialized");
  return razorpayInstance;
};

const getRazorpay = () => razorpayInstance;

module.exports = { initRazorpay, getRazorpay };
