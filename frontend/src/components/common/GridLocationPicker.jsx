import { useState } from 'react';

const GRID_SIZE = 200;

export const GridLocationPicker = ({ onChange, initial }) => {
  const [point, setPoint] = useState(
    initial && initial.latitude != null && initial.longitude != null
      ? { latitude: Number(initial.latitude), longitude: Number(initial.longitude) }
      : null,
  );

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const latitude = Math.max(0, Math.min(GRID_SIZE, Math.round((x / rect.width) * GRID_SIZE)));
    const longitude = Math.max(0, Math.min(GRID_SIZE, Math.round((y / rect.height) * GRID_SIZE)));
    const next = { latitude, longitude };
    setPoint(next);
    onChange?.(next);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        role="button"
        tabIndex="0"
        className="relative h-48 w-full cursor-crosshair overflow-hidden rounded-xl border-2 border-green-200 bg-[linear-gradient(#e8f5e9_1px,transparent_1px),linear-gradient(90deg,#e8f5e9_1px,transparent_1px)] bg-[size:10%_10%]"
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const rect = event.currentTarget.getBoundingClientRect();
            const latitude = Math.max(0, Math.min(GRID_SIZE, Math.round(((rect.width / 2) / rect.width) * GRID_SIZE)));
            const longitude = Math.max(0, Math.min(GRID_SIZE, Math.round(((rect.height / 2) / rect.height) * GRID_SIZE)));
            const next = { latitude, longitude };
            setPoint(next);
            onChange?.(next);
          }
        }}
      >
        {point && (
          <div
            className="absolute h-6 w-6 -translate-x-1/2 -translate-y-full text-xl"
            style={{ left: `${point.latitude}%`, top: `${point.longitude}%` }}
            title={`(${point.latitude}, ${point.longitude})`}
          >
            📍
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>City grid (0–200). Click to set your location.</span>
        {point ? (
          <span className="font-medium text-green-700">
            Location: ({point.latitude}, {point.longitude})
          </span>
        ) : (
          <span className="text-gray-400">No location selected</span>
        )}
      </div>
    </div>
  );
};
