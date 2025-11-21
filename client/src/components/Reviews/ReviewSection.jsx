import React, { useState, useEffect } from 'react';
import { reviewsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Star, MessageCircle, User, Edit3, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ReviewSection = ({ eventId }) => {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [userReview, setUserReview] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [eventId]);

  const fetchReviews = async () => {
    try {
      const response = await reviewsAPI.getByEvent(eventId);
      const { reviews, averageRating, totalReviews } = response.data.data;
      
      setReviews(reviews);
      setAverageRating(averageRating);
      setTotalReviews(totalReviews);
      
      // Find user's review
      if (user) {
        const userRev = reviews.find(r => r.user_id === user.id);
        setUserReview(userRev);
        if (userRev) {
          setReviewForm({
            rating: userRev.rating,
            comment: userRev.comment
          });
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to submit a review');
      return;
    }

    setSubmitting(true);
    try {
      const response = await reviewsAPI.create({
        event_id: eventId,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    try {
      const response = await reviewsAPI.delete(reviewId);
      
      if (response.data.success) {
        toast.success('Review deleted');
        setUserReview(null);
        setReviewForm({ rating: 5, comment: '' });
        fetchReviews();
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const StarRating = ({ rating, onRatingChange, editable = false }) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={editable ? "button" : "div"}
            onClick={editable ? () => onRatingChange(star) : undefined}
            className={`${editable ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="animate-pulse">Loading reviews...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Reviews Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-lesotho-blue" />
            Reviews & Comments
          </h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-1">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="font-semibold text-gray-900">{averageRating}</span>
              <span className="text-gray-500">({totalReviews} reviews)</span>
            </div>
          </div>
        </div>

        {isAuthenticated && !userReview && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="btn-primary"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Write Your Review</h4>
          <form onSubmit={handleSubmitReview}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <StarRating
                  rating={reviewForm.rating}
                  onRatingChange={(rating) => setReviewForm(prev => ({ ...prev, rating }))}
                  editable={true}
                />
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Comment
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  className="input-field"
                  placeholder="Share your experience at this event..."
                  required
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* User's Existing Review */}
      {userReview && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold text-gray-900">Your Review</span>
                <StarRating rating={userReview.rating} />
              </div>
              <p className="text-gray-700">{userReview.comment}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowReviewForm(true)}
                className="text-gray-500 hover:text-lesotho-blue"
                title="Edit review"
              >
                <Edit3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDeleteReview(userReview.id)}
                className="text-gray-500 hover:text-red-600"
                title="Delete review"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.filter(review => review.user_id !== user?.id).map((review) => (
          <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-lesotho-blue to-lesotho-green rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {review.user?.full_name?.charAt(0) || 'U'}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-semibold text-gray-900">
                    {review.user?.full_name || 'Anonymous User'}
                  </span>
                  <StarRating rating={review.rating} />
                </div>
                
                <p className="text-gray-700 mb-2">{review.comment}</p>
                
                <div className="text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === (userReview ? 1 : 0) && (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h4>
            <p className="text-gray-600">Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;