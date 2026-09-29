import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ImageBackground, StatusBar, FlatList, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1', icon: 'map',
    title: 'Plan Unforgettable', highlight: 'Road Trips',
    subtitle: 'Discover and schedule stunning destinations. Built for passionate travellers.',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=900&q=80',
    accent: ['#2563EB', '#7C3AED'],
  },
  {
    id: '2', icon: 'compass',
    title: 'Explore Hidden', highlight: 'Gems Nearby',
    subtitle: 'Find unique spots, cozy cafes, and amazing restaurants around you instantly.',
    image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=900&q=80',
    accent: ['#059669', '#2563EB'],
  },
  {
    id: '3', icon: 'sparkles',
    title: 'Your AI Travel', highlight: 'Assistant',
    subtitle: 'Get personalized itineraries from our Gemini-powered AI. Budget, destination, duration — all covered.',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=80',
    accent: ['#7C3AED', '#EC4899'],
  },
];

export default function OnboardingScreen({ navigation }) {
  const [idx, setIdx] = useState(0);
  const listRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (idx < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: idx + 1 });
      setIdx(idx + 1);
    } else {
      navigation.replace('Login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        horizontal pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => (
          <ImageBackground source={{ uri: item.image }} style={styles.slide} resizeMode="cover">
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.88)']} style={styles.grad}>
              <View style={styles.slideContent}>
                <LinearGradient colors={item.accent} style={styles.iconBadge}>
                  <Ionicons name={item.icon} size={26} color="#fff" />
                </LinearGradient>
                <Text style={styles.title}>
                  {item.title}{'\n'}<Text style={styles.highlight}>{item.highlight}</Text>
                </Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        )}
      />
      <View style={styles.bottom}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const w = scrollX.interpolate({ inputRange: [(i - 1) * width, i * width, (i + 1) * width], outputRange: [8, 26, 8], extrapolate: 'clamp' });
            const op = scrollX.interpolate({ inputRange: [(i - 1) * width, i * width, (i + 1) * width], outputRange: [0.35, 1, 0.35], extrapolate: 'clamp' });
            return <Animated.View key={i} style={[styles.dot, { width: w, opacity: op }]} />;
          })}
        </View>
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.nextBtn} onPress={goNext} activeOpacity={0.88}>
            <Text style={styles.nextBtnText}>{idx === SLIDES.length - 1 ? 'GET STARTED' : 'NEXT'}</Text>
            <View style={styles.arrow}><Ionicons name="arrow-forward" size={17} color={COLORS.dark} /></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.skipBtn}>
            <Text style={styles.skipText}>or Log in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  slide: { width, height },
  grad: { flex: 1, justifyContent: 'flex-end', paddingBottom: 190, paddingHorizontal: 28 },
  slideContent: {},
  iconBadge: {
    width: 58, height: 58, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', marginBottom: 22,
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  title: { fontSize: 38, fontWeight: '800', color: '#fff', lineHeight: 46, marginBottom: 14 },
  highlight: { color: '#93C5FD' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.78)', lineHeight: 24 },
  bottom: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 28, paddingBottom: 52, paddingTop: 18,
  },
  dots: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  dot: { height: 8, borderRadius: 4, backgroundColor: '#fff' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  nextBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 50,
    paddingVertical: 15, paddingLeft: 26, paddingRight: 8, gap: 12,
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.22, shadowRadius: 10,
  },
  nextBtnText: { fontSize: 14, fontWeight: '800', color: COLORS.dark, letterSpacing: 0.8 },
  arrow: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: COLORS.grayLight, justifyContent: 'center', alignItems: 'center',
  },
  skipBtn: { padding: 8 },
  skipText: { color: 'rgba(255,255,255,0.75)', fontSize: 15, fontWeight: '500' },
});