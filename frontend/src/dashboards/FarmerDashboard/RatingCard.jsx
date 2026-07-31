import { formatDate } from '../../utils/formatters';
import { Card, CardHeader, CardBody } from '../../components/common/Card';

export const RatingCard = ({ rating }) => {
  const ratingTypeEmojis = {
    product_quality: '🌾',
    delivery: '🚚',
    communication: '💬',
  };

  const emoji = ratingTypeEmojis[rating.rating_type] || '⭐';

  return (
    <Card className="border-2 border-yellow-200 hover:shadow-lg transition bg-yellow-50">
      <CardHeader
        title={`👤 ${rating.buyer_name}`}
        action={<div className="text-3xl">{emoji}</div>}
      />
      <CardBody>
        <div className="space-y-4">
          {/* Rating Type */}
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Rating Category</p>
            <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">{rating.rating_type.replace('_', ' ')}</p>
          </div>

          {/* Star Rating */}
          <div className="bg-white p-3 rounded-lg border border-yellow-300">
            <p className="text-xs text-yellow-700 font-semibold uppercase tracking-wide mb-2">Your Rating</p>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 text-3xl">
                {Array(5).fill(0).map((_, i) => (
                  <span key={i} className={i < rating.rating ? 'opacity-100' : 'opacity-30'}>
                    ⭐
                  </span>
                ))}
              </div>
              <div className="text-3xl font-bold text-yellow-600">{rating.rating}.0</div>
            </div>
          </div>

          {/* Review */}
          {rating.review && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wide mb-2">Review</p>
              <p className="text-gray-900 text-sm italic">&ldquo;{rating.review}&rdquo;</p>
            </div>
          )}

          {/* Date */}
          <div className="text-xs text-gray-500 flex items-center gap-2">
            📅 {formatDate(rating.created_at)}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
