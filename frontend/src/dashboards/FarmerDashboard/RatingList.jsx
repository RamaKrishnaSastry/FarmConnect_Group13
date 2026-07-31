import { RatingCard } from './RatingCard';

export const RatingList = ({ ratings }) => {
  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
    : 0;

  return (
    <div className="space-y-6">
      <div id="ratings-section" className="rounded-2xl border border-green-100 bg-green-50/70 p-5">
        <h2 className="text-2xl font-bold text-gray-900">My Ratings</h2>
        <p className="mt-1 text-sm text-gray-600">Average: {avgRating} ⭐</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {ratings.length > 0 ? (
          ratings.map((rating) => (
            <RatingCard key={rating.id} rating={rating} />
          ))
        ) : (
          <div className="col-span-2 rounded-2xl border border-dashed border-green-200 bg-green-50/50 py-10 text-center text-gray-600">
            No ratings yet
          </div>
        )}
      </div>
    </div>
  );
};
