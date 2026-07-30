import { RatingCard } from './RatingCard';
import { Card, CardHeader } from '../../components/common/Card';

export const RatingList = ({ ratings }) => {
  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title={`My Ratings (${ratings.length})`}
          subtitle={`Average: ${avgRating} ⭐`}
        />
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ratings.length > 0 ? (
          ratings.map((rating) => (
            <RatingCard key={rating.id} rating={rating} />
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-600">
            No ratings yet
          </div>
        )}
      </div>
    </div>
  );
};
