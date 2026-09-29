
import React, { createContext, useContext, useState, useCallback } from 'react';

const TripContext = createContext();

export function TripProvider({ children }) {
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [trips, setTrips] = useState([
    {
      id: 't1',
      name: 'My Europe Trip',
      destination: 'Europe',
      duration: '7 days',
      budget: '$1200',
      places: [],
      coverColor: ['#2563EB', '#7C3AED'],
      createdAt: new Date().toISOString(),
    },
  ]);
  const [activeTrip, setActiveTrip] = useState('t1');

  const addPlaceToSaved = useCallback((place) => {
    setSavedPlaces((prev) => {
      const exists = prev.find((p) => p.id === place.id);
      if (exists) return prev;
      return [...prev, { ...place, savedAt: new Date().toISOString() }];
    });
  }, []);

  const removePlaceFromSaved = useCallback((placeId) => {
    setSavedPlaces((prev) => prev.filter((p) => p.id !== placeId));
  }, []);

  const isPlaceSaved = useCallback(
    (placeId) => savedPlaces.some((p) => p.id === placeId),
    [savedPlaces]
  );

  const addPlaceToTrip = useCallback((tripId, place) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t;
        const exists = t.places.find((p) => p.id === place.id);
        if (exists) return t;
        return { ...t, places: [...t.places, place] };
      })
    );
  }, []);

  const removePlaceFromTrip = useCallback((tripId, placeId) => {
    setTrips((prev) =>
      prev.map((t) => {
        if (t.id !== tripId) return t;
        return { ...t, places: t.places.filter((p) => p.id !== placeId) };
      })
    );
  }, []);

  const createTrip = useCallback((tripData) => {
    const newTrip = {
      id: `t${Date.now()}`,
      places: [],
      createdAt: new Date().toISOString(),
      coverColor: [
        ['#2563EB', '#7C3AED'],
        ['#059669', '#2563EB'],
        ['#DC2626', '#F97316'],
        ['#7C3AED', '#EC4899'],
      ][Math.floor(Math.random() * 4)],
      ...tripData,
    };
    setTrips((prev) => [...prev, newTrip]);
    setActiveTrip(newTrip.id);
    return newTrip;
  }, []);

  const deleteTrip = useCallback((tripId) => {
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  }, []);

  // ── NEW: Save AI itinerary as a trip with places ──────────────────
  const saveItineraryAsTrip = useCallback((tripData, places) => {
    const colors = [
      ['#2563EB', '#7C3AED'],
      ['#059669', '#2563EB'],
      ['#DC2626', '#F97316'],
      ['#7C3AED', '#EC4899'],
    ];
    const newTrip = {
      id: `t${Date.now()}`,
      places: places || [],
      createdAt: new Date().toISOString(),
      coverColor: colors[Math.floor(Math.random() * colors.length)],
      ...tripData,
    };
    setTrips((prev) => [...prev, newTrip]);
    setActiveTrip(newTrip.id);
    return newTrip;
  }, []);

  return (
    <TripContext.Provider
      value={{
        savedPlaces,
        trips,
        activeTrip,
        setActiveTrip,
        addPlaceToSaved,
        removePlaceFromSaved,
        isPlaceSaved,
        addPlaceToTrip,
        removePlaceFromTrip,
        createTrip,
        deleteTrip,
        saveItineraryAsTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

export function useTrip() {
  return useContext(TripContext);
}