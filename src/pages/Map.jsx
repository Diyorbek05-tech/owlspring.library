import React, { useState, useEffect } from 'react';
import { YMaps, Map as YandexMap, Placemark } from '@pbe/react-yandex-maps';
import { Box, Text, Loader, Center } from '@mantine/core';

const YANDEX_API_KEY = 'sizning-api-key';

const Map = ({ address, libraryName }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (address) {
      geocodeAddress(address);
    }
  }, [address]);

  const geocodeAddress = async (addressString) => {
    try {
      setLoading(true);
      const encodedAddress = encodeURIComponent(addressString);
      
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/?apikey=${YANDEX_API_KEY}&geocode=${encodedAddress}&format=json&results=1&lang=uz_UZ`
      );
      
      const data = await response.json();
      
      const geoObject = data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject;
      
      if (geoObject) {
        const pos = geoObject.Point.pos.split(' ');
        const coords = [parseFloat(pos[1]), parseFloat(pos[0])];
        setCoordinates(coords);
      } else {
        setCoordinates([41.2995, 69.2401]);
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setCoordinates([41.2995, 69.2401]);
      setError('Xaritani yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center style={{ height: '400px' }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (!coordinates) {
    return (
      <Box style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text c="dimmed">Xarita yuklanmadi</Text>
      </Box>
    );
  }

  return (
    <Box style={{ width: '100%', height: '100%' }}>
      {error && (
        <Text size="sm" c="orange" mb="xs" p="md">
          {error}
        </Text>
      )}
      <YMaps query={{ apikey: YANDEX_API_KEY, lang: 'uz_UZ' }}>
        <YandexMap
          defaultState={{
            center: coordinates,
            zoom: 15,
            controls: ['zoomControl', 'fullscreenControl', 'geolocationControl', 'typeSelector'],
          }}
          width="100%"
          height="100%"
          style={{ minHeight: '600px' }}
          modules={[
            'control.ZoomControl', 
            'control.FullscreenControl', 
            'control.GeolocationControl',
            'control.TypeSelector'
          ]}
          options={{
            suppressMapOpenBlock: true,
          }}
        >
          <Placemark
            geometry={coordinates}
            properties={{
              balloonContentHeader: `<strong style="font-size: 16px;">${libraryName}</strong>`,
              balloonContentBody: `<p style="margin: 8px 0;">${address}</p>`,
              hintContent: libraryName,
            }}
            options={{
              preset: 'islands#blueBookIcon',
              iconColor: '#1971c2',
            }}
          />
        </YandexMap>
      </YMaps>
    </Box>
  );
};

export default Map;