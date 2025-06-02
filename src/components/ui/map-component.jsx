// src/components/MapComponent.jsx
import React, { useEffect, useRef, useState } from "react";
import Map, { Marker } from "react-map-gl";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN; // make sure this is defined

const MapComponent = ({ userLocation }) => {
  // 1) Initialize viewState from userLocation
  const mapRef = useRef(null);
  const [viewState, setViewState] = useState({
    latitude: userLocation.lat,
    longitude: userLocation.lng,
    zoom: 14,
  });

  // 2) Whenever userLocation prop changes, recenter the map
  useEffect(() => {
    setViewState((prev) => ({
      ...prev,
      latitude: userLocation.lat,
      longitude: userLocation.lng,
    }));
    console.log('Destination: ', {lng: userLocation.lng, lat: userLocation.lat})
    if(mapRef.current){
        mapRef.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          speed: 0.5,
          essential: true,
        });
    }
  }, [userLocation]);

  return (
    <Map
      {...viewState}
      onMove={(evt) => setViewState(evt.viewState)}
      style={{ width: "100%", height: "100vh" }}
      mapStyle="mapbox://styles/mapbox/streets-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <Marker
        longitude={userLocation.lng}
        latitude={userLocation.lat}
        anchor="center"
      >
        <img src="/images/car-icon.png" alt="Destination" width="30" height="30" />
        {/* <div
          style={{
            background: "red",
            borderRadius: "50%",
            width: "10px",
            height: "10px",
          }}
        /> */}
      </Marker>
      <Marker latitude={-76.7933445} longitude={18.0086873 }>
        <div
          style={{
            background: "red",
            borderRadius: "50%",
            width: "10px",
            height: "10px",
          }}
        />
      </Marker>

    </Map>
  );
};

export default MapComponent;
