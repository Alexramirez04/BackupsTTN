import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';

interface Props {
  width?: number | string;
  height?: number | string;
  style?: StyleProp<ViewStyle>;
  borderRadius?: number;
}

export default function Skeleton({ width = '100%', height = 20, style, borderRadius = 8 }: Props) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  // Asegurar que width y height sean compatibles con Animated.View
  let resolvedWidth: number | `${number}%` | 'auto';
  if (typeof width === 'number') {
    resolvedWidth = width;
  } else if (width === '100%') {
    resolvedWidth = '100%';
  } else if (width === 'auto') {
    resolvedWidth = 'auto';
  } else if (typeof width === 'string' && width.endsWith('%')) {
    resolvedWidth = width as `${number}%`;
  } else {
    resolvedWidth = 'auto';
  }

  let resolvedHeight: number | `${number}%` | 'auto';
  if (typeof height === 'number') {
    resolvedHeight = height;
  } else if (height === '100%') {
    resolvedHeight = '100%';
  } else if (height === 'auto') {
    resolvedHeight = 'auto';
  } else if (typeof height === 'string' && height.endsWith('%')) {
    resolvedHeight = height as `${number}%`;
  } else {
    resolvedHeight = 'auto';
  }

  return (
    <Animated.View
      style={[
        { width: resolvedWidth, height: resolvedHeight, backgroundColor: '#E5E7EB', borderRadius, opacity },
        style,
      ]}
    />
  );
} 