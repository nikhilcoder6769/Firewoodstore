import React from 'react';
import { useState } from 'react';
import { useAppStore } from '../store';
import { Star, User } from 'lucide-react';

export function Reviews({ productId }: { productId: string }) {
  const { user, reviews, addReview } = useAppStore();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const productReviews = reviews.filter(r => r.productId === productId);
  const averageRating = productReviews.length > 0 
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
    : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a rating');
    
    addReview({
      id: Math.random().toString(36).substr(2, 9),
      productId,
      userName: user?.displayName || user?.email?.split('@')[0] || 'Anonymous',
      rating,
      comment,
      date: new Date().toISOString()
    });

    setRating(0);
    setComment('');
  };

  return (
    <div className="mt-16 pt-12 border-t border-border">
      <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

      <div className="flex flex-col md:flex-row gap-12">
        <div className="md:w-1/3">
          <div className="bg-surface p-6 rounded-xl border border-border sticky top-24">
            <div className="text-5xl font-bold mb-2">{averageRating.toFixed(1)}</div>
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-text-secondary'}`}
                />
              ))}
            </div>
            <p className="text-text-secondary text-sm mb-6">Based on {productReviews.length} reviews</p>

            {user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h4 className="font-bold text-sm">Write a Review</h4>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full bg-background border border-border rounded-lg p-3 text-sm min-h-[100px] focus:outline-none focus:border-primary text-text-primary resize-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-button-hover text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Submit Review
                </button>
              </form>
            ) : (
              <div className="text-center p-4 bg-background rounded-lg border border-border">
                <p className="text-sm text-text-secondary mb-3">Please log in to leave a review.</p>
              </div>
            )}
          </div>
        </div>

        <div className="md:w-2/3 space-y-6">
          {productReviews.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">
              No reviews yet. Be the first to review this product!
            </div>
          ) : (
            productReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(review => (
              <div key={review.id} className="bg-surface p-6 rounded-xl border border-border">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div>
                      <div className="font-bold">{review.userName}</div>
                      <div className="text-xs text-text-secondary">
                        {new Date(review.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
