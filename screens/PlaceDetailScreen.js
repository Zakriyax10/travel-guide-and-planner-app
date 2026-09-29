import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Linking,
  Alert,
  Platform,
  Animated,
  Share,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";
import { useTrip } from "../context/TripContext";
import { useTheme } from "../context/ThemeContext";

const { width, height } = Dimensions.get("window");
const IMG_HEIGHT = height * 0.42;

const CATEGORY_CONFIG = {
  tourism: { icon: "camera", color: "#8B5CF6" },
  restaurant: { icon: "restaurant", color: "#F97316" },
  cafe: { icon: "cafe", color: "#92400E" },
  hotel: { icon: "bed", color: "#2563EB" },
  museum: { icon: "business", color: "#059669" },
  bar: { icon: "wine", color: "#DC2626" },
  park: { icon: "leaf", color: "#16A34A" },
  default: { icon: "location", color: COLORS.primary },
};

function StarRating({ rating, size = 16 }) {
  const val = parseFloat(rating) || 0;
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={
            i <= Math.floor(val)
              ? "star"
              : i === Math.ceil(val) && val % 1 >= 0.5
                ? "star-half"
                : "star-outline"
          }
          size={size}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

export default function PlaceDetailScreen({ route, navigation }) {
  const { theme, isDark } = useTheme();
  const { place } = route.params;
  const {
    isPlaceSaved,
    addPlaceToSaved,
    removePlaceFromSaved,
    trips,
    addPlaceToTrip,
  } = useTrip();
  const saved = isPlaceSaved(place.id);
  const [imgError, setImgError] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const cat = CATEGORY_CONFIG[place.category] || CATEGORY_CONFIG.default;

  const headerOpacity = scrollY.interpolate({
    inputRange: [IMG_HEIGHT - 100, IMG_HEIGHT - 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const imgScale = scrollY.interpolate({
    inputRange: [-100, 0],
    outputRange: [1.3, 1],
    extrapolate: "clamp",
  });

  const toggleSave = () => {
    if (saved) removePlaceFromSaved(place.id);
    else addPlaceToSaved(place);
  };

  const openGoogleMaps = () => {
    const scheme =
      Platform.OS === "ios"
        ? `maps:?q=${encodeURIComponent(place.name)}&ll=${place.latitude},${place.longitude}`
        : `geo:${place.latitude},${place.longitude}?q=${encodeURIComponent(place.name)}`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}&query_place_id=${place.placeId || ""}`;
    Linking.canOpenURL(scheme)
      .then((can) => Linking.openURL(can ? scheme : webUrl))
      .catch(() => Linking.openURL(webUrl));
  };

  const openGetDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}&destination_place_id=${place.placeId || ""}`;
    Linking.openURL(url);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${place.name} on TourPlanner!\nLocation: https://maps.google.com/?q=${place.latitude},${place.longitude}`,
        title: place.name,
      });
    } catch (_e) {}
  };

  const addToTrip = () => {
    if (trips.length === 0) {
      Alert.alert("No Trips", "Create a trip first in the Planner tab.");
      return;
    }
    if (trips.length === 1) {
      addPlaceToTrip(trips[0].id, place);
      Alert.alert("Added!", `${place.name} added to ${trips[0].name}`);
      return;
    }
    Alert.alert("Add to Trip", "Choose a trip:", [
      ...trips.map((t) => ({
        text: t.name,
        onPress: () => {
          addPlaceToTrip(t.id, place);
          Alert.alert("Added!", `${place.name} added to ${t.name}`);
        },
      })),
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const openWebsite = () => {
    if (place.website) {
      const url = place.website.startsWith("http")
        ? place.website
        : `https://${place.website}`;
      Linking.openURL(url);
    }
  };

  const callPhone = () => {
    if (place.phone) Linking.openURL(`tel:${place.phone}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Animated Sticky Header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          {
            opacity: headerOpacity,
            backgroundColor: theme.headerBg,
            borderBottomColor: theme.border,
            shadowColor: theme.shadowDark,
          },
        ]}
      >
        <Text
          style={[styles.stickyTitle, { color: theme.text }]}
          numberOfLines={1}
        >
          {place.name}
        </Text>
      </Animated.View>

      {/* Back / Share */}
      <View style={styles.topActions}>
        <TouchableOpacity
          style={[
            styles.actionBtn,
            {
              backgroundColor: isDark
                ? "rgba(15,23,42,0.9)"
                : "rgba(255,255,255,0.92)",
              shadowColor: theme.shadowDark,
            },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.topRight}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              {
                backgroundColor: isDark
                  ? "rgba(15,23,42,0.9)"
                  : "rgba(255,255,255,0.92)",
                shadowColor: theme.shadowDark,
              },
            ]}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              saved && { backgroundColor: theme.primaryLight },
              { shadowColor: theme.shadowDark },
            ]}
            onPress={toggleSave}
          >
            <Ionicons
              name={saved ? "bookmark" : "bookmark-outline"}
              size={20}
              color={saved ? theme.primary : theme.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          {
            useNativeDriver: false,
          },
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingBottom: 110,
          backgroundColor: theme.background,
        }}
      >
        {/* Hero Image */}
        <Animated.View
          style={[styles.heroWrapper, { transform: [{ scale: imgScale }] }]}
        >
          {place.image && !imgError ? (
            <Image
              source={{ uri: place.image }}
              style={styles.heroImage}
              resizeMode="cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <LinearGradient
              colors={isDark ? ["#1E293B", "#020617"] : ["#CBD5E1", "#94A3B8"]}
              style={styles.heroImage}
            >
              <Ionicons
                name={cat.icon}
                size={60}
                color="rgba(255,255,255,0.6)"
              />
            </LinearGradient>
          )}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.55)"]}
            style={styles.heroGrad}
          />
          <View style={styles.heroBadge}>
            <View style={[styles.catBadge, { backgroundColor: cat.color }]}>
              <Ionicons name={cat.icon} size={13} color="#fff" />
              <Text style={styles.catBadgeTxt}>
                {place.category.charAt(0).toUpperCase() +
                  place.category.slice(1)}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title + rating */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: theme.text }]}>
                {place.name}
              </Text>
              <View style={styles.ratingRow}>
                <StarRating rating={place.rating} />
                <Text style={[styles.ratingNum, { color: theme.text }]}>
                  {place.rating}
                </Text>
                <Text style={[styles.ratingCount, { color: theme.textSub }]}>
                  ({place.reviews} reviews)
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.distBadge,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <Ionicons name="walk" size={14} color={theme.primary} />
              <Text style={[styles.distBadgeTxt, { color: theme.primary }]}>
                {place.distance} mi
              </Text>
            </View>
          </View>

          {/* Address */}
          {place.address ? (
            <View style={styles.infoRow}>
              <View
                style={[styles.infoIcon, { backgroundColor: theme.inputBg }]}
              >
                <Ionicons name="location" size={16} color={theme.primary} />
              </View>
              <Text
                style={[styles.infoTxt, { color: theme.textSub }]}
                numberOfLines={2}
              >
                {place.address}
              </Text>
            </View>
          ) : null}

          {/* Walk time */}
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: theme.inputBg }]}>
              <Ionicons name="time" size={16} color={COLORS.secondary} />
            </View>
            <Text style={[styles.infoTxt, { color: theme.textSub }]}>
              {place.walkTime} min walk from your location
            </Text>
          </View>

          {/* Phone */}
          {place.phone ? (
            <TouchableOpacity style={styles.infoRow} onPress={callPhone}>
              <View
                style={[styles.infoIcon, { backgroundColor: theme.inputBg }]}
              >
                <Ionicons name="call" size={16} color={theme.success} />
              </View>
              <Text style={[styles.infoTxt, { color: theme.success }]}>
                {place.phone}
              </Text>
            </TouchableOpacity>
          ) : null}

          {/* Opening hours */}
          {place.openingHours ? (
            <View style={styles.infoRow}>
              <View
                style={[styles.infoIcon, { backgroundColor: theme.inputBg }]}
              >
                <Ionicons name="calendar" size={16} color={COLORS.warning} />
              </View>
              <Text style={[styles.infoTxt, { color: theme.textSub }]}>
                {place.openingHours}
              </Text>
            </View>
          ) : null}

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              About this place
            </Text>
            <Text style={[styles.description, { color: theme.textSub }]}>
              {place.description}
            </Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              {
                label: "Distance",
                value: `${place.distance} mi`,
                icon: "location",
                color: theme.primary,
              },
              {
                label: "Walk",
                value: `${place.walkTime} min`,
                icon: "walk",
                color: COLORS.secondary,
              },
              {
                label: "Rating",
                value: place.rating,
                icon: "star",
                color: "#F59E0B",
              },
            ].map((s) => (
              <View
                key={s.label}
                style={[
                  styles.statCard,
                  {
                    backgroundColor: theme.inputBg,
                  },
                ]}
              >
                <Ionicons name={s.icon} size={20} color={s.color} />
                <Text style={[styles.statVal, { color: theme.text }]}>
                  {s.value}
                </Text>
                <Text style={[styles.statLbl, { color: theme.textSub }]}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.gridBtn, styles.gridBtnPrimary]}
              onPress={openGetDirections}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[theme.primary, theme.primaryDark]}
                style={styles.gridBtnGrad}
              >
                <Ionicons name="navigate" size={20} color="#fff" />
                <Text style={styles.gridBtnTxtWhite}>Directions</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gridBtn,
                styles.gridBtnOutline,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.cardBg,
                  shadowColor: theme.shadowDark,
                },
              ]}
              onPress={openGoogleMaps}
              activeOpacity={0.85}
            >
              <Ionicons name="map" size={18} color={theme.primary} />
              <Text style={[styles.gridBtnTxt, { color: theme.primary }]}>
                Google Maps
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gridBtn,
                styles.gridBtnOutline,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.cardBg,
                  shadowColor: theme.shadowDark,
                },
              ]}
              onPress={addToTrip}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={18} color={COLORS.secondary} />
              <Text style={[styles.gridBtnTxt, { color: COLORS.secondary }]}>
                Add to Trip
              </Text>
            </TouchableOpacity>

            {place.website ? (
              <TouchableOpacity
                style={[
                  styles.gridBtn,
                  styles.gridBtnOutline,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.cardBg,
                    shadowColor: theme.shadowDark,
                  },
                ]}
                onPress={openWebsite}
                activeOpacity={0.85}
              >
                <Ionicons name="globe" size={18} color={COLORS.accent} />
                <Text style={[styles.gridBtnTxt, { color: COLORS.accent }]}>
                  Website
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.gridBtn,
                  styles.gridBtnOutline,
                  {
                    borderColor: theme.border,
                    backgroundColor: theme.cardBg,
                    shadowColor: theme.shadowDark,
                  },
                ]}
                onPress={toggleSave}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={saved ? "bookmark" : "bookmark-outline"}
                  size={18}
                  color={saved ? theme.primary : theme.gray}
                />
                <Text
                  style={[
                    styles.gridBtnTxt,
                    { color: saved ? theme.primary : theme.gray },
                  ]}
                >
                  {saved ? "Saved" : "Save"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Sticky CTA */}
      <View
        style={[
          styles.stickyBottom,
          {
            backgroundColor: theme.cardBg,
            borderTopColor: theme.border,
            shadowColor: theme.shadowDark,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.stickyAddBtn}
          onPress={addToTrip}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={[COLORS.secondary, "#EA580C"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.stickyBtnGrad}
          >
            <Ionicons name="add-circle" size={20} color="#fff" />
            <Text style={styles.stickyBtnTxt}>Add to My Trip</Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.stickyDirBtn,
            {
              backgroundColor: theme.primaryLight,
              borderColor: theme.primaryMid || COLORS.primaryMid,
            },
          ]}
          onPress={openGetDirections}
          activeOpacity={0.85}
        >
          <Ionicons name="navigate" size={20} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stickyHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 70,
    borderBottomWidth: 1,
    elevation: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    alignItems: "center",
  },
  stickyTitle: { fontSize: 16, fontWeight: "800" },
  topActions: {
    position: "absolute",
    top: 52,
    left: 0,
    right: 0,
    zIndex: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  topRight: { flexDirection: "row", gap: 10 },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  actionBtnActive: {},
  heroWrapper: { width: "100%", height: IMG_HEIGHT, overflow: "hidden" },
  heroImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  heroGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: 120 },
  heroBadge: { position: "absolute", bottom: 16, left: 16 },
  catBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  catBadgeTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  content: { paddingHorizontal: 20, paddingTop: 22 },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    gap: 12,
  },
  name: { fontSize: 24, fontWeight: "800", marginBottom: 8, lineHeight: 30 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingNum: { fontSize: 14, fontWeight: "700" },
  ratingCount: { fontSize: 13 },
  distBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexShrink: 0,
  },
  distBadgeTxt: { fontSize: 13, fontWeight: "700" },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  infoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  infoTxt: { flex: 1, fontSize: 14, lineHeight: 20 },
  section: { marginTop: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 10 },
  description: { fontSize: 14, lineHeight: 22 },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 14,
    gap: 4,
  },
  statVal: { fontSize: 15, fontWeight: "800" },
  statLbl: { fontSize: 11, fontWeight: "600" },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  gridBtn: {
    width: (width - 50) / 2,
    borderRadius: 14,
    overflow: "hidden",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  gridBtnPrimary: {
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
  },
  gridBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
  },
  gridBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1.5,
  },
  gridBtnTxtWhite: { color: "#fff", fontSize: 14, fontWeight: "700" },
  gridBtnTxt: { fontSize: 14, fontWeight: "700" },
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
    borderTopWidth: 1,
    elevation: 16,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  stickyAddBtn: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 6,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  stickyBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  stickyBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  stickyDirBtn: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
  },
});
