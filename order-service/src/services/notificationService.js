const axios = require("axios");

// Use env value or fallback to default
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3004";

const sendSMS = async (mobile, message) => {
  const url = `${NOTIFICATION_SERVICE_URL}/api/sms`;
  console.log("📡 Sending SMS via notification-service to URL:", url);

  try {
    const response = await axios.post(url, {
      mobile,
      message,
    });

    console.log(`✅ SMS request successful with status ${response.status}`);
  } catch (err) {
    console.error("❌ Failed to send SMS via notification-service:", err.message);
    if (err.response) {
      console.error("📩 Response data:", err.response.data);
    }
  }
};

module.exports = { sendSMS };
