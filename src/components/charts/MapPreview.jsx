export const MapPreview = ({ latitude, longitude }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 h-80 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-2">Map Preview</p>
        <p className="text-sm text-gray-500">Lat: {latitude}, Lng: {longitude}</p>
      </div>
    </div>
  );
};
