import axios from 'axios';
import crypto from 'crypto';

class MpesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.businessShortCode = process.env.MPESA_BUSINESS_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackURL = process.env.MPESA_CALLBACK_URL;
    this.authURL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    this.stkPushURL = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
  }

  // Get access token
  async getAccessToken() {
    try {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(this.authURL, {
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      return response.data.access_token;
    } catch (error) {
      console.error('M-Pesa Auth Error:', error.response?.data || error.message);
      throw new Error('Failed to get M-Pesa access token');
    }
  }

  // Generate password for STK push
  generatePassword() {
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, -4);
    const password = Buffer.from(`${this.businessShortCode}${this.passkey}${timestamp}`).toString('base64');
    return { password, timestamp };
  }

  // Initiate STK push
  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const requestData = {
        BusinessShortCode: this.businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: this.businessShortCode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.callbackURL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      const response = await axios.post(this.stkPushURL, requestData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        checkoutRequestID: response.data.CheckoutRequestID,
        customerMessage: response.data.CustomerMessage,
        responseCode: response.data.ResponseCode
      };

    } catch (error) {
      console.error('M-Pesa STK Push Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data || error.message
      };
    }
  }

  // Validate phone number format for M-Pesa
  formatPhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Handle Lesotho numbers (+266)
    if (cleaned.startsWith('266')) {
      return `254${cleaned.substring(3)}`;
    }
    
    // Handle Kenyan numbers
    if (cleaned.startsWith('0')) {
      return `254${cleaned.substring(1)}`;
    }
    
    if (cleaned.startsWith('254')) {
      return cleaned;
    }
    
    // If no country code, assume Kenyan
    if (cleaned.length === 9) {
      return `254${cleaned}`;
    }
    
    return cleaned;
  }
}

export default new MpesaService();