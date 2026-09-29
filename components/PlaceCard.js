import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import COLORS from '../constants/colors';
import { useTrip } from '../context/TripContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
export const CARD_WIDTH = width * 0.72;

function StarRating({ rating }) {
  const val = parseFloat(rating) || 0;
  return (
    <View style={{ flexDirection: 'row', gap: 1 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Ionicons
          key={i}
          name={
            i <= Math.floor(val)
              ? 'star'
              : i === Math.ceil(val) && val % 1 >= 0.5
              ? 'star-half'
              : 'star-outline'
          }
          size={11}
          color="#F59E0B"
        />
      ))}
    </View>
  );
}

export default function PlaceCard({ place, onPress, onRoute, style }) {
  const { theme } = useTheme();
  const { isPlaceSaved, addPlaceToSaved, removePlaceFromSaved } = useTrip();
  const saved = isPlaceSaved(place.id);

  const toggleSave = (e) => {
    e.stopPropagation();
    if (saved) removePlaceFromSaved(place.id);
    else addPlaceToSaved(place);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBg,
          shadowColor: theme.shadowDark,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.92}
    >
      <View style={styles.imageWrapper}>
        {place.image ? (
          <Image source={{ uri: place.image }} style={styles.image} />
        ) : (
          <LinearGradient
            colors={theme.mode === 'dark' ? ['#1E293B', '#020617'] : ['#CBD5E1', '#94A3B8']}
            style={styles.imagePlaceholder}
          >
            <Ionicons name="image-outline" size={32} color={COLORS.white} />
          </LinearGradient>
        )}

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={toggleSave}
          activeOpacity={0.8}
        >
          <Ionicons
            name={saved ? 'bookmark' : 'bookmark-outline'}
            size={16}
            color={saved ? theme.primary : COLORS.white}
          />
        </TouchableOpacity>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {(place.category || 'place').charAt(0).toUpperCase() +
              (place.category || 'place').slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.name, { color: theme.text }]}
          numberOfLines={1}
        >
          {place.name}
        </Text>

        <View style={styles.ratingRow}>
          <StarRating rating={place.rating} />
          <Text style={[styles.ratingNum, { color: theme.text }]}>
            {place.rating}
          </Text>
          <Text style={[styles.reviews, { color: theme.textSub }]}>
            ({place.reviews})
          </Text>
        </View>

        <View style={styles.distRow}>
          <Ionicons name="location-outline" size={13} color={theme.gray} />
          <Text style={[styles.dist, { color: theme.textSub }]}>
            {place.distance} mi · {place.walkTime} min walk
          </Text>
        </View>

        <TouchableOpacity
          style={styles.routeBtn}
          onPress={onRoute}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[theme.primary, theme.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.routeBtnGrad}
          >
            <Ionicons name="navigate" size={13} color="#fff" />
            <Text style={styles.routeBtnText}>Show Route</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 14,
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  imageWrapper: { position: 'relative' },
  image: { width: '100%', height: 140, resizeMode: 'cover' },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  categoryBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  content: { padding: 12 },
  name: { fontSize: 15, fontWeight: '800', marginBottom: 5 },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  ratingNum: { fontSize: 12, fontWeight: '700' },
  reviews: { fontSize: 11 },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  dist: { fontSize: 12, fontWeight: '500' },
  routeBtn: { borderRadius: 12, overflow: 'hidden' },
  routeBtnGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  routeBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});