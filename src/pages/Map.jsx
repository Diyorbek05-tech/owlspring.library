import React, { useEffect, useRef, useState } from "react";
import { Box, Text, Loader, Center } from "@mantine/core";

const YANDEX_API_KEY = import.meta.env.VITE_YANDEX_API_KEY || "";
const TASHKENT_CENTER = [41.2995, 69.2401];

const Map = ({ address, libraryName }) => {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [mapInstance, setMapInstance] = useState(null);
  const [error, setError] = useState(null);

  const loadYandexScript = () => {
    return new Promise((resolve, reject) => {
      if (!YANDEX_API_KEY) {
        setError("API key sozlanmagan!");
        reject("Invalid API key");
        return;
      }

      const existing = document.getElementById("yandex-map-script");
      if (existing) return resolve();

      const script = document.createElement("script");
      script.id = "yandex-map-script";
      script.src = `https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=uz_UZ`;
      script.async = true;

      script.onload = () => resolve();
      script.onerror = () => reject("Yandex API yuklanmadi");

      document.head.appendChild(script);
    });
  };

  const initMap = () => {
    if (!window.ymaps) {
      setError("Yandex xarita yuklanmadi!");
      return;
    }

    window.ymaps.ready(() => {
      const map = new window.ymaps.Map(mapRef.current, {
        center: TASHKENT_CENTER,
        zoom: 14,
        controls: ["zoomControl", "fullscreenControl"],
      });

      setMapInstance(map);
      setLoading(false);

      if (address) {
        geocodeAndSetMarker(address, map);
      } else {
        addMarker(TASHKENT_CENTER, map);
      }
    });
  };

  useEffect(() => {
    let active = true;

    loadYandexScript()
      .then(() => active && initMap())
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });

    return () => {
      active = false;
      if (mapInstance) mapInstance.destroy();
    };
  }, []);

  useEffect(() => {
    if (mapInstance && address) {
      geocodeAndSetMarker(address);
    }
  }, [address, mapInstance]);

  const addMarker = (coords, map = mapInstance) => {
    if (!map) return;

    map.geoObjects.removeAll();

    const placemark = new window.ymaps.Placemark(
      coords,
      {
        balloonContent: `<strong>${libraryName || "Xizmat markazi"}</strong><br/>${address || "Toshkent"}`,
        hintContent: libraryName || "Marker",
      },
      { preset: "islands#blueBookIcon" }
    );

    map.geoObjects.add(placemark);
  };

  const geocodeAndSetMarker = async (addressString, map = mapInstance) => {
    try {
      const encoded = encodeURIComponent(addressString);

      const res = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encoded}&format=json`
      );

      const data = await res.json();
      const geoObj =
        data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;

      if (!geoObj) {
        setError("Manzil topilmadi");
        addMarker(TASHKENT_CENTER, map);
        return;
      }

      const [lon, lat] = geoObj.Point.pos.split(" ");
      const coords = [parseFloat(lat), parseFloat(lon)];

      map.setCenter(coords, 15);
      addMarker(coords, map);
      setError(null);
    } catch {
      setError("Geocoding xatosi");
      addMarker(TASHKENT_CENTER, map);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: "400px" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  return (
    <Box style={{ width: "100%", height: "100%" }}>
      {error && (
        <Text c="orange" size="sm" mb="xs">
          {error}
        </Text>
      )}
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: "600px",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      />
    </Box>
  );
};

export default Map;
