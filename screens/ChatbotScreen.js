import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Keyboard,
  Animated,
  Linking,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CONFIG from "../constants/config";
import { useTheme } from "../context/ThemeContext";
import { useTrip } from "../context/TripContext";

const BACKEND_URL = CONFIG.BACKEND_URL;

// ─── Typing dots ──────────────────────────────────────────────────────
function TypingDots({ color }) {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ];

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.delay((dots.length - i - 1) * 160),
        ])
      )
    );
    Animated.parallel(animations).start();
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: color },
            {
              transform: [
                {
                  translateY: dot.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -5],
                  }),
                },
              ],
              opacity: dot.interpolate({
                inputRange: [0, 1],
                outputRange: [0.4, 1],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

// ─── Message content renderer ─────────────────────────────────────────
function MessageContent({ text, textColor, theme }) {
  const lines = text.split("\n");

  const openLink = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) Linking.openURL(url);
        else Alert.alert("Cannot Open", "Unable to open Google Maps.");
      })
      .catch(() => Alert.alert("Error", "Failed to open link."));
  };

  return (
    <View>
      {lines.map((line, index) => {
        // Maps link
        const mapsMatch = line.match(/https:\/\/www\.google\.com\/maps[^\s]*/);
        if (mapsMatch) {
          const url = mapsMatch[0];
          return (
            <TouchableOpacity
              key={index}
              onPress={() => openLink(url)}
              activeOpacity={0.7}
              style={[
                styles.mapsBtn,
                {
                  backgroundColor: theme.primaryLight,
                  borderColor: theme.primaryMid,
                },
              ]}
            >
              <LinearGradient
                colors={["#2563EB", "#1D4ED8"]}
                style={styles.mapsIcon}
              >
                <Ionicons name="navigate" size={11} color="#fff" />
              </LinearGradient>
              <Text style={[styles.mapsText, { color: theme.primary }]}>
                Open in Google Maps
              </Text>
              <Ionicons name="open-outline" size={13} color={theme.primary} />
            </TouchableOpacity>
          );
        }

        // Day header
        if (/^📅\s*DAY\s*\d+/i.test(line)) {
          return (
            <View
              key={index}
              style={[
                styles.dayHeader,
                {
                  backgroundColor: theme.primaryLight,
                  borderLeftColor: theme.primary,
                },
              ]}
            >
              <Text style={[styles.dayHeaderText, { color: theme.primary }]}>
                {line}
              </Text>
            </View>
          );
        }

        // Empty line
        if (line === "") return <View key={index} style={{ height: 5 }} />;

        // Bold (*text*)
        if (line.includes("*")) {
          const parts = line.split(/\*([^*]+)\*/);
          return (
            <Text key={index} style={[styles.msgText, { color: textColor }]}>
              {parts.map((part, pi) =>
                pi % 2 === 1 ? (
                  <Text key={pi} style={{ fontWeight: "700" }}>
                    {part}
                  </Text>
                ) : (
                  part
                )
              )}
              {"\n"}
            </Text>
          );
        }

        // Section header
        const isSectionHeader =
          /^[\u{1F300}-\u{1FAFF}✈️📍💡⚠️]/u.test(line) &&
          line.length < 80 &&
          !line.startsWith("📍");

        return (
          <Text
            key={index}
            style={[
              styles.msgText,
              { color: textColor },
              isSectionHeader && styles.sectionHeader,
            ]}
          >
            {line}
            {"\n"}
          </Text>
        );
      })}
    </View>
  );
}

// ─── Save Itinerary Button ────────────────────────────────────────────
function SaveItineraryButton({ text, theme, onSave }) {
  // Only show button if message looks like an itinerary
  const isItinerary =
    /day\s*\d+/i.test(text) ||
    /itinerary/i.test(text) ||
    /📅/i.test(text) ||
    /morning|afternoon|evening/i.test(text);

  if (!isItinerary) return null;

  return (
    <TouchableOpacity
      onPress={onSave}
      activeOpacity={0.85}
      style={[
        styles.saveItineraryBtn,
        { backgroundColor: theme.primaryLight, borderColor: theme.primaryMid },
      ]}
    >
      <LinearGradient
        colors={[theme.primary, theme.primaryDark]}
        style={styles.saveItineraryIcon}
      >
        <Ionicons name="calendar" size={13} color="#fff" />
      </LinearGradient>
      <Text style={[styles.saveItineraryTxt, { color: theme.primary }]}>
        Save Itinerary to Trip Planner
      </Text>
      <Ionicons name="chevron-forward" size={14} color={theme.primary} />
    </TouchableOpacity>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────
function MessageBubble({ item, theme, onSaveItinerary }) {
  const isUser = item.role === "user";
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.msgRow,
        isUser ? styles.msgRowUser : styles.msgRowBot,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      {!isUser && (
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          style={styles.botAvatar}
        >
          <Ionicons name="sparkles" size={13} color="#fff" />
        </LinearGradient>
      )}

      <View
        style={[
          styles.bubble,
          isUser
            ? [
                styles.bubbleUser,
                { backgroundColor: theme.primary, shadowColor: theme.primary },
              ]
            : [
                styles.bubbleBot,
                {
                  backgroundColor: theme.cardBg,
                  shadowColor: theme.shadowDark,
                },
              ],
          !isUser && item.text.length > 300 && styles.bubbleWide,
        ]}
      >
        {isUser ? (
          <Text style={[styles.msgText, { color: "#fff" }]}>{item.text}</Text>
        ) : (
          <>
            <MessageContent
              text={item.text}
              textColor={theme.text}
              theme={theme}
            />
            {/* ── Save Itinerary Button ── */}
            <SaveItineraryButton
              text={item.text}
              theme={theme}
              onSave={() => onSaveItinerary(item.text)}
            />
          </>
        )}
        <Text
          style={[
            styles.timestamp,
            {
              color: isUser ? "rgba(255,255,255,0.6)" : theme.textSub,
            },
          ]}
        >
          {item.time}
        </Text>
      </View>

      {isUser && (
        <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
          <Ionicons name="person" size={13} color="#fff" />
        </View>
      )}
    </Animated.View>
  );
}

// ─── Parse itinerary text into places ────────────────────────────────
function parseItineraryPlaces(text) {
  const places = [];
  const lines = text.split("\n");

  lines.forEach((line, index) => {
    // Match lines with place-like patterns: "- Place Name", "• Place Name", "**Place**"
    const placeMatch =
      line.match(/^[-•]\s+\*?\*?([A-Z][^*\n]{3,40})\*?\*?/) ||
      line.match(/^\d+\.\s+\*?\*?([A-Z][^*\n]{3,40})\*?\*?/) ||
      line.match(/📍\s*\*?\*?([^*\n]{3,40})\*?\*?/);

    if (placeMatch) {
      const name = placeMatch[1].trim();
      // Skip generic words
      const skip = [
        "morning", "afternoon", "evening", "night", "day",
        "note", "tip", "budget", "total", "hotel", "check",
        "arrival", "departure", "optional",
      ];
      const isGeneric = skip.some((w) =>
        name.toLowerCase().startsWith(w)
      );
      if (!isGeneric && name.length > 3) {
        places.push({
          id: `ai-${Date.now()}-${index}`,
          name,
          category: "AI Suggested",
          address: "See itinerary for details",
          rating: "4.5",
          distance: "N/A",
          image: null,
        });
      }
    }
  });

  // Remove duplicates by name
  const unique = places.filter(
    (p, i, self) => i === self.findIndex((t) => t.name === p.name)
  );

  return unique.slice(0, 10); // Max 10 places
}

// ─── Save Itinerary Modal ─────────────────────────────────────────────
function SaveItineraryModal({ visible, onClose, onConfirm, theme, parsedPlaces }) {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [duration, setDuration] = useState("");
  const [budget, setBudget] = useState("");

  const handleConfirm = () => {
    if (!tripName.trim() || !destination.trim()) {
      Alert.alert("Required", "Please enter trip name and destination");
      return;
    }
    onConfirm({
      name: tripName.trim(),
      destination: destination.trim(),
      duration: duration || "TBD",
      budget: budget || "TBD",
    });
    setTripName("");
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
      <View style={modalStyles.overlay}>
        <View
          style={[modalStyles.sheet, { backgroundColor: theme.cardBg }]}
        >
          <View
            style={[modalStyles.handle, { backgroundColor: theme.grayMid }]}
          />

          {/* Title */}
          <View style={modalStyles.titleRow}>
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={modalStyles.titleIcon}
            >
              <Ionicons name="calendar" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[modalStyles.title, { color: theme.text }]}>
                Save to Trip Planner
              </Text>
              <Text style={[modalStyles.subtitle, { color: theme.textSub }]}>
                {parsedPlaces.length} places detected from itinerary
              </Text>
            </View>
          </View>

          {/* Places Preview */}
          {parsedPlaces.length > 0 && (
            <View
              style={[
                modalStyles.placesPreview,
                { backgroundColor: theme.primaryLight, borderColor: theme.primaryMid },
              ]}
            >
              <Text style={[modalStyles.placesTitle, { color: theme.primary }]}>
                📍 Places to be added:
              </Text>
              {parsedPlaces.slice(0, 5).map((p, i) => (
                <Text
                  key={p.id}
                  style={[modalStyles.placeName, { color: theme.text }]}
                >
                  {i + 1}. {p.name}
                </Text>
              ))}
              {parsedPlaces.length > 5 && (
                <Text style={[modalStyles.moreTxt, { color: theme.textSub }]}>
                  +{parsedPlaces.length - 5} more places...
                </Text>
              )}
            </View>
          )}

          {/* Fields */}
          {[
            { icon: "bookmark", ph: "Trip name (e.g. Paris Adventure)", val: tripName, set: setTripName },
            { icon: "location", ph: "Destination", val: destination, set: setDestination },
            { icon: "calendar", ph: "Duration (e.g. 5 days)", val: duration, set: setDuration },
            { icon: "cash", ph: "Budget (e.g. $800)", val: budget, set: setBudget },
          ].map(({ icon, ph, val, set }) => (
            <View
              key={ph}
              style={[modalStyles.field, { backgroundColor: theme.inputBg }]}
            >
              <Ionicons name={`${icon}-outline`} size={18} color={theme.gray} />
              <TextInput
                style={[modalStyles.input, { color: theme.text }]}
                placeholder={ph}
                placeholderTextColor={theme.gray}
                value={val}
                onChangeText={set}
              />
            </View>
          ))}

          {/* Confirm Button */}
          <TouchableOpacity
            style={modalStyles.confirmBtn}
            onPress={handleConfirm}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={modalStyles.confirmGrad}
            >
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text style={modalStyles.confirmTxt}>Save Trip</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.cancelBtn} onPress={onClose}>
            <Text style={[modalStyles.cancelTxt, { color: theme.gray }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────
export default function ChatbotScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { saveItineraryAsTrip } = useTrip();
  const insets = useSafeAreaInsets();

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const [messages, setMessages] = useState([
    {
      id: "0",
      role: "assistant",
      time: getTime(),
      text:
        "Hey! 👋 I'm *TourGuide AI* — your personal travel planner.\n\n" +
        "Tell me:\n" +
        "• *Where* do you want to go?\n" +
        "• *How many days?*\n" +
        "• *Budget?*\n" +
        "• *Solo or group?*\n\n" +
        "I'll build your full trip plan with a day-by-day itinerary, hotels, food guide, and *Google Maps links* for every location. ✈️\n\n" +
        "💡 After I generate your itinerary, you can *Save it directly to your Trip Planner!*",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  // ── Save modal state ──
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [currentItineraryText, setCurrentItineraryText] = useState("");
  const [parsedPlaces, setParsedPlaces] = useState([]);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const scrollToBottom = useCallback((delay = 100) => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), delay);
  }, []);

  // ── Handle Save Itinerary ──────────────────────────────────────────
  const handleSaveItinerary = useCallback((text) => {
    const places = parseItineraryPlaces(text);
    setCurrentItineraryText(text);
    setParsedPlaces(places);
    setShowSaveModal(true);
  }, []);

  // ── Confirm Save ──────────────────────────────────────────────────
  const handleConfirmSave = useCallback(
    (tripData) => {
      const trip = saveItineraryAsTrip(tripData, parsedPlaces);
      Alert.alert(
        "✅ Trip Saved!",
        `"${trip.name}" has been created with ${parsedPlaces.length} places in your Trip Planner.`,
        [
          { text: "View Trip", onPress: () => navigation.navigate("Planner") },
          { text: "Stay Here", style: "cancel" },
        ]
      );
    },
    [parsedPlaces, saveItineraryAsTrip, navigation]
  );

  const sendMessage = useCallback(
    async (text) => {
      const msg = (text || input).trim();
      if (!msg || loading) return;

      setInput("");

      const userMsg = {
        id: Date.now().toString(),
        role: "user",
        time: getTime(),
        text: msg,
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      scrollToBottom(150);

      try {
        const updatedHistory = [
          ...conversationHistory,
          { role: "user", content: msg },
        ];

        const response = await fetch(`${BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedHistory }),
        });

        if (!response.ok) throw new Error("Server error");

        const data = await response.json();
        const reply = data.reply;

        setConversationHistory([
          ...updatedHistory,
          { role: "assistant", content: reply },
        ]);

        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-r`,
            role: "assistant",
            time: getTime(),
            text: reply,
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-e`,
            role: "assistant",
            time: getTime(),
            text:
              "⚠️ *Connection Error*\n\n" +
              "• Backend server running?\n" +
              "• IP correct in config.js?\n" +
              "• Same WiFi network?",
          },
        ]);
      } finally {
        setLoading(false);
        scrollToBottom(200);
      }
    },
    [input, loading, conversationHistory]
  );

  const clearChat = useCallback(() => {
    Alert.alert("New Chat", "Clear this conversation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setMessages([
            {
              id: "0",
              role: "assistant",
              time: getTime(),
              text: "Fresh start! 🗺️ Where do you want to go?",
            },
          ]);
          setConversationHistory([]);
        },
      },
    ]);
  }, []);

  const ListFooter = useCallback(() => {
    if (!loading) return <View style={{ height: 12 }} />;
    return (
      <View style={styles.typingRow}>
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          style={styles.botAvatar}
        >
          <Ionicons name="sparkles" size={13} color="#fff" />
        </LinearGradient>
        <View
          style={[
            styles.typingBubble,
            {
              backgroundColor: theme.cardBg,
              shadowColor: theme.shadowDark,
            },
          ]}
        >
          <TypingDots color={theme.primary} />
          <Text style={[styles.typingTxt, { color: theme.textSub }]}>
            Planning your trip...
          </Text>
        </View>
      </View>
    );
  }, [loading, theme]);

  const bottomPad = isKeyboardVisible ? 8 : insets.bottom + 70;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* ── HEADER ── */}
      <LinearGradient
        colors={
          isDark
            ? [theme.headerBg, theme.headerBg]
            : ["#EFF6FF", "#F4F9FF", theme.background]
        }
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={["#2563EB", "#1D4ED8"]}
              style={styles.headerIcon}
            >
              <Ionicons name="sparkles" size={20} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={[styles.headerTitle, { color: theme.text }]}>
                Rihla Guide AI
              </Text>
              <View style={styles.onlineRow}>
                <View
                  style={[styles.onlineDot, { backgroundColor: "#10B981" }]}
                />
                <Text style={[styles.onlineTxt, { color: "#10B981" }]}>
                  Online · Powered by Claude
                </Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.headerBtn,
              {
                backgroundColor: theme.cardBg,
                shadowColor: theme.shadowDark,
              },
            ]}
            onPress={clearChat}
            activeOpacity={0.75}
          >
            <Ionicons name="create-outline" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* ── MESSAGES ── */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MessageBubble
            item={item}
            theme={theme}
            onSaveItinerary={handleSaveItinerary}
          />
        )}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.msgList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollToBottom(80)}
        keyboardShouldPersistTaps="handled"
      />

      {/* ── INPUT BAR ── */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: theme.cardBg,
            borderTopColor: theme.border,
            paddingBottom: bottomPad,
            shadowColor: theme.shadowDark,
          },
        ]}
      >
        <View style={styles.inputRow}>
          <View
            style={[
              styles.inputWrap,
              {
                backgroundColor: theme.inputBg,
                borderColor:
                  input.length > 0 ? theme.primaryMid : theme.border,
              },
            ]}
          >
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: theme.text }]}
              placeholder="Where do you want to go?"
              placeholderTextColor={theme.textSub}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={600}
            />
          </View>

          <TouchableOpacity
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                input.trim() && !loading
                  ? ["#2563EB", "#1D4ED8"]
                  : [theme.grayLight, theme.grayLight]
              }
              style={styles.sendBtn}
            >
              <Ionicons
                name="send"
                size={16}
                color={input.trim() && !loading ? "#fff" : theme.gray}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SAVE ITINERARY MODAL ── */}
      <SaveItineraryModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onConfirm={handleConfirmSave}
        theme={theme}
        parsedPlaces={parsedPlaces}
      />
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },

  // Header
  header: { paddingHorizontal: 20, paddingBottom: 14 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  headerTitle: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 2,
  },
  onlineDot: { width: 7, height: 7, borderRadius: 4 },
  onlineTxt: { fontSize: 11, fontWeight: "600" },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
  },

  // Messages
  msgList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    flexGrow: 1,
  },
  msgRow: { flexDirection: "row", marginBottom: 14, alignItems: "flex-end" },
  msgRowUser: { justifyContent: "flex-end" },
  msgRowBot: { justifyContent: "flex-start" },
  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flexShrink: 0,
    elevation: 3,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    flexShrink: 0,
  },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleWide: { maxWidth: "90%" },
  bubbleUser: {
    borderBottomRightRadius: 4,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  bubbleBot: {
    borderBottomLeftRadius: 4,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  msgText: { fontSize: 14, lineHeight: 21 },
  sectionHeader: { fontWeight: "700", marginTop: 6, marginBottom: 1 },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    alignSelf: "flex-end",
    fontWeight: "500",
  },

  // Day header
  dayHeader: {
    borderRadius: 8,
    borderLeftWidth: 3,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginVertical: 5,
  },
  dayHeaderText: { fontSize: 13, fontWeight: "700" },

  // Maps button
  mapsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginVertical: 3,
  },
  mapsIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  mapsText: { fontSize: 13, fontWeight: "600", flex: 1 },

  // Save Itinerary Button
  saveItineraryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
  },
  saveItineraryIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  saveItineraryTxt: { fontSize: 13, fontWeight: "700", flex: 1 },

  // Typing
  typingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    marginTop: 2,
  },
  typingBubble: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 11,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
  },
  dotsRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  typingTxt: { fontSize: 13, fontWeight: "500" },

  // Input
  inputBar: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    elevation: 16,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
  },
  inputRow: { flexDirection: "row", alignItems: "flex-end", gap: 10 },
  inputWrap: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  input: { fontSize: 15, maxHeight: 100, lineHeight: 21 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});

// ─── Modal Styles ─────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
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
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  titleIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "800" },
  subtitle: { fontSize: 13, marginTop: 2 },
  placesPreview: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
  },
  placesTitle: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  placeName: { fontSize: 13, marginBottom: 4 },
  moreTxt: { fontSize: 12, marginTop: 4 },
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
  confirmBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 12,
    elevation: 6,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  confirmGrad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  confirmTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancelBtn: { alignItems: "center", paddingVertical: 10 },
  cancelTxt: { fontSize: 15, fontWeight: "500" },
});