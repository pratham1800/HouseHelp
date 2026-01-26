import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
}

interface UseLocationReturn {
  location: LocationData | null;
  loading: boolean;
  error: string | null;
  fetchLocation: () => Promise<LocationData | null>;
}

export const useLocation = (): UseLocationReturn => {
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      // Using OpenStreetMap's Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      // Build a readable address from components
      const address = data.address;
      const parts = [];
      
      if (address.neighbourhood) parts.push(address.neighbourhood);
      if (address.suburb) parts.push(address.suburb);
      if (address.city || address.town || address.village) {
        parts.push(address.city || address.town || address.village);
      }
      if (address.state) parts.push(address.state);
      if (address.postcode) parts.push(address.postcode);
      
      return parts.length > 0 ? parts.join(', ') : data.display_name;
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const fetchLocation = useCallback(async (): Promise<LocationData | null> => {
    if (!navigator.geolocation) {
      const errorMsg = 'Geolocation is not supported by your browser';
      setError(errorMsg);
      toast({
        title: 'Location Not Supported',
        description: errorMsg,
        variant: 'destructive',
      });
      return null;
    }

    setLoading(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          const address = await reverseGeocode(latitude, longitude);
          
          const locationData: LocationData = {
            latitude,
            longitude,
            address,
          };
          
          setLocation(locationData);
          setLoading(false);
          
          toast({
            title: 'Location Detected',
            description: address,
          });
          
          resolve(locationData);
        },
        (err) => {
          let errorMsg = 'Unable to retrieve your location';
          
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMsg = 'Location access was denied. Please enable location permissions.';
              break;
            case err.POSITION_UNAVAILABLE:
              errorMsg = 'Location information is unavailable.';
              break;
            case err.TIMEOUT:
              errorMsg = 'Location request timed out.';
              break;
          }
          
          setError(errorMsg);
          setLoading(false);
          
          toast({
            title: 'Location Error',
            description: errorMsg,
            variant: 'destructive',
          });
          
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes cache
        }
      );
    });
  }, [toast]);

  return {
    location,
    loading,
    error,
    fetchLocation,
  };
};
