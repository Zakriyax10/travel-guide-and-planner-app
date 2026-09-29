import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const CATEGORY_CONFIG = {
  tourism: { icon: 'camera', color: '#8B5CF6', bg: '#F5F3FF' },
  restaurant: { icon: 'restaurant', color: '#F97316', bg: '#FFF7ED' },
  cafe: { icon: 'cafe', color: '#92400E', bg: '#FEF3C7' },
  hotel: { icon: 'bed', color: '#2563EB', bg: '#EFF6FF' },
  bar: { icon: 'wine', color: '#DC2626', bg: '#FEF2F2' },
  museum: { icon: 'business', color: '#059669', bg: '#ECFDF5' },
  park: { icon: 'leaf', color: '#16A34A', bg: '#F0FDF4' },
  default: { icon: 'location', color: COLORS.primary, bg: COLORS.primaryLight },
};

export default function CustomMarker({ category, selected, image }) {
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.default;

  // Only treat as having image if it's a non-empty string
  const hasInitialImage = typeof image === 'string' && image.trim().length > 0;
  const [imageOk, setImageOk] = useState(hasInitialImage);

  const showImage = imageOk && hasInitialImage;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: selected ? config.color : COLORS.white,
            borderColor: config.color,
            transform: [{ scale: selected ? 1.2 : 1 }],
          },
        ]}
      >
        {showImage ? (
          <Image
            source={{ uri: image }}
            style={styles.image}
            resizeMode="cover"
            onError={() => setImageOk(false)} // fallback to icon if loading fails
          />
        ) : (
          <Ionicons
            name={config.icon}
            size={16}
            color={selected ? COLORS.white : config.color}
          />
        )}
      </View>
      <View style={[styles.tail, { borderTopColor: config.color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center' },
  bubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    overflow: 'hidden', // clip image to circle
  },
  image: {
    width: '100%',
    height: '100%',
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
});