import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { supabase } from '../server.js';

const router = express.Router();

// Get reviews for an event
router.get('/event/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    const { data: reviews, error } = await supabase
      .from('event_reviews')
      .select(`
        *,
        user:users(full_name, created_at)
      `)
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate average rating
    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    res.json({
      success: true,
      data: {
        reviews,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Create or update review
router.post('/', authenticate, async (req, res) => {
  try {
    const { event_id, rating, comment } = req.body;
    const user_id = req.user.id;

    // Check if user has attended the event
    const { data: registration } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .eq('payment_status', 'paid')
      .single();

    if (!registration) {
      return res.status(400).json({
        success: false,
        message: 'You can only review events you have attended'
      });
    }

    // Check for existing review
    const { data: existingReview } = await supabase
      .from('event_reviews')
      .select('id')
      .eq('event_id', event_id)
      .eq('user_id', user_id)
      .single();

    let review;

    if (existingReview) {
      // Update existing review
      const { data: updatedReview, error } = await supabase
        .from('event_reviews')
        .update({ rating, comment })
        .eq('id', existingReview.id)
        .select(`
          *,
          user:users(full_name, created_at)
        `)
        .single();

      if (error) throw error;
      review = updatedReview;
    } else {
      // Create new review
      const { data: newReview, error } = await supabase
        .from('event_reviews')
        .insert([{ event_id, user_id, rating, comment }])
        .select(`
          *,
          user:users(full_name, created_at)
        `)
        .single();

      if (error) throw error;
      review = newReview;
    }

    res.json({
      success: true,
      message: existingReview ? 'Review updated' : 'Review submitted',
      data: { review }
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete review
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: review, error } = await supabase
      .from('event_reviews')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;