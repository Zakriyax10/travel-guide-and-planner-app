import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { TripProvider } from './context/TripContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import MapScreen from './screens/MapScreen';
import PlaceDetailScreen from './screens/PlaceDetailScreen';
import TripPlannerScreen from './screens/TripPlannerScreen';
import ChatbotScreen from './screens/ChatbotScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Map', label: 'Explore', iconOn: 'map', iconOff: 'map-outline' },
  { name: 'Planner', label: 'Planner', iconOn: 'calendar', iconOff: 'calendar-outline' },
  { name: 'Chatbot', label: 'AI Guide', iconOn: 'sparkles', iconOff: 'sparkles-outline' },
  { name: 'Profile', label: 'Profile', iconOn: 'person', iconOff: 'person-outline' },
];

function CustomTabBar({ state, navigation }) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        tabStyles.bar,
        {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const tab = TABS.find((t) => t.name === route.name) || TABS[0];
        const isAI = index === 2;

        if (isAI) {
          return (
            <View key={route.key} style={tabStyles.tabItem}>
              <TouchableOpacity
                onPress={() => navigation.navigate(route.name)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    focused
                      ? [theme.primary, theme.primaryDark]
                      : [theme.primaryLight, theme.primaryLight]
                  }
                  style={tabStyles.aiBtn}
                >
                  <Ionicons
                    name={focused ? tab.iconOn : tab.iconOff}
                    size={20}
                    color={focused ? '#fff' : theme.primary}
                  />
                  <Text
                    style={[
                      tabStyles.aiLabel,
                      { color: focused ? '#fff' : theme.primary },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        }

        return (
          <View key={route.key} style={tabStyles.tabItem}>
            <TouchableOpacity
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.8}
              style={tabStyles.tabBtn}
            >
              <View
                style={[
                  tabStyles.iconWrap,
                  focused && { backgroundColor: theme.primaryLight },
                ]}
              >
                <Ionicons
                  name={focused ? tab.iconOn : tab.iconOff}
                  size={21}
                  color={focused ? theme.primary : theme.gray}
                />
              </View>
              <Text
                style={[
                  tabStyles.label,
                  { color: focused ? theme.primary : theme.gray },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Planner" component={TripPlannerScreen} />
      <Tab.Screen name="Chatbot" component={ChatbotScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Auth screens stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// App screens stack
function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="PlaceDetail" component={PlaceDetailScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { isAuth, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.background }]}>
        <LinearGradient
          colors={[theme.primary, theme.primaryDark]}
          style={styles.splashIcon}
        >
          <Ionicons name="map" size={36} color="#fff" />
        </LinearGradient>
        <Text style={[styles.splashTitle, { color: theme.dark }]}>
          TourPlanner
        </Text>
        <ActivityIndicator color={theme.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  // Key prop forces complete remount when auth state changes
  // This is the key fix — the navigator fully resets on auth change
  return (
    <NavigationContainer>
      {isAuth ? (
        <AppStack key="app" />
      ) : (
        <AuthStack key="auth" />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TripProvider>
          <RootNavigator />
        </TripProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIcon: {
    width: 90,
    height: 90,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
});

const tabStyles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 10,
    paddingHorizontal: 10,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabBtn: { alignItems: 'center', gap: 3, paddingVertical: 2 },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: { fontSize: 10, fontWeight: '600' },
  aiBtn: {
    borderRadius: 16,
    marginTop: -4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 2,
    elevation: 4,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  aiLabel: { fontSize: 10, fontWeight: '700' },
});