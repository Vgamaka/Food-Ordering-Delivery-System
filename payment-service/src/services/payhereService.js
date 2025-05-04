const crypto = require("crypto");

const MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || "1230207";
const MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET ||  "MTYzMjA5Mzc2NjM0NjA2OTA4NjAxMzIwODEwMzU5NDE3OTA0NzgyMw==";

const generatePayHereHash = (orderId, amount, currency = "LKR") => {
  const formattedAmount = Number(amount).toFixed(2);
  const merchantSecretMd5 = crypto.createHash("md5").update(MERCHANT_SECRET).digest("hex").toUpperCase();

  const hash = crypto
    .createHash("md5")
    .update(MERCHANT_ID + orderId + formattedAmount + currency + merchantSecretMd5)
    .digest("hex")
    .toUpperCase();

  return hash;
};

module.exports = { generatePayHereHash };
