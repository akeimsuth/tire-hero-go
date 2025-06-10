// src/components/RouteAlongRoadMap.jsx
import React, { useEffect, useState, useRef } from 'react';
import Map, { Marker, Source, Layer } from 'react-map-gl';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import { dashboardAPI } from '@/services/api';
import { Loader2 } from 'lucide-react';

// const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * AnimatedRouteMap
 *
 * Props:
 *   - start: { lat: number, lng: number }
 *   - destination: { lat: number, lng: number }
 *   - animationDuration: number in ms (default: 10000 = 10s)
 *
 * The marker only animates if the route length > 0.001 km (i.e., start ≠ destination).
 */
const AnimatedRouteMap = ({ start, destination, animationDuration = 10000 }) => {
  // 1) viewState for centering/zoom
  const [viewState, setViewState] = useState({
    latitude: (start.lat + destination.lat) / 2,
    longitude: (start.lng + destination.lng) / 2,
    zoom: 18,
  });
  const [apiKeys, setAPIKeys] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 2) Hold the fetched route as a Turf Feature<LineString>
  const [routeFeature, setRouteFeature] = useState(null);

  // 3) Marker's current position
  const [markerPosition, setMarkerPosition] = useState({
    latitude: start.lat,
    longitude: start.lng,
  });

  // 4) Ref for animation frame ID
  const animationRef = useRef(null);

  // 5) Ref to store total route length (in kilometers)
  const routeLengthRef = useRef(0);

  useEffect(() => {
    const fetchAPIKeys = async () => {
      try {
        const response = await dashboardAPI.getAPI();
        setAPIKeys(response?.data?.mapboxKey);
      } catch (error) {
        console.error('Error fetching Mapbox key:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAPIKeys();
  }, []);

  // 6) Whenever start/destination change, fetch a new driving route
  useEffect(() => {
    if (!apiKeys || !start || !destination) return;

    // Build Mapbox Directions API URL
    const coords = `${start.lng},${start.lat};${destination.lng},${destination.lat}`;
    const directionsURL =
      `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}` +
      `?geometries=geojson&overview=full&access_token=${apiKeys}`;

    fetch(directionsURL)
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes || data.routes.length === 0) {
          console.error('No route found');
          return;
        }

        // data.routes[0].geometry is a raw LineString geometry
        const rawGeom = data.routes[0].geometry;

        // Wrap in a Turf Feature<LineString>
        const lineFeat = turf.lineString(rawGeom.coordinates);
        setRouteFeature(lineFeat);

        // Compute its total length (in kilometers)
        const lengthKm = turf.length(lineFeat, { units: 'kilometers' });
        routeLengthRef.current = lengthKm;

        // Recenter map to route's bbox
        const [minLng, minLat, maxLng, maxLat] = turf.bbox(lineFeat);
        setViewState((vs) => ({
          ...vs,
          longitude: (minLng + maxLng) / 2,
          latitude: (minLat + maxLat) / 2,
          zoom: 12,
        }));

        // If the route is effectively zero (start === destination), just place marker at start
        if (lengthKm < 0.001) {
          // Clear any running animation
          if (animationRef.current) cancelAnimationFrame(animationRef.current);
          setMarkerPosition({ latitude: start.lat, longitude: start.lng });
          return;
        }

        // Otherwise, reset marker to start and animate
        setMarkerPosition({ latitude: start.lat, longitude: start.lng });
        startAnimation(lineFeat, lengthKm);
      })
      .catch((err) => {
        console.error('Error fetching directions:', err);
      });

    return () => {
      // Cleanup any pending animation frame
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [start, destination, apiKeys]);

  // 7) Animate the marker along the route
  const startAnimation = (lineFeature, totalLengthKm) => {
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / animationDuration, 1); // fraction 0→1
      const distAlong = totalLengthKm * t; // km

      // Ensure we only call turf.along when length > 0
      if (totalLengthKm > 0) {
        const intermediatePoint = turf.along(lineFeature, distAlong, {
          units: 'kilometers',
        });
        const [lng, lat] = intermediatePoint.geometry.coordinates;
        setMarkerPosition({ latitude: lat, longitude: lng });
      }

      if (t < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationRef.current);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  // 8) Layer styling for the route line
  const routeLayer = {
    id: 'route-line',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#1db7dd',
      'line-width': 5,
      'line-opacity': 0.8,
    },
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!apiKeys) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        Unable to load map. Please try again later.
      </div>
    );
  }

  return (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: '100%', height: '100vh' }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={apiKeys}
    >
      {/* Only render the route line once we have it */}
      {routeFeature && (
        <Source id="route" type="geojson" data={routeFeature}>
          <Layer {...routeLayer} />
        </Source>
      )}

      {/* 9) Marker (animated only if route length > 0) */}
      <Marker
        longitude={markerPosition.longitude}
        latitude={markerPosition.latitude}
        anchor="center"
      >
        <img
          src="/images/car-icon.png"
          alt="Moving car"
          style={{ width: '40px', height: '40px' }}
        />
      </Marker>

      {/* 10) Start & destination pins */}
      <Marker longitude={start.lng} latitude={start.lat} anchor="center">
        <div
          style={{
            backgroundColor: 'black',
            borderRadius: '50%',
            width: '14px',
            height: '14px',
            border: '2px solid white',
          }}
        />
      </Marker>
      <Marker
        longitude={destination.lng}
        latitude={destination.lat}
        anchor="center"
      >
        <div
          style={{
            backgroundColor: 'red',
            borderRadius: '50%',
            width: '14px',
            height: '14px',
            border: '2px solid white',
          }}
        />
      </Marker>
    </Map>
  );
};

export default AnimatedRouteMap;
