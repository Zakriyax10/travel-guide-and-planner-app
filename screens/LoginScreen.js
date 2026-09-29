
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import CONFIG from "../constants/config";

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState(null);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const s = makeStyles(theme);

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      const url = `${CONFIG.BACKEND_URL}/api/auth/login`;
      console.log("🔄 Login URL:", url);
      console.log("🔄 Payload:", { email: email.trim(), password: "***" });

      const res = await axios.post(
        url,
        { email: email.trim(), password },
        {
          timeout: 10000,
          headers: { "Content-Type": "application/json" },
        },
      );
      console.log("✅ Login success:", res.data.user);
      await login(res.data.token, res.data.user);
    } catch (err) {
      console.error("❌ Login failed:", err.message);
      console.error("❌ Code:", err.code);
      console.error("❌ Response:", err.response?.data);

      let message = "Something went wrong";
      if (err.code === "ECONNREFUSED") {
        message = `Cannot connect to server at:\n${CONFIG.BACKEND_URL}\n\nMake sure backend is running.`;
      } else if (err.code === "ETIMEDOUT" || err.code === "ECONNABORTED") {
        message = `Connection timed out.\nServer: ${CONFIG.BACKEND_URL}\n\nCheck you are on same WiFi.`;
      } else if (err.code === "ENETUNREACH") {
        message = "Network unreachable. Check WiFi.";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.status) {
        message = `Server error ${err.response.status}`;
      }
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={s.container}>
      <StatusBar
        barStyle={theme.mode === "dark" ? "light-content" : "dark-content"}
      />
      <KeyboardAvoidingView
        style={s.kavContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <LinearGradient
            colors={[theme.primaryLight, theme.primaryMid]}
            style={s.topDecor}
          />

          {/* Logo */}
          <View style={s.logoWrap}>
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={s.logo}
            >
              <Ionicons name="map" size={30} color="#fff" />
            </LinearGradient>
            <Text style={s.appName}>Rihla</Text>
          </View>

          <Text style={s.heading}>Welcome back 👋</Text>
          <Text style={s.sub}>Sign in to continue your journey</Text>

          <View style={s.card}>
            {/* Email */}
            <Text style={s.label}>Email</Text>
            <View style={[s.fieldWrap, focused === "email" && s.fieldFocused]}>
              <Ionicons
                name="mail-outline"
                size={19}
                color={focused === "email" ? theme.primary : theme.gray}
              />
              <TextInput
                ref={emailRef}
                style={s.fieldInput}
                placeholder="you@email.com"
                placeholderTextColor={theme.gray}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                returnKeyType="next"
                blurOnSubmit={false}
                onSubmitEditing={() => passwordRef.current?.focus()}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
              />
            </View>

            {/* Password */}
            <Text style={s.label}>Password</Text>
            <View
              style={[s.fieldWrap, focused === "password" && s.fieldFocused]}
            >
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={focused === "password" ? theme.primary : theme.gray}
              />
              <TextInput
                ref={passwordRef}
                style={s.fieldInput}
                placeholder="Enter password"
                placeholderTextColor={theme.gray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                blurOnSubmit={false}
                onSubmitEditing={handleLogin}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity
                onPress={() => setShowPw(!showPw)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPw ? "eye-off-outline" : "eye-outline"}
                  size={19}
                  color={theme.gray}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.forgot}>
              <Text style={[s.forgotTxt, { color: theme.primary }]}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={s.btn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.88}
            >
              <LinearGradient
                colors={[theme.primary, theme.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.btnGrad}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={s.btnTxt}>Sign In</Text>
                    <Ionicons name="arrow-forward" size={17} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={s.divider}>
              <View style={s.divLine} />
              <Text style={[s.divTxt, { color: theme.gray }]}>
                or continue with
              </Text>
              <View style={s.divLine} />
            </View>

            {/* Social */}
            <View style={s.socialRow}>
              {["logo-google", "logo-apple"].map((ic) => (
                <TouchableOpacity
                  key={ic}
                  style={[s.socialBtn, { borderColor: theme.border }]}
                >
                  <Ionicons name={ic} size={21} color={theme.dark} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Signup link */}
          <View style={s.signupRow}>
            <Text style={[s.signupTxt, { color: theme.gray }]}>
              Don't have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
              <Text style={[s.signupLink, { color: theme.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    kavContainer: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 56,
      paddingBottom: 40,
    },
    topDecor: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 220,
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
    },
    logoWrap: {
      alignItems: "center",
      marginBottom: 6,
    },
    logo: {
      width: 72,
      height: 72,
      borderRadius: 22,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
      elevation: 8,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 12,
    },
    appName: {
      fontSize: 19,
      fontWeight: "700",
      color: theme.primary,
      letterSpacing: 1,
    },
    heading: {
      fontSize: 28,
      fontWeight: "800",
      color: theme.dark,
      textAlign: "center",
      marginTop: 16,
      marginBottom: 6,
    },
    sub: {
      fontSize: 14,
      color: theme.gray,
      textAlign: "center",
      marginBottom: 28,
    },
    card: {
      backgroundColor: theme.cardBg,
      borderRadius: 24,
      padding: 24,
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.08,
      shadowRadius: 20,
      marginBottom: 24,
      borderWidth: theme.mode === "dark" ? 1 : 0,
      borderColor: theme.border,
    },
    label: {
      fontSize: 13,
      fontWeight: "700",
      color: theme.dark,
      marginBottom: 8,
      marginTop: 4,
    },
    fieldWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBg,
      borderRadius: 14,
      paddingHorizontal: 15,
      paddingVertical: Platform.OS === "ios" ? 14 : 4,
      marginBottom: 14,
      gap: 10,
      borderWidth: 2,
      borderColor: "transparent",
    },
    fieldFocused: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryLight,
    },
    fieldInput: {
      flex: 1,
      fontSize: 15,
      color: theme.dark,
      paddingVertical: Platform.OS === "android" ? 8 : 0,
    },
    forgot: {
      alignSelf: "flex-end",
      marginBottom: 20,
    },
    forgotTxt: {
      fontSize: 13,
      fontWeight: "600",
    },
    btn: {
      borderRadius: 16,
      overflow: "hidden",
      elevation: 6,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      marginBottom: 22,
    },
    btnGrad: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      gap: 10,
    },
    btnTxt: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 18,
    },
    divLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
    },
    divTxt: {
      fontSize: 13,
    },
    socialRow: {
      flexDirection: "row",
      gap: 12,
    },
    socialBtn: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1.5,
      borderRadius: 14,
      paddingVertical: 14,
    },
    signupRow: {
      flexDirection: "row",
      justifyContent: "center",
    },
    signupTxt: {
      fontSize: 14,
    },
    signupLink: {
      fontSize: 14,
      fontWeight: "700",
    },
  });
