
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Image,
  Modal,
  Dimensions,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTrip } from "../context/TripContext";
import { useTheme } from "../context/ThemeContext";

const { width } = Dimensions.get("window");

function StarRating({ rating }) {
  const val = parseFloat(rating) || 0;
  return (
    <View style={{ flexDirection: "row", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={i <= Math.floor(val) ? "star" : "star-outline"}
          size={10}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

// ─── AI Place Detail Bottom Sheet ─────────────────────────────────────
function AIPlaceDetailModal({ visible, place, onClose, theme }) {
  if (!place) return null;

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open Google Maps")
    );
  };

  const openGoogleSearch = () => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(place.name)}`;
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open browser")
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={aiModal.overlay}>
        <View style={[aiModal.sheet, { backgroundColor: theme.cardBg }]}>
          {/* Handle */}
          <View style={[aiModal.handle, { backgroundColor: theme.grayMid }]} />

          {/* AI Badge Header */}
          <View style={aiModal.headerRow}>
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={aiModal.headerIcon}
            >
              <Ionicons name="sparkles" size={22} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text
                style={[aiModal.placeName, { color: theme.text }]}
                numberOfLines={2}
              >
                {place.name}
              </Text>
              <View style={aiModal.aiBadgeRow}>
                <View
                  style={[
                    aiModal.aiBadge,
                    { backgroundColor: theme.primaryLight },
                  ]}
                >
                  <Ionicons name="sparkles" size={10} color={theme.primary} />
                  <Text style={[aiModal.aiBadgeTxt, { color: theme.primary }]}>
                    AI Suggested
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Info Cards */}
          <View style={aiModal.infoGrid}>
            <View
              style={[aiModal.infoCard, { backgroundColor: theme.inputBg }]}
            >
              <Ionicons name="star" size={18} color="#F59E0B" />
              <Text style={[aiModal.infoVal, { color: theme.text }]}>
                {place.rating}
              </Text>
              <Text style={[aiModal.infoLbl, { color: theme.textSub }]}>
                Rating
              </Text>
            </View>
            <View
              style={[aiModal.infoCard, { backgroundColor: theme.inputBg }]}
            >
              <Ionicons name="location" size={18} color={theme.primary} />
              <Text
                style={[aiModal.infoVal, { color: theme.text }]}
                numberOfLines={1}
              >
                {place.category}
              </Text>
              <Text style={[aiModal.infoLbl, { color: theme.textSub }]}>
                Category
              </Text>
            </View>
          </View>

          {/* Address Note */}
          <View
            style={[
              aiModal.noticeBox,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primaryMid,
              },
            ]}
          >
            <Ionicons name="information-circle" size={16} color={theme.primary} />
            <Text style={[aiModal.noticeTxt, { color: theme.primary }]}>
              This place was suggested by AI. Tap below to find exact location
              and details on Google Maps.
            </Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={aiModal.mapsBtn}
            onPress={openGoogleMaps}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={aiModal.mapsBtnGrad}
            >
              <Ionicons name="map" size={18} color="#fff" />
              <Text style={aiModal.mapsBtnTxt}>Open in Google Maps</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              aiModal.searchBtn,
              {
                backgroundColor: theme.inputBg,
                borderColor: theme.border,
              },
            ]}
            onPress={openGoogleSearch}
            activeOpacity={0.85}
          >
            <Ionicons name="search" size={16} color={theme.primary} />
            <Text style={[aiModal.searchBtnTxt, { color: theme.primary }]}>
              Search on Google
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={aiModal.closeBtn} onPress={onClose}>
            <Text style={[aiModal.closeTxt, { color: theme.gray }]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function CreateTripModal({ visible, onClose, onCreate }) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");

  const handleCreate = () => {
    if (!name.trim() || !destination.trim()) {
      Alert.alert("Required", "Trip name and destination are required");
      return;
    }
    onCreate({
      name: name.trim(),
      destination: destination.trim(),
      duration: duration || "TBD",
      budget: budget || "TBD",
    });
    setName("");
    setDestination("");
    setDuration("");
    setBudget("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modal.overlay}>
        <View style={[modal.sheet, { backgroundColor: theme.cardBg }]}>
          <View style={[modal.handle, { backgroundColor: theme.grayMid }]} />
          <Text style={[modal.title, { color: theme.dark }]}>
            Create New Trip ✈️
          </Text>
          {[
            {
              icon: "bookmark",
              ph: "Trip name (e.g. Europe 2024)",
              val: name,
              set: setName,
            },
            {
              icon: "location",
              ph: "Destination",
              val: destination,
              set: setDestination,
            },
            {
              icon: "calendar",
              ph: "Duration (e.g. 7 days)",
              val: duration,
              set: setDuration,
            },
            {
              icon: "cash",
              ph: "Budget (e.g. $1200)",
              val: budget,
              set: setBudget,
            },
          ].map(({ icon, ph, val, set }) => (
            <View
              key={ph}
              style={[modal.field, { backgroundColor: theme.inputBg }]}
            >
              <Ionicons name={`${icon}-outline`} size={18} color={theme.gray} />
              <TextInput
                style={[modal.input, { color: theme.dark }]}
                placeholder={ph}
                placeholderTextColor={theme.gray}
                value={val}
                onChangeText={set}
              />
            </View>
          ))}
          <TouchableOpacity
            style={modal.createBtn}
            onPress={handleCreate}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={modal.createBtnGrad}
            >
              <Text style={modal.createBtnTxt}>Create Trip</Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={modal.cancelBtn} onPress={onClose}>
            <Text style={[modal.cancelTxt, { color: theme.gray }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function TripPlannerScreen({ navigation }) {
  const { theme } = useTheme();
  const {
    savedPlaces,
    trips,
    activeTrip,
    setActiveTrip,
    removePlaceFromSaved,
    addPlaceToTrip,
    removePlaceFromTrip,
    createTrip,
    deleteTrip,
  } = useTrip();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("trips");

  // ── AI Place Modal State ──
  const [selectedAIPlace, setSelectedAIPlace] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);

  const currentTrip = trips.find((t) => t.id === activeTrip) || trips[0];

  const handleDeleteTrip = (tripId) => {
    Alert.alert("Delete Trip", "Are you sure you want to delete this trip?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTrip(tripId),
      },
    ]);
  };

  const handleAddSavedToTrip = (place) => {
    if (!currentTrip) {
      Alert.alert("No Trip", "Create a trip first");
      return;
    }
    addPlaceToTrip(currentTrip.id, place);
    Alert.alert("Added!", `${place.name} added to ${currentTrip.name}`);
  };

  // ── Handle place tap ──────────────────────────────────────────────
  const handlePlaceTap = (place) => {
    const isAIPlace = place.category === "AI Suggested";
    if (isAIPlace) {
      setSelectedAIPlace(place);
      setShowAIModal(true);
    } else {
      navigation.navigate("PlaceDetail", { place });
    }
  };

  const renderTripCard = ({ item }) => {
    const isActive = item.id === activeTrip;
    return (
      <TouchableOpacity
        style={[styles.tripCard, isActive && styles.tripCardActive]}
        onPress={() => setActiveTrip(item.id)}
        activeOpacity={0.88}
      >
        <LinearGradient colors={item.coverColor} style={styles.tripCardGrad}>
          <View style={styles.tripCardTop}>
            <View style={styles.tripCardBadge}>
              <Text style={styles.tripCardBadgeTxt}>
                {item.places.length} stops
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleDeleteTrip(item.id)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="trash-outline"
                size={16}
                color="rgba(255,255,255,0.7)"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.tripCardBottom}>
            <Text style={styles.tripCardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.tripCardSub}>
              {item.destination} · {item.duration}
            </Text>
            {item.budget !== "TBD" && (
              <Text style={styles.tripCardBudget}>{item.budget}</Text>
            )}
          </View>
          {isActive && (
            <View style={styles.activeDot}>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // ── Render place in trip ──────────────────────────────────────────
  const renderPlaceInTrip = ({ item, index }) => {
    const isAIPlace = item.category === "AI Suggested";

    return (
      <TouchableOpacity
        style={[
          styles.tripPlace,
          {
            backgroundColor: theme.cardBg,
            shadowColor: theme.shadowDark,
          },
        ]}
        onPress={() => handlePlaceTap(item)}
        activeOpacity={0.85}
      >
        {/* Index Number */}
        <View
          style={[styles.tripPlaceIndex, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.tripPlaceIndexTxt}>{index + 1}</Text>
        </View>

        {/* Image or AI Icon */}
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.tripPlaceImg} />
        ) : (
          <View
            style={[
              styles.tripPlaceImg,
              {
                backgroundColor: isAIPlace
                  ? theme.primaryLight
                  : theme.grayLight,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
          >
            <Ionicons
              name={isAIPlace ? "sparkles" : "image-outline"}
              size={22}
              color={isAIPlace ? theme.primary : theme.gray}
            />
          </View>
        )}

        {/* Info */}
        <View style={styles.tripPlaceInfo}>
          <Text
            style={[styles.tripPlaceName, { color: theme.dark }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          <View style={styles.tripPlaceRow}>
            <StarRating rating={item.rating} />
            {item.distance !== "N/A" && (
              <Text style={[styles.tripPlaceDist, { color: theme.gray }]}>
                · {item.distance} mi
              </Text>
            )}
          </View>

          {/* Category + AI tag */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            {isAIPlace && (
              <View
                style={[
                  styles.aiTag,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <Ionicons name="sparkles" size={9} color={theme.primary} />
                <Text style={[styles.aiTagTxt, { color: theme.primary }]}>
                  AI
                </Text>
              </View>
            )}
            <Text
              style={[styles.tripPlaceCat, { color: theme.gray }]}
              numberOfLines={1}
            >
              {item.category}
            </Text>
          </View>
        </View>

        {/* Right side */}
        <View style={styles.tripPlaceRight}>
          <Ionicons name="chevron-forward" size={16} color={theme.gray} />
          <TouchableOpacity
            onPress={() => removePlaceFromTrip(currentTrip.id, item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{ marginTop: 6 }}
          >
            <Ionicons name="close-circle" size={22} color={theme.grayMid} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSavedPlace = ({ item }) => (
    <View
      style={[
        styles.savedCard,
        {
          backgroundColor: theme.cardBg,
          shadowColor: theme.shadowDark,
        },
      ]}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.savedImg} />
      ) : (
        <View
          style={[
            styles.savedImg,
            {
              backgroundColor: theme.grayLight,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Ionicons name="image-outline" size={22} color={theme.gray} />
        </View>
      )}
      <View style={styles.savedInfo}>
        <Text
          style={[styles.savedName, { color: theme.dark }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <View style={styles.savedRow}>
          <StarRating rating={item.rating} />
          <Text style={[styles.savedDist, { color: theme.gray }]}>
            {" "}
            {item.distance} mi
          </Text>
        </View>
        <Text
          style={[styles.savedCat, { color: theme.gray }]}
          numberOfLines={1}
        >
          {item.category}
        </Text>
      </View>
      <View style={styles.savedActions}>
        <TouchableOpacity
          style={[styles.savedAddBtn, { backgroundColor: theme.primary }]}
          onPress={() => handleAddSavedToTrip(item)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={14} color="#fff" />
          <Text style={styles.savedAddTxt}>Add</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.savedRemoveBtn,
            { backgroundColor: theme.dangerLight },
          ]}
          onPress={() => removePlaceFromSaved(item.id)}
        >
          <Ionicons name="trash-outline" size={14} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <LinearGradient
        colors={[theme.headerBg, theme.background]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.dark }]}>
              Trip Planner
            </Text>
            <Text style={[styles.headerSub, { color: theme.gray }]}>
              Organise your adventures
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addTripBtn}
            onPress={() => setShowModal(true)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={styles.addTripBtnGrad}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addTripTxt}>New Trip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={[styles.tabs, { backgroundColor: theme.grayLight }]}>
          {["trips", "saved"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && [
                  styles.tabActive,
                  { backgroundColor: theme.cardBg },
                ],
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={
                  tab === "trips"
                    ? activeTab === tab
                      ? "map"
                      : "map-outline"
                    : activeTab === tab
                      ? "bookmark"
                      : "bookmark-outline"
                }
                size={15}
                color={activeTab === tab ? theme.primary : theme.gray}
              />
              <Text
                style={[
                  styles.tabTxt,
                  { color: theme.gray },
                  activeTab === tab && [
                    styles.tabTxtActive,
                    { color: theme.primary },
                  ],
                ]}
              >
                {tab === "trips"
                  ? `My Trips (${trips.length})`
                  : `Saved (${savedPlaces.length})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {activeTab === "trips" ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {trips.length === 0 ? (
            <View style={styles.empty}>
              <LinearGradient
                colors={[theme.primaryLight, theme.grayLight]}
                style={styles.emptyIcon}
              >
                <Ionicons name="map-outline" size={36} color={theme.primary} />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: theme.dark }]}>
                No trips yet
              </Text>
              <Text style={[styles.emptySub, { color: theme.gray }]}>
                Create your first trip to get started
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                onPress={() => setShowModal(true)}
              >
                <Text style={styles.emptyBtnTxt}>Create Trip</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                data={trips}
                keyExtractor={(t) => t.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  gap: 14,
                }}
                renderItem={renderTripCard}
              />

              {/* Active Trip Places */}
              {currentTrip && (
                <View style={styles.activeTripSection}>
                  <View style={styles.activeTripHeader}>
                    <View>
                      <Text
                        style={[styles.activeTripTitle, { color: theme.dark }]}
                      >
                        {currentTrip.name}
                      </Text>
                      <Text
                        style={[styles.activeTripSub, { color: theme.gray }]}
                      >
                        {currentTrip.destination} · {currentTrip.duration} ·{" "}
                        {currentTrip.budget}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.activeTripBadge,
                        { backgroundColor: theme.primaryLight },
                      ]}
                    >
                      <Text
                        style={[
                          styles.activeTripBadgeTxt,
                          { color: theme.primary },
                        ]}
                      >
                        {currentTrip.places.length} stops
                      </Text>
                    </View>
                  </View>

                  {currentTrip.places.length === 0 ? (
                    <View
                      style={[
                        styles.emptyTrip,
                        {
                          backgroundColor: theme.cardBg,
                          borderColor: theme.border,
                        },
                      ]}
                    >
                      <Ionicons
                        name="location-outline"
                        size={32}
                        color={theme.grayMid}
                      />
                      <Text
                        style={[styles.emptyTripTxt, { color: theme.dark }]}
                      >
                        No places added yet
                      </Text>
                      <Text
                        style={[styles.emptyTripSub, { color: theme.gray }]}
                      >
                        Browse the map or use AI Guide to add places
                      </Text>
                      <TouchableOpacity
                        style={[
                          styles.browseBtn,
                          { backgroundColor: theme.primaryLight },
                        ]}
                        onPress={() => navigation.navigate("Map")}
                      >
                        <Ionicons
                          name="map-outline"
                          size={14}
                          color={theme.primary}
                        />
                        <Text
                          style={[
                            styles.browseBtnTxt,
                            { color: theme.primary },
                          ]}
                        >
                          Browse Map
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.placesList}>
                      {currentTrip.places.map((place, index) => (
                        <View key={place.id}>
                          {renderPlaceInTrip({ item: place, index })}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {savedPlaces.length === 0 ? (
            <View style={styles.empty}>
              <LinearGradient
                colors={[theme.primaryLight, theme.grayLight]}
                style={styles.emptyIcon}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={36}
                  color={theme.primary}
                />
              </LinearGradient>
              <Text style={[styles.emptyTitle, { color: theme.dark }]}>
                No saved places
              </Text>
              <Text style={[styles.emptySub, { color: theme.gray }]}>
                Bookmark places on the map to see them here
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: theme.primary }]}
                onPress={() => navigation.navigate("Map")}
              >
                <Text style={styles.emptyBtnTxt}>Explore Map</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={savedPlaces}
              keyExtractor={(p) => p.id}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 12,
                paddingBottom: 100,
              }}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              renderItem={renderSavedPlace}
            />
          )}
        </View>
      )}

      {/* Create Trip Modal */}
      <CreateTripModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreate={createTrip}
      />

      {/* AI Place Detail Modal */}
      <AIPlaceDetailModal
        visible={showAIModal}
        place={selectedAIPlace}
        onClose={() => {
          setShowAIModal(false);
          setSelectedAIPlace(null);
        }}
        theme={theme}
      />
    </View>
  );
}

const aiModal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 44,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  headerIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  placeName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    lineHeight: 24,
  },
  aiBadgeRow: { flexDirection: "row" },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  aiBadgeTxt: { fontSize: 11, fontWeight: "700" },
  infoGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    borderRadius: 16,
    alignItems: "center",
    paddingVertical: 14,
    gap: 4,
  },
  infoVal: { fontSize: 15, fontWeight: "800" },
  infoLbl: { fontSize: 11, fontWeight: "600" },
  noticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  noticeTxt: { flex: 1, fontSize: 13, lineHeight: 19, fontWeight: "500" },
  mapsBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 10,
    elevation: 6,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  mapsBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  mapsBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  searchBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 13,
    marginBottom: 10,
  },
  searchBtnTxt: { fontSize: 15, fontWeight: "600" },
  closeBtn: { alignItems: "center", paddingVertical: 10 },
  closeTxt: { fontSize: 15, fontWeight: "500" },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 44,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 20 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 12,
  },
  input: { flex: 1, fontSize: 15 },
  createBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 12,
    elevation: 6,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  createBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  createBtnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancelBtn: { alignItems: "center", paddingVertical: 10 },
  cancelTxt: { fontSize: 15, fontWeight: "500" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 52, paddingBottom: 0, paddingHorizontal: 20 },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  headerTitle: { fontSize: 26, fontWeight: "800" },
  headerSub: { fontSize: 14, marginTop: 2 },
  addTripBtn: {
    borderRadius: 14,
    overflow: "hidden",
    elevation: 4,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  addTripBtnGrad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addTripTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },
  tabs: {
    flexDirection: "row",
    gap: 4,
    borderRadius: 14,
    padding: 4,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 11,
  },
  tabActive: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabTxt: { fontSize: 13, fontWeight: "600" },
  tabTxtActive: {},
  tripCard: {
    width: 200,
    height: 140,
    borderRadius: 20,
    overflow: "hidden",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  tripCardActive: { elevation: 12, shadowOpacity: 0.22 },
  tripCardGrad: { flex: 1, padding: 14, justifyContent: "space-between" },
  tripCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripCardBadge: {
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tripCardBadgeTxt: { color: "#fff", fontSize: 11, fontWeight: "700" },
  tripCardBottom: {},
  tripCardName: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 3,
  },
  tripCardSub: { fontSize: 12, color: "rgba(255,255,255,0.78)" },
  tripCardBudget: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "700",
    marginTop: 3,
  },
  activeDot: { position: "absolute", top: 12, right: 15 },
  activeTripSection: { paddingHorizontal: 20, paddingTop: 4 },
  activeTripHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  activeTripTitle: { fontSize: 20, fontWeight: "800" },
  activeTripSub: { fontSize: 13, marginTop: 3 },
  activeTripBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activeTripBadgeTxt: { fontSize: 12, fontWeight: "700" },
  emptyTrip: {
    alignItems: "center",
    paddingVertical: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  emptyTripTxt: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 5,
  },
  emptyTripSub: { fontSize: 13, textAlign: "center", paddingHorizontal: 30 },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  browseBtnTxt: { fontSize: 14, fontWeight: "700" },
  placesList: { gap: 0 },
  tripPlace: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tripPlaceIndex: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  tripPlaceIndexTxt: { color: "#fff", fontSize: 13, fontWeight: "800" },
  tripPlaceImg: { width: 54, height: 54, borderRadius: 12, flexShrink: 0 },
  tripPlaceInfo: { flex: 1 },
  tripPlaceName: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  tripPlaceRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    gap: 3,
  },
  tripPlaceDist: { fontSize: 11 },
  tripPlaceCat: { fontSize: 11 },
  tripPlaceRight: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    flexShrink: 0,
  },
  aiTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  aiTagTxt: { fontSize: 9, fontWeight: "800" },
  empty: { alignItems: "center", paddingTop: 80, paddingHorizontal: 40 },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  emptyTitle: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  emptySub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: { borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },
  savedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 18,
    padding: 12,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  savedImg: { width: 62, height: 62, borderRadius: 14, flexShrink: 0 },
  savedInfo: { flex: 1 },
  savedName: { fontSize: 14, fontWeight: "700", marginBottom: 3 },
  savedRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  savedDist: { fontSize: 11 },
  savedCat: { fontSize: 11 },
  savedActions: { gap: 6, alignItems: "center" },
  savedAddBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  savedAddTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  savedRemoveBtn: {
    width: 32,
    height: 32,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
});
