import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useTrip } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';

const AVATAR_GRADIENTS = [
  ['#2563EB', '#7C3AED'],
  ['#059669', '#2563EB'],
  ['#DC2626', '#F97316'],
  ['#7C3AED', '#EC4899'],
];

export default function ProfileScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const { trips, savedPlaces } = useTrip();

  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(true);
  const [avatarIdx] = useState(
    Math.floor(Math.random() * AVATAR_GRADIENTS.length)
  );

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch (_) {}
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalPlaces = trips.reduce((sum, t) => sum + t.places.length, 0);

  const STATS = [
    { label: 'Trips', value: trips.length.toString(), icon: 'airplane' },
    { label: 'Saved', value: savedPlaces.length.toString(), icon: 'bookmark' },
    { label: 'Places', value: totalPlaces.toString(), icon: 'location' },
  ];

  const MENU = [
    {
      title: 'PREFERENCES',
      items: [
        {
          icon: 'notifications-outline',
          label: 'Notifications',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          icon: isDark ? 'sunny-outline' : 'moon-outline',
          label: 'Dark Mode',
          type: 'toggle',
          value: isDark,
          onToggle: toggleTheme,
        },
        {
          icon: 'language-outline',
          label: 'Language',
          value: 'English',
          type: 'nav',
        },
        {
          icon: 'globe-outline',
          label: 'Currency',
          value: 'USD',
          type: 'nav',
        },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        {
          icon: 'person-outline',
          label: 'Edit Profile',
          type: 'nav',
        },
        {
          icon: 'lock-closed-outline',
          label: 'Change Password',
          type: 'nav',
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Privacy Settings',
          type: 'nav',
        },
      ],
    },
    {
      title: 'SUPPORT',
      items: [
        {
          icon: 'help-circle-outline',
          label: 'Help Center',
          type: 'nav',
        },
        {
          icon: 'star-outline',
          label: 'Rate TourPlanner',
          type: 'nav',
        },
        {
          icon: 'share-outline',
          label: 'Share App',
          type: 'nav',
        },
        {
          icon: 'information-circle-outline',
          label: 'About',
          type: 'nav',
        },
      ],
    },
  ];

  const s = makeStyles(theme);

  return (
    <View style={s.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Hero */}
      <LinearGradient
        colors={
          isDark
            ? ['#1E3A5F', '#0F172A']
            : [theme.primary, theme.primaryDark, '#1E3A8A']
        }
        style={s.heroGrad}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={s.heroDeco1} />
        <View style={s.heroDeco2} />

        <View style={s.heroContent}>
          <LinearGradient
            colors={AVATAR_GRADIENTS[avatarIdx]}
            style={s.avatar}
          >
            <Text style={s.avatarTxt}>{getInitials(user?.name)}</Text>
          </LinearGradient>
          <Text style={s.userName}>{user?.name || 'Explorer'}</Text>
          <Text style={s.userEmail}>
            {user?.email || 'traveller@world.com'}
          </Text>
          <TouchableOpacity
            style={s.editBtn}
            onPress={() => Alert.alert('Edit Profile', 'Coming soon!')}
          >
            <Ionicons name="pencil" size={13} color={theme.primary} />
            <Text style={[s.editBtnTxt, { color: theme.primary }]}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={s.statsRow}>
          {STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              <View style={s.statItem}>
                <Ionicons
                  name={stat.icon}
                  size={15}
                  color="rgba(255,255,255,0.8)"
                />
                <Text style={s.statVal}>{stat.value}</Text>
                <Text style={s.statLbl}>{stat.label}</Text>
              </View>
              {i < STATS.length - 1 && <View style={s.statDiv} />}
            </React.Fragment>
          ))}
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 110 }}
        style={{ backgroundColor: theme.background }}
      >
        {/* Trip Banner */}
        {trips.length > 0 && (
          <View style={s.tripBanner}>
            <LinearGradient
              colors={trips[0].coverColor}
              style={s.tripBannerGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View>
                <Text style={s.tripBannerLabel}>NEXT TRIP</Text>
                <Text style={s.tripBannerName}>{trips[0].name}</Text>
                <Text style={s.tripBannerSub}>
                  {trips[0].destination} · {trips[0].duration}
                </Text>
              </View>
              <TouchableOpacity
                style={s.tripBannerBtn}
                onPress={() => navigation.navigate('Planner')}
              >
                <Text style={[s.tripBannerBtnTxt, { color: theme.primary }]}>
                  View
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={13}
                  color={theme.primary}
                />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}

        {/* Menu Sections */}
        {MENU.map((section) => (
          <View key={section.title} style={s.menuSection}>
            <Text style={s.menuSectionTitle}>{section.title}</Text>
            <View style={s.menuCard}>
              {section.items.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={s.menuItem}
                    activeOpacity={item.type === 'nav' ? 0.7 : 1}
                    onPress={() => {
                      if (item.type === 'nav') {
                        Alert.alert(item.label, 'Coming soon!');
                      }
                    }}
                  >
                    <View style={s.menuLeft}>
                      <View style={s.menuIconWrap}>
                        <Ionicons
                          name={item.icon}
                          size={18}
                          color={theme.primary}
                        />
                      </View>
                      <Text style={s.menuLabel}>{item.label}</Text>
                    </View>
                    <View style={s.menuRight}>
                      {item.type === 'nav' && item.value && (
                        <Text style={s.menuValue}>{item.value}</Text>
                      )}
                      {item.type === 'toggle' && (
                        <Switch
                          value={item.value}
                          onValueChange={item.onToggle}
                          trackColor={{
                            false: theme.grayMid,
                            true: theme.primaryMid,
                          }}
                          thumbColor={
                            item.value ? theme.primary : theme.gray
                          }
                          ios_backgroundColor={theme.grayMid}
                        />
                      )}
                      {item.type === 'nav' && (
                        <Ionicons
                          name="chevron-forward"
                          size={17}
                          color={theme.grayMid}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                  {idx < section.items.length - 1 && (
                    <View style={s.menuDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons
            name="log-out-outline"
            size={19}
            color={theme.danger}
          />
          <Text style={s.logoutTxt}>Logout</Text>
        </TouchableOpacity>

        <Text style={s.version}>TourPlanner v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    heroGrad: {
      paddingTop: 52,
      paddingBottom: 24,
      overflow: 'hidden',
    },
    heroDeco1: {
      position: 'absolute',
      top: -50,
      right: -50,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: 'rgba(255,255,255,0.07)',
    },
    heroDeco2: {
      position: 'absolute',
      bottom: -30,
      left: -40,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: 'rgba(255,255,255,0.05)',
    },
    heroContent: {
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    avatar: {
      width: 88,
      height: 88,
      borderRadius: 26,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 3,
      borderColor: 'rgba(255,255,255,0.3)',
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
    },
    avatarTxt: {
      fontSize: 30,
      fontWeight: '800',
      color: '#fff',
    },
    userName: {
      fontSize: 22,
      fontWeight: '800',
      color: '#fff',
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: 'rgba(255,255,255,0.72)',
      marginBottom: 14,
    },
    editBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#fff',
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 7,
    },
    editBtnTxt: {
      fontSize: 13,
      fontWeight: '700',
    },
    statsRow: {
      flexDirection: 'row',
      marginHorizontal: 20,
      backgroundColor: 'rgba(255,255,255,0.13)',
      borderRadius: 20,
      paddingVertical: 16,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
      gap: 3,
    },
    statDiv: {
      width: 1,
      backgroundColor: 'rgba(255,255,255,0.25)',
      marginVertical: 6,
    },
    statVal: {
      fontSize: 20,
      fontWeight: '800',
      color: '#fff',
    },
    statLbl: {
      fontSize: 11,
      color: 'rgba(255,255,255,0.72)',
      fontWeight: '500',
    },
    tripBanner: {
      marginHorizontal: 20,
      marginTop: 18,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 10,
    },
    tripBannerGrad: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 18,
    },
    tripBannerLabel: {
      fontSize: 10,
      fontWeight: '800',
      color: 'rgba(255,255,255,0.7)',
      letterSpacing: 1.2,
      marginBottom: 4,
    },
    tripBannerName: {
      fontSize: 17,
      fontWeight: '800',
      color: '#fff',
      marginBottom: 3,
    },
    tripBannerSub: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.75)',
    },
    tripBannerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#fff',
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 9,
    },
    tripBannerBtnTxt: {
      fontSize: 13,
      fontWeight: '700',
    },
    menuSection: {
      marginTop: 22,
      paddingHorizontal: 20,
    },
    menuSectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.gray,
      letterSpacing: 1.3,
      marginBottom: 10,
    },
    menuCard: {
      backgroundColor: theme.cardBg,
      borderRadius: 20,
      overflow: 'hidden',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      borderWidth: theme.mode === 'dark' ? 1 : 0,
      borderColor: theme.border,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    menuLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: theme.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.dark,
    },
    menuRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    menuValue: {
      fontSize: 13,
      color: theme.gray,
    },
    menuDivider: {
      height: 1,
      backgroundColor: theme.border,
      marginLeft: 64,
    },
    logoutBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      marginHorizontal: 20,
      marginTop: 24,
      backgroundColor: theme.dangerLight,
      borderRadius: 18,
      paddingVertical: 15,
      borderWidth: 1.5,
      borderColor: theme.mode === 'dark' ? '#7F1D1D' : '#FECACA',
    },
    logoutTxt: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.danger,
    },
    version: {
      textAlign: 'center',
      color: theme.gray,
      fontSize: 12,
      marginTop: 14,
    },
  });