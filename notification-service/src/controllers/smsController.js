const { sendSMS } = require('../services/dialogSmsService');

exports.sendSMSHandler = async (req, res) => {
  const { mobile, message } = req.body;

  if (!mobile || !message) {
    return res.status(400).json({ message: 'Mobile number and message are required' });
  }

  try {
    await sendSMS(mobile, message);
    res.status(200).json({ message: 'SMS sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send SMS', error: error.message });
  }
};
