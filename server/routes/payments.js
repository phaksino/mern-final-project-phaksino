import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../server.js';
import mpesaService from '../services/mpesaService.js';

const router = express.Router();

// Initiate payment for event registration
router.post('/initiate', authenticate, async (req, res) => {
  try {
    const { event_id, ticket_quantity, phone_number } = req.body;
    const user_id = req.user.id;

    // Validate input
    if (!event_id || !ticket_quantity || !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Event ID, ticket quantity, and phone number are required'
      });
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check ticket availability
    if (event.available_tickets < ticket_quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.available_tickets} tickets available`
      });
    }

    // Calculate total amount
    const total_amount = event.ticket_price * ticket_quantity;

    // Check for existing pending registration
    const { data: existingRegistration } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .eq('payment_status', 'pending')
      .single();

    let registration_id;

    if (existingRegistration) {
      // Update existing registration
      const { data: updatedRegistration, error: updateError } = await supabase
        .from('registrations')
        .update({
          ticket_quantity,
          total_amount,
          phone_number
        })
        .eq('id', existingRegistration.id)
        .select()
        .single();

      if (updateError) throw updateError;
      registration_id = updatedRegistration.id;
    } else {
      // Create new registration
      const { data: newRegistration, error: registrationError } = await supabase
        .from('registrations')
        .insert([{
          event_id,
          user_id,
          ticket_quantity,
          total_amount,
          phone_number,
          payment_status: 'pending'
        }])
        .select()
        .single();

      if (registrationError) throw registrationError;
      registration_id = newRegistration.id;
    }

    // Format phone number for M-Pesa
    const formattedPhone = mpesaService.formatPhoneNumber(phone_number);

    // Initiate M-Pesa payment
    const paymentResult = await mpesaService.initiateSTKPush(
      formattedPhone,
      total_amount,
      `EVENT-${event_id.slice(0, 8)}`,
      `Payment for ${event.title}`
    );

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to initiate M-Pesa payment',
        error: paymentResult.error
      });
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        registration_id,
        amount: total_amount,
        phone_number: formattedPhone,
        mpesa_transaction_id: paymentResult.checkoutRequestID,
        status: 'initiated'
      }])
      .select()
      .single();

    if (paymentError) throw paymentError;

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      data: {
        payment,
        mpesa_response: {
          checkoutRequestID: paymentResult.checkoutRequestID,
          customerMessage: paymentResult.customerMessage
        }
      }
    });

  } catch (error) {
    console.error('Payment initiation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// M-Pesa callback endpoint
router.post('/callback', async (req, res) => {
  try {
    const callbackData = req.body;

    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

    // Check if payment was successful
    if (callbackData.Body.stkCallback.ResultCode === 0) {
      const callbackMetadata = callbackData.Body.stkCallback.CallbackMetadata;
      const metadataItems = callbackMetadata.Item;

      // Extract payment details
      const amount = metadataItems.find(item => item.Name === 'Amount')?.Value;
      const mpesaReceipt = metadataItems.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
      const phoneNumber = metadataItems.find(item => item.Name === 'PhoneNumber')?.Value;
      const transactionDate = metadataItems.find(item => item.Name === 'TransactionDate')?.Value;

      // Find payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('*')
        .eq('mpesa_transaction_id', callbackData.Body.stkCallback.CheckoutRequestID)
        .single();

      if (paymentError) {
        console.error('Payment record not found:', paymentError);
        return res.status(404).json({ ResultCode: 1, ResultDesc: 'Payment record not found' });
      }

      // Update payment status
      const { error: updatePaymentError } = await supabase
        .from('payments')
        .update({
          status: 'completed',
          mpesa_receipt: mpesaReceipt
        })
        .eq('id', payment.id);

      if (updatePaymentError) throw updatePaymentError;

      // Update registration status
      const { error: updateRegistrationError } = await supabase
        .from('registrations')
        .update({
          payment_status: 'paid',
          mpesa_receipt: mpesaReceipt
        })
        .eq('id', payment.registration_id);

      if (updateRegistrationError) throw updateRegistrationError;

      // Update event available tickets
      const { data: registration } = await supabase
        .from('registrations')
        .select('event_id, ticket_quantity')
        .eq('id', payment.registration_id)
        .single();

      if (registration) {
        await supabase.rpc('decrement_tickets', {
          event_id: registration.event_id,
          quantity: registration.ticket_quantity
        });
      }

      console.log(`Payment completed successfully for receipt: ${mpesaReceipt}`);
    } else {
      console.log('Payment failed:', callbackData.Body.stkCallback.ResultDesc);
      
      // Update payment status to failed
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('mpesa_transaction_id', callbackData.Body.stkCallback.CheckoutRequestID)
        .single();

      if (payment) {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', payment.id);

        await supabase
          .from('registrations')
          .update({ payment_status: 'failed' })
          .eq('id', payment.registration_id);
      }
    }

    // Always respond with success to M-Pesa
    res.json({
      ResultCode: 0,
      ResultDesc: "Success"
    });

  } catch (error) {
    console.error('Callback processing error:', error);
    res.json({
      ResultCode: 1,
      ResultDesc: "Failed"
    });
  }
});

// Check payment status
router.get('/status/:registration_id', authenticate, async (req, res) => {
  try {
    const { registration_id } = req.params;

    const { data: registration, error } = await supabase
      .from('registrations')
      .select(`
        *,
        payments(status, mpesa_receipt, created_at),
        events(title, location, event_date)
      `)
      .eq('id', registration_id)
      .eq('user_id', req.user.id)
      .single();

    if (error || !registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.json({
      success: true,
      data: { registration }
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's payment history
router.get('/history', authenticate, async (req, res) => {
  try {
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        *,
        payments(*),
        events(title, location, event_date, image_url)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { registrations }
    });

  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;