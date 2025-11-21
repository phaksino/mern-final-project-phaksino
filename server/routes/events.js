import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import { supabase } from '../server.js';

const router = express.Router();

// Get all published events with filtering
router.get('/', async (req, res) => {
  try {
    const { category, location, date, page = 1, limit = 10 } = req.query;
    
    let query = supabase
      .from('events')
      .select(`
        *,
        organizer:users(full_name, email)
      `)
      .eq('status', 'published')
      .order('event_date', { ascending: true });

    // Apply filters
    if (category) query = query.eq('category', category);
    if (location) query = query.ilike('location', `%${location}%`);
    if (date) query = query.eq('event_date', date);

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    query = query.range(from, to);

    const { data: events, error, count } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count
        }
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single event
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:users(full_name, email, phone_number),
        registrations(count)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: { event }
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create event (Organizers only)
router.post('/', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      venue,
      event_date,
      event_time,
      category,
      ticket_price,
      max_attendees,
      image_url
    } = req.body;

    const eventData = {
      title,
      description,
      location,
      venue,
      event_date,
      event_time,
      category,
      ticket_price: ticket_price || 0,
      available_tickets: max_attendees,
      max_attendees,
      organizer_id: req.user.id,
      image_url,
      status: 'draft'
    };

    const { data: event, error } = await supabase
      .from('events')
      .insert([eventData])
      .select(`
        *,
        organizer:users(full_name, email)
      `)
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update event
router.put('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user owns the event or is admin
    const { data: existingEvent } = await supabase
      .from('events')
      .select('organizer_id')
      .eq('id', id)
      .single();

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (req.user.role !== 'admin' && existingEvent.organizer_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own events.'
      });
    }

    const { data: event, error } = await supabase
      .from('events')
      .update(req.body)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get user's events (for organizers)
router.get('/user/my-events', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        registrations(count)
      `)
      .eq('organizer_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      data: { events }
    });

  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;