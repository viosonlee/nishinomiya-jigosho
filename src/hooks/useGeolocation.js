import { useState, useCallback } from 'react';

/**
 * Custom hook to get user's current geolocation.
 */
export function useGeolocation() {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('GEOLOCATION_NOT_SUPPORTED');
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('PERMISSION_DENIED');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('POSITION_UNAVAILABLE');
            break;
          case error.TIMEOUT:
            setLocationError('TIMEOUT');
            break;
          default:
            setLocationError('UNKNOWN_ERROR');
        }
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setUserLocation(null);
    setLocationError(null);
  }, []);

  return { userLocation, locationError, isLocating, requestLocation, clearLocation };
}
