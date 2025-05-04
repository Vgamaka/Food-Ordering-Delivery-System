// services/dialogSmsService.js
const axios = require('axios');

let cachedToken = null;
let tokenExpiryTime = null;

const username = 'drops';
const password = 'Drops.123';

const getToken = async () => {
  const now = Date.now();

  if (cachedToken && tokenExpiryTime && now < tokenExpiryTime) {
    return cachedToken;
  }

  try {
    const response = await axios.post('https://e-sms.dialog.lk/api/v1/login', {
      username,
      password,
    });

    if (response.data.status === 'success') {
      cachedToken = response.data.token;
      tokenExpiryTime = now + 11 * 60 * 1000; // Cache for 11 minutes
      return cachedToken;
    } else {
      throw new Error('Dialog SMS Auth Failed: ' + response.data.comment);
    }
  } catch (error) {
    console.error('❌ Error getting SMS token:', error.message);
    throw error;
  }
};

const sendSMS = async (mobile, message) => {
  try {
    const token = await getToken();
    const transactionId = Date.now().toString() + Math.floor(Math.random() * 10000);

    const payload = {
      msisdn: [{ mobile: mobile.replace(/^0/, '') }], // Remove leading 0
      sourceAddress: 'DSA academy', // Optional: your mask name
      message,
      transaction_id: transactionId,
    };

    const response = await axios.post('https://e-sms.dialog.lk/api/v1/sms', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data.status === 'success') {
      console.log(`✅ SMS sent successfully to ${mobile}`);
    } else {
      console.error('❌ SMS failed:', response.data.comment);
    }
  } catch (error) {
    console.error('❌ Error sending SMS:', error.message);
  }
};

module.exports = { sendSMS };
