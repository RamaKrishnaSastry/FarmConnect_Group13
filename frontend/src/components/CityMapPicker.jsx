import React, { useState } from 'react';
import './CityMapPicker.css';

export default function CityMapPicker({ latitude, longitude, onCoordinatesChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const gridSize = 200;
  const cellSize = 2;

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const gridWidth = rect.width;
    const gridHeight = rect.height;

    const newLat = Math.round((x / gridWidth) * gridSize * 100) / 100;
    const newLon = Math.round((y / gridHeight) * gridSize * 100) / 100;

    onCoordinatesChange({
      latitude: Math.min(Math.max(newLat, 0), gridSize),
      longitude: Math.min(Math.max(newLon, 0), gridSize),
    });
  };

  const pinX = latitude ? (latitude / gridSize) * 100 : 0;
  const pinY = longitude ? (longitude / gridSize) * 100 : 0;

  return (
    <div className="city-map-picker">
      <div className="map-container" onClick={handleMapClick}>
        <svg width="100%" height="100%" viewBox={`0 0 ${gridSize} ${gridSize}`} className="map-grid">
          {/* Grid lines */}
          {Array.from({ length: gridSize / 10 + 1 }).map((_, i) => (
            <g key={`grid-${i}`}>
              <line
                x1={i * 10}
                y1="0"
                x2={i * 10}
                y2={gridSize}
                className="grid-line"
              />
              <line
                x1="0"
                y1={i * 10}
                x2={gridSize}
                y2={i * 10}
                className="grid-line"
              />
            </g>
          ))}
        </svg>

        {/* Pin marker */}
        {latitude !== undefined && longitude !== undefined && (
          <div
            className="map-pin"
            style={{
              left: `${pinX}%`,
              top: `${pinY}%`,
            }}
          >
            📍
          </div>
        )}
      </div>

      <div className="map-info">
        <p className="map-instruction">Click on the map to set your location</p>
        <div className="coordinates-display">
          <span>
            Latitude (X): <strong>{latitude || '—'}</strong>
          </span>
          <span>
            Longitude (Y): <strong>{longitude || '—'}</strong>
          </span>
        </div>
        <p className="map-hint">
          City Grid Size: 0 - {gridSize} units
        </p>
      </div>
    </div>
  );
}
