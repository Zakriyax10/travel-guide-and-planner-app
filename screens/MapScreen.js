import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CustomMarker from "../components/CustomMarker";
import PlaceCard, { CARD_WIDTH } from "../components/PlaceCard";
import COLORS from "../constants/colors";
import CONFIG from "../constants/config";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");
const GEO_KEY = CONFIG.GEOAPIFY_KEY;

const FILTERS = [
  { key: "all", label: "All", icon: "apps-outline" },
  { key: "tourism", label: "Tourism", icon: "camera-outline" },
  { key: "restaurant", label: "Eat", icon: "restaurant-outline" },
  { key: "cafe", label: "Café", icon: "cafe-outline" },
  { key: "hotel", label: "Hotel", icon: "bed-outline" },
  { key: "museum", label: "Museum", icon: "business-outline" },
];

function dist(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
}

function parseCategory(props) {
  if (!props) return "default";
  const cats = props.categories || [];
  if (cats.some((c) => c.includes("tourism") || c.includes("attraction")))
    return "tourism";
  if (cats.some((c) => c.includes("restaurant") || c.includes("food")))
    return "restaurant";
  if (cats.some((c) => c.includes("cafe") || c.includes("coffee")))
    return "cafe";
  if (cats.some((c) => c.includes("hotel") || c.includes("accommodation")))
    return "hotel";
  if (cats.some((c) => c.includes("museum") || c.includes("culture")))
    return "museum";
  if (cats.some((c) => c.includes("bar") || c.includes("night"))) return "bar";
  if (cats.some((c) => c.includes("park") || c.includes("nature")))
    return "park";
  return "default";
}

async function getPlaceImage(name, category, geoKey) {
  try {
    const res = await axios.get(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(
        name,
      )}&prop=pageimages&format=json&pithumbsize=500&origin=*`,
      { timeout: 5000 },
    );
    const pages = res.data?.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0];
      if (page?.thumbnail?.source) return page.thumbnail.source;
    }
  } catch (_) {}
  const fallbacks = {
    tourism:
      "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=500&q=80",
    restaurant:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&q=80",
    cafe: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&q=80",
    hotel:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500&q=80",
    museum:
      "https://images.unsplash.com/photo-1565060169194-19fabf63012a?w=500&q=80",
    park: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&q=80",
    bar: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=500&q=80",
    default:
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500&q=80",
  };
  return fallbacks[category] || fallbacks.default;
}

async function fetchNearbyPlaces(lat, lon) {
  try {
    const url = `https://api.geoapify.com/v2/places?categories=tourism,catering.restaurant,catering.cafe,accommodation.hotel,entertainment.museum,leisure.park&filter=circle:${lon},${lat},20000&limit=40&apiKey=${GEO_KEY}`;
    const res = await axios.get(url, { timeout: 15000 });
    return res.data?.features || [];
  } catch (e) {
    console.error("Geoapify error:", e.message);
    return [];
  }
}

const LIGHT_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#f0f4f8" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#546E7A" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#e8edf2" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#b3cde0" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#d4e8d0" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a2e" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#16213e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#0f3460" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1628" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#16213e" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#1a2f1a" }],
  },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#2d3561" }],
  },
];

export default function MapScreen({ navigation }) {
  const { theme, isDark } = useTheme();

  const [userLocation, setUserLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [routeCoords, setRouteCoords] = useState([]);
  const [showCards, setShowCards] = useState(false);
  const mapRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    initLocation();
  }, []);

  useEffect(() => {
    let result = places;
    if (activeFilter !== "all")
      result = result.filter((p) => p.category === activeFilter);
    if (searchQuery.trim())
      result = result.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    setFiltered(result);
  }, [places, activeFilter, searchQuery]);

  const initLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location access required");
      setLoading(false);
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = loc.coords;
      setUserLocation({ latitude, longitude });
      setLoading(false);
      await loadPlaces(latitude, longitude);
    } catch (e) {
      Alert.alert("Error", "Could not get location");
      setLoading(false);
    }
  };

  const loadPlaces = async (lat, lon) => {
    setLoadingPlaces(true);
    const raw = await fetchNearbyPlaces(lat, lon);
    const processed = await Promise.all(
      raw
        .filter((f) => f.geometry?.coordinates && f.properties?.name)
        .slice(0, 25)
        .map(async (f, idx) => {
          const props = f.properties;
          const [plon, plat] = f.geometry.coordinates;
          const cat = parseCategory(props);
          const distance = dist(lat, lon, plat, plon);
          const image = await getPlaceImage(props.name, cat, GEO_KEY);
          return {
            id: props.place_id || `${idx}-${Date.now()}`,
            name: props.name,
            category: cat,
            latitude: plat,
            longitude: plon,
            rating: (3.5 + Math.random() * 1.5).toFixed(1),
            reviews: Math.floor(10 + Math.random() * 300),
            image,
            distance,
            walkTime: Math.round(parseFloat(distance) * 20),
            address:
              [props.address_line1, props.city].filter(Boolean).join(", ") ||
              "Nearby",
            phone: props.contact?.phone || "",
            website: props.website || "",
            openingHours: props.opening_hours || "",
            description:
              props.description ||
              `Discover ${props.name}, a wonderful ${cat} spot near you. A must-visit destination for any traveller exploring this area.`,
            categories: props.categories || [],
            placeId: props.place_id || "",
          };
        }),
    );
    const sorted = processed.sort(
      (a, b) => parseFloat(a.distance) - parseFloat(b.distance),
    );
    setPlaces(sorted);
    if (sorted.length > 0) setShowCards(true);
    setLoadingPlaces(false);
  };

  const onMarkerPress = useCallback(
    (place) => {
      setSelectedPlace(place);
      setShowCards(true);
      mapRef.current?.animateToRegion(
        {
          latitude: place.latitude - 0.004,
          longitude: place.longitude,
          latitudeDelta: 0.018,
          longitudeDelta: 0.018,
        },
        500,
      );
      const idx = filtered.findIndex((p) => p.id === place.id);
      if (idx !== -1) {
        setTimeout(
          () =>
            listRef.current?.scrollToIndex({
              index: idx,
              animated: true,
              viewPosition: 0,
            }),
          400,
        );
      }
    },
    [filtered],
  );

  const showRoute = useCallback(
    (place) => {
      if (!userLocation) return;
      setRouteCoords([
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: place.latitude, longitude: place.longitude },
      ]);
      mapRef.current?.fitToCoordinates(
        [
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          { latitude: place.latitude, longitude: place.longitude },
        ],
        {
          edgePadding: { top: 100, right: 60, bottom: 320, left: 60 },
          animated: true,
        },
      );
    },
    [userLocation],
  );

  const openDetail = useCallback(
    (place) => {
      navigation.navigate("PlaceDetail", { place, userLocation });
    },
    [navigation, userLocation],
  );

  const recenter = () => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion(
      {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      },
      600,
    );
    setRouteCoords([]);
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingScreen, { backgroundColor: theme.background }]}
      >
        <LinearGradient
          colors={[theme.primaryLight, theme.background]}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          style={styles.loadingIcon}
        >
          <Ionicons name="map" size={32} color="#fff" />
        </LinearGradient>
        <Text style={[styles.loadingTitle, { color: theme.dark }]}>
          Finding your location...
        </Text>
        <ActivityIndicator
          size="large"
          color={theme.primary}
          style={{ marginTop: 20 }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {userLocation && (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFillObject}
          provider={PROVIDER_GOOGLE}
          customMapStyle={isDark ? DARK_MAP_STYLE : LIGHT_MAP_STYLE}
          initialRegion={{
            ...userLocation,
            latitudeDelta: 0.025,
            longitudeDelta: 0.025,
          }}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {filtered.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.latitude,
                longitude: place.longitude,
              }}
              onPress={() => onMarkerPress(place)}
              tracksViewChanges={false}
            >
              <CustomMarker
                category={place.category}
                selected={selectedPlace?.id === place.id}
                image={place.image}
              />
            </Marker>
          ))}
          {routeCoords.length === 2 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={theme.primary}
              strokeWidth={4}
              lineDashPattern={[8, 4]}
            />
          )}
        </MapView>
      )}

      {/* Search Row */}
      <View style={styles.searchRow}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: theme.cardBg,
              borderWidth: isDark ? 1 : 0,
              borderColor: theme.border,
            },
          ]}
        >
          <Ionicons name="search" size={19} color={theme.gray} />
          <TextInput
            style={[styles.searchInput, { color: theme.dark }]}
            placeholder="Search places..."
            placeholderTextColor={theme.gray}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={theme.gray} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.mapBtn,
            {
              backgroundColor: theme.cardBg,
              borderWidth: isDark ? 1 : 0,
              borderColor: theme.border,
            },
          ]}
          onPress={recenter}
        >
          <Ionicons name="locate" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <FlatList
          data={FILTERS}
          keyExtractor={(f) => f.key}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
          renderItem={({ item }) => {
            const active = activeFilter === item.key;
            return (
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? theme.primary : theme.cardBg,
                    borderColor: active ? theme.primary : theme.primaryMid,
                  },
                ]}
                onPress={() => setActiveFilter(item.key)}
              >
                <Ionicons
                  name={item.icon}
                  size={13}
                  color={active ? "#fff" : theme.primary}
                />
                <Text
                  style={[
                    styles.chipTxt,
                    { color: active ? "#fff" : theme.primary },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Loading places badge */}
      {loadingPlaces && (
        <View
          style={[
            styles.loadingBadge,
            {
              backgroundColor: theme.cardBg,
              borderWidth: isDark ? 1 : 0,
              borderColor: theme.border,
            },
          ]}
        >
          <ActivityIndicator size="small" color={theme.primary} />
          <Text style={[styles.loadingBadgeTxt, { color: theme.gray }]}>
            Loading places...
          </Text>
        </View>
      )}

      {/* Count badge */}
      {!loadingPlaces && filtered.length > 0 && (
        <TouchableOpacity
          style={[
            styles.countBadge,
            {
              backgroundColor: theme.cardBg,
              borderWidth: isDark ? 1 : 0,
              borderColor: theme.border,
            },
          ]}
          onPress={() => setShowCards((v) => !v)}
        >
          <Ionicons
            name={showCards ? "chevron-down" : "chevron-up"}
            size={14}
            color={theme.primary}
          />
          <Text style={[styles.countTxt, { color: theme.primary }]}>
            {filtered.length} places
          </Text>
        </TouchableOpacity>
      )}

      {/* Cards Panel */}
      {showCards && filtered.length > 0 && (
        <View
          style={[
            styles.cardsPanel,
            {
              backgroundColor: theme.cardBg,
              borderTopWidth: isDark ? 1 : 0,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.cardsPanelHandle,
              { backgroundColor: theme.grayMid },
            ]}
          />
          <TouchableOpacity
            style={[styles.cardsClose, { backgroundColor: theme.grayLight }]}
            onPress={() => setShowCards(false)}
          >
            <Ionicons name="close" size={17} color={theme.gray} />
          </TouchableOpacity>
          <FlatList
            ref={listRef}
            data={filtered}
            keyExtractor={(p) => p.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + 14}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 10 }}
            renderItem={({ item }) => (
              <PlaceCard
                place={item}
                onPress={() => openDetail(item)}
                onRoute={() => showRoute(item)}
                style={
                  selectedPlace?.id === item.id
                    ? { borderWidth: 2, borderColor: theme.primary }
                    : {}
                }
              />
            )}
            onMomentumScrollEnd={(e) => {
              const i = Math.round(
                e.nativeEvent.contentOffset.x / (CARD_WIDTH + 14),
              );
              if (filtered[i]) setSelectedPlace(filtered[i]);
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    marginBottom: 18,
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  searchRow: {
    position: "absolute",
    top: 52,
    left: 14,
    right: 14,
    flexDirection: "row",
    gap: 10,
    zIndex: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 9,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  mapBtn: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  filtersRow: {
    position: "absolute",
    top: 114,
    left: 0,
    right: 0,
    zIndex: 9,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderWidth: 1.5,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },
  chipTxt: {
    fontSize: 12,
    fontWeight: "700",
  },
  loadingBadge: {
    position: "absolute",
    bottom: 110,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 5,
  },
  loadingBadgeTxt: {
    fontSize: 13,
    fontWeight: "600",
  },
  countBadge: {
    position: "absolute",
    top: 168,
    right: 14,
    zIndex: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  countTxt: {
    fontSize: 12,
    fontWeight: "700",
  },
  cardsPanel: {
    position: "absolute",
    bottom: 72,
    left: 0,
    right: 0,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 12,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },
  cardsPanelHandle: {
    width: 42,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  cardsClose: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 5,
    width: 30,
    height: 30,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
});
