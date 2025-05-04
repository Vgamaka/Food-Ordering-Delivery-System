const { generatePayHereHash } = require('../services/payhereService');

exports.createHashHandler = (req, res) => {
  const { orderId, amount, currency } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({ message: "orderId and amount are required" });
  }

  try {
    const hash = generatePayHereHash(orderId, amount, currency || "LKR");
    return res.status(200).json({ hash });
  } catch (error) {
    console.error("❌ Error generating hash:", error.message);
    return res.status(500).json({ message: "Failed to generate hash" });
  }
};
