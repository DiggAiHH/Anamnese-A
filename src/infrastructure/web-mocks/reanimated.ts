/**
 * Web Mock for react-native-reanimated
 * Provides basic animation support for web
 */

import React from 'react';
import { Animated, View, Text, Image, ScrollView, FlatList } from 'react-native';
import type { ViewProps, TextProps, ImageProps, ScrollViewProps, FlatListProps } from 'react-native';

// Shared value type
interface SharedValue<T> {
  value: T;
}

// Create shared value
export function useSharedValue<T>(initialValue: T): SharedValue<T> {
  const ref = React.useRef<SharedValue<T>>({ value: initialValue });
  return ref.current;
}

// Derived value
export function useDerivedValue<T>(
  updater: () => T,
  dependencies?: readonly unknown[]
): SharedValue<T> {
  const [value, setValue] = React.useState<T>(updater());
  
  React.useEffect(() => {
    setValue(updater());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  
  return { value };
}

// Animated style hook
export function useAnimatedStyle<T extends object>(
  updater: () => T,
  dependencies?: readonly unknown[]
): T {
  const [style, setStyle] = React.useState<T>(updater());
  
  React.useEffect(() => {
    setStyle(updater());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  
  return style;
}

// Animated props hook
export function useAnimatedProps<T extends object>(
  updater: () => Partial<T>,
  dependencies?: readonly unknown[]
): Partial<T> {
  const [props, setProps] = React.useState<Partial<T>>(updater());
  
  React.useEffect(() => {
    setProps(updater());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  
  return props;
}

// Animated reaction
export function useAnimatedReaction<T>(
  prepare: () => T,
  react: (prepared: T, previous: T | null) => void,
  dependencies?: readonly unknown[]
): void {
  const previousRef = React.useRef<T | null>(null);
  
  React.useEffect(() => {
    const current = prepare();
    react(current, previousRef.current);
    previousRef.current = current;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

// Animated scroll handler
export function useAnimatedScrollHandler(
  handlers: {
    onScroll?: (event: any) => void;
    onBeginDrag?: (event: any) => void;
    onEndDrag?: (event: any) => void;
    onMomentumBegin?: (event: any) => void;
    onMomentumEnd?: (event: any) => void;
  },
  _dependencies?: readonly unknown[]
): (event: any) => void {
  return (event: any) => {
    handlers.onScroll?.(event.nativeEvent);
  };
}

// Animated gesture handler
export function useAnimatedGestureHandler<T extends object>(
  handlers: T,
  _dependencies?: readonly unknown[]
): T {
  return handlers;
}

// Worklet function decorator (no-op for web)
export function runOnJS<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}

export function runOnUI<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}

// Timing animation
interface TimingConfig {
  duration?: number;
  easing?: (t: number) => number;
}

export function withTiming(
  toValue: number,
  config?: TimingConfig,
  callback?: (finished: boolean) => void
): number {
  if (callback) {
    setTimeout(() => callback(true), config?.duration || 300);
  }
  return toValue;
}

// Spring animation
interface SpringConfig {
  damping?: number;
  mass?: number;
  stiffness?: number;
  overshootClamping?: boolean;
  restDisplacementThreshold?: number;
  restSpeedThreshold?: number;
}

export function withSpring(
  toValue: number,
  _config?: SpringConfig,
  callback?: (finished: boolean) => void
): number {
  if (callback) {
    setTimeout(() => callback(true), 500);
  }
  return toValue;
}

// Decay animation
interface DecayConfig {
  velocity?: number;
  deceleration?: number;
  clamp?: [number, number];
}

export function withDecay(
  _config?: DecayConfig,
  callback?: (finished: boolean) => void
): number {
  if (callback) {
    setTimeout(() => callback(true), 500);
  }
  return 0;
}

// Sequence animation
export function withSequence(...animations: number[]): number {
  return animations[animations.length - 1] || 0;
}

// Delay animation
export function withDelay(delayMs: number, animation: number): number {
  return animation;
}

// Repeat animation
export function withRepeat(
  animation: number,
  _numberOfReps?: number,
  _reverse?: boolean,
  callback?: (finished: boolean) => void
): number {
  if (callback) {
    setTimeout(() => callback(true), 1000);
  }
  return animation;
}

// Cancel animation
export function cancelAnimation(_sharedValue: SharedValue<any>): void {
  // No-op for web
}

// Easing functions
export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,
  poly: (n: number) => (t: number) => Math.pow(t, n),
  sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  circle: (t: number) => 1 - Math.sqrt(1 - t * t),
  exp: (t: number) => Math.pow(2, 10 * (t - 1)),
  elastic: (bounciness: number) => (t: number) => t,
  back: (s: number) => (t: number) => t * t * ((s + 1) * t - s),
  bounce: (t: number) => t,
  bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => t,
  bezierFn: (x1: number, y1: number, x2: number, y2: number) => (t: number) => t,
  in: (easing: (t: number) => number) => easing,
  out: (easing: (t: number) => number) => (t: number) => 1 - easing(1 - t),
  inOut: (easing: (t: number) => number) => (t: number) => t < 0.5 ? easing(t * 2) / 2 : 1 - easing((1 - t) * 2) / 2,
};

// Interpolate function
export function interpolate(
  value: number,
  inputRange: readonly number[],
  outputRange: readonly number[],
  _extrapolate?: 'clamp' | 'extend' | 'identity'
): number {
  if (inputRange.length !== outputRange.length) {
    return value;
  }
  
  for (let i = 0; i < inputRange.length - 1; i++) {
    if (value >= inputRange[i] && value <= inputRange[i + 1]) {
      const ratio = (value - inputRange[i]) / (inputRange[i + 1] - inputRange[i]);
      return outputRange[i] + ratio * (outputRange[i + 1] - outputRange[i]);
    }
  }
  
  return outputRange[outputRange.length - 1];
}

// Interpolate color
export function interpolateColor(
  value: number,
  inputRange: readonly number[],
  outputRange: readonly string[],
  _colorSpace?: 'RGB' | 'HSV'
): string {
  const index = Math.min(
    Math.floor((value - inputRange[0]) / (inputRange[inputRange.length - 1] - inputRange[0]) * (outputRange.length - 1)),
    outputRange.length - 1
  );
  return outputRange[Math.max(0, index)];
}

// Clamp
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Create animated component
export function createAnimatedComponent<T extends React.ComponentType<any>>(
  component: T
): T {
  return component;
}

// Animated components
export const AnimatedView = Animated.View as React.ComponentType<ViewProps & { style?: any }>;
export const AnimatedText = Animated.Text as React.ComponentType<TextProps & { style?: any }>;
export const AnimatedImage = Animated.Image as React.ComponentType<ImageProps & { style?: any }>;
export const AnimatedScrollView = Animated.ScrollView as React.ComponentType<ScrollViewProps & { style?: any }>;
export const AnimatedFlatList = Animated.FlatList as React.ComponentType<FlatListProps<any> & { style?: any }>;

// Default animated components export
const AnimatedComponents = {
  View: AnimatedView,
  Text: AnimatedText,
  Image: AnimatedImage,
  ScrollView: AnimatedScrollView,
  FlatList: AnimatedFlatList,
  createAnimatedComponent,
};

// Layout animations
export const Layout = {
  duration: (_duration: number) => Layout,
  delay: (_delay: number) => Layout,
  springify: () => Layout,
  damping: (_damping: number) => Layout,
  mass: (_mass: number) => Layout,
  stiffness: (_stiffness: number) => Layout,
  overshootClamping: (_overshootClamping: boolean) => Layout,
  restDisplacementThreshold: (_restDisplacementThreshold: number) => Layout,
  restSpeedThreshold: (_restSpeedThreshold: number) => Layout,
};

export const FadeIn = Layout;
export const FadeOut = Layout;
export const FadeInUp = Layout;
export const FadeInDown = Layout;
export const FadeInLeft = Layout;
export const FadeInRight = Layout;
export const FadeOutUp = Layout;
export const FadeOutDown = Layout;
export const FadeOutLeft = Layout;
export const FadeOutRight = Layout;
export const SlideInUp = Layout;
export const SlideInDown = Layout;
export const SlideInLeft = Layout;
export const SlideInRight = Layout;
export const SlideOutUp = Layout;
export const SlideOutDown = Layout;
export const SlideOutLeft = Layout;
export const SlideOutRight = Layout;
export const ZoomIn = Layout;
export const ZoomOut = Layout;
export const StretchInX = Layout;
export const StretchInY = Layout;
export const StretchOutX = Layout;
export const StretchOutY = Layout;

// Keyboard
export const useAnimatedKeyboard = () => ({
  height: { value: 0 },
  state: { value: 0 },
});

// Default export
export default {
  ...AnimatedComponents,
  useSharedValue,
  useDerivedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedGestureHandler,
  useAnimatedKeyboard,
  runOnJS,
  runOnUI,
  withTiming,
  withSpring,
  withDecay,
  withSequence,
  withDelay,
  withRepeat,
  cancelAnimation,
  Easing,
  interpolate,
  interpolateColor,
  clamp,
  createAnimatedComponent,
  Layout,
  FadeIn,
  FadeOut,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOutUp,
  FadeOutDown,
  FadeOutLeft,
  FadeOutRight,
  SlideInUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
  SlideOutUp,
  SlideOutDown,
  SlideOutLeft,
  SlideOutRight,
  ZoomIn,
  ZoomOut,
  StretchInX,
  StretchInY,
  StretchOutX,
  StretchOutY,
};
