
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

// 1. Moved Field component OUTSIDE the main screen to prevent re-mounting on every keystroke
const Field = ({
  refProp,
  icon,
  placeholder,
  value,
  onChange,
  secure,
  fieldName,
  kb,
  cap,
  next,
  returnKey,
  onSubmit,
  focused,
  setFocused,
  theme,
  s,
  showPw,
  setShowPw,
}) => (
  <View style={[s.fieldWrap, focused === fieldName && s.fieldFocused]}>
    <Ionicons
      name={icon}
      size={19}
      color={focused === fieldName ? theme.primary : theme.gray}
    />
    <TextInput
      ref={refProp}
      style={s.fieldInput}
      placeholder={placeholder}
      placeholderTextColor={theme.gray}
      value={value}
      onChangeText={onChange}
      secureTextEntry={secure && !showPw}
      keyboardType={kb || "default"}
      autoCapitalize={cap || "none"}
      autoCorrect={false}
      returnKeyType={returnKey || "next"}
      blurOnSubmit={false}
      onSubmitEditing={onSubmit || (() => next?.current?.focus())}
      onFocus={() => setFocused(fieldName)}
      onBlur={() => setFocused(null)}
    />
    {secure && (
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
    )}
  </View>
);

export default function SignupScreen({ navigation }) {
  const { theme } = useTheme();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState(null);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmRef = useRef(null);

  const s = makeStyles(theme);

  const handleSignup = async () => {
    Keyboard.dismiss();
    if (!name.trim() || !email.trim() || !password || !confirm) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be 6+ characters");
      return;
    }

    setLoading(true);
    try {
      const url = `${CONFIG.BACKEND_URL}/api/auth/signup`;
      console.log("Hitting URL:", url);
      const res = await axios.post(
        url,
        { name: name.trim(), email: email.trim(), password },
        { timeout: 10000, headers: { "Content-Type": "application/json" } },
      );
      await login(res.data.token, res.data.user);
    } catch (err) {
      console.log("Signup error code:", err.code);
      console.log("Signup error message:", err.message);
      console.log("Signup error response:", JSON.stringify(err.response?.data));
      let msg = "Something went wrong";
      if (err.code === "ECONNREFUSED")
        msg = `Server refused connection.\nURL: ${CONFIG.BACKEND_URL}`;
      else if (err.code === "ECONNABORTED")
        msg = `Request timed out.\nURL: ${CONFIG.BACKEND_URL}`;
      else if (err.code === "ENETUNREACH")
        msg = "Network unreachable. Check WiFi.";
      else if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.response?.status) msg = `HTTP Error ${err.response.status}`;
      else msg = err.message;
      Alert.alert("Signup Failed", msg);
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
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <TouchableOpacity
            style={[s.back, { backgroundColor: theme.cardBg }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={21} color={theme.dark} />
          </TouchableOpacity>

          <View style={s.logoWrap}>
            <LinearGradient
              colors={[theme.primary, theme.primaryDark]}
              style={s.logo}
            >
              <Ionicons name="person-add" size={28} color="#fff" />
            </LinearGradient>
          </View>

          <Text style={s.heading}>Create Account ✨</Text>
          <Text style={s.sub}>Join thousands of travellers</Text>

          <View style={s.card}>
            <Text style={s.label}>Full Name</Text>
            <Field
              refProp={nameRef}
              icon="person-outline"
              placeholder="John Doe"
              value={name}
              onChange={setName}
              fieldName="name"
              cap="words"
              next={emailRef}
              focused={focused}
              setFocused={setFocused}
              theme={theme}
              s={s}
            />

            <Text style={s.label}>Email</Text>
            <Field
              refProp={emailRef}
              icon="mail-outline"
              placeholder="you@email.com"
              value={email}
              onChange={setEmail}
              fieldName="email"
              kb="email-address"
              next={passwordRef}
              focused={focused}
              setFocused={setFocused}
              theme={theme}
              s={s}
            />

            <Text style={s.label}>Password</Text>
            <Field
              refProp={passwordRef}
              icon="lock-closed-outline"
              placeholder="Min. 6 characters"
              value={password}
              onChange={setPassword}
              secure
              fieldName="password"
              next={confirmRef}
              focused={focused}
              setFocused={setFocused}
              theme={theme}
              s={s}
              showPw={showPw}
              setShowPw={setShowPw}
            />

            <Text style={s.label}>Confirm Password</Text>
            <Field
              refProp={confirmRef}
              icon="shield-checkmark-outline"
              placeholder="Repeat password"
              value={confirm}
              onChange={setConfirm}
              secure
              fieldName="confirm"
              returnKey="done"
              onSubmit={handleSignup}
              focused={focused}
              setFocused={setFocused}
              theme={theme}
              s={s}
              showPw={showPw}
              setShowPw={setShowPw}
            />

            <TouchableOpacity
              style={s.btn}
              onPress={handleSignup}
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
                    <Text style={s.btnTxt}>Create Account</Text>
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <Text
              style={{
                fontSize: 12,
                color: theme.gray,
                textAlign: "center",
                lineHeight: 18,
              }}
            >
              By signing up, you agree to our{" "}
              <Text style={{ color: theme.primary, fontWeight: "600" }}>
                Terms
              </Text>{" "}
              &{" "}
              <Text style={{ color: theme.primary, fontWeight: "600" }}>
                Privacy Policy
              </Text>
            </Text>
          </View>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Text style={{ color: theme.gray, fontSize: 14 }}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text
                style={{
                  color: theme.primary,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Sign In
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
    container: { flex: 1, backgroundColor: theme.background },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 56,
      paddingBottom: 60,
    },
    back: {
      width: 44,
      height: 44,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 22,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
    },
    logoWrap: { alignItems: "center", marginBottom: 14 },
    logo: {
      width: 68,
      height: 68,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      elevation: 8,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    heading: {
      fontSize: 27,
      fontWeight: "800",
      color: theme.dark,
      textAlign: "center",
      marginBottom: 6,
    },
    sub: {
      fontSize: 14,
      color: theme.gray,
      textAlign: "center",
      marginBottom: 26,
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
    btn: {
      borderRadius: 16,
      overflow: "hidden",
      elevation: 6,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      marginTop: 8,
      marginBottom: 16,
    },
    btnGrad: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      gap: 10,
    },
    btnTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });
