import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { supabase } from '../server.js';

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { full_name, phone_number } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .update({
        full_name,
        phone_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's event registrations
router.get('/registrations', authenticate, async (req, res) => {
  try {
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events(*),
        payments(*)
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { registrations }
    });

  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Admin: Get all users (admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { users }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Organizer: Get event registrations for organizer's events
router.get('/events/registrations', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { data: registrations, error } = await supabase
      .from('registrations')
      .select(`
        *,
        events(*),
        users(full_name, email, phone_number)
      `)
      .eq('events.organizer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { registrations }
    });

  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;