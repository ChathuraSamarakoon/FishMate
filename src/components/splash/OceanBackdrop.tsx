import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, useWindowDimensions, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

const aquaGlow = require('../../../assets/fishmate/aqua-glow.png');
const waveBack = require('../../../assets/fishmate/ocean-flow-back.png');
const waveMiddle = require('../../../assets/fishmate/ocean-flow-middle.png');
const waveFront = require('../../../assets/fishmate/ocean-flow-front.png');

/**
 * Every image has a periodic wave curve, so two copies placed edge-to-edge
 * scroll seamlessly. Different speeds, directions and vertical sway make the
 * overlaps continuously change shape (the waves do NOT bounce left/right).
 * All animations use native-driver-friendly transforms and opacity.
 */
const WAVES = [
  {
    source: waveBack,
    top: 0.395,
    height: 0.35,
    opacity: 0.74,
    duration: 14700,
    direction: 'left' as const,
    sway: 5,
    swayDuration: 5400,
  },
  {
    source: waveMiddle,
    top: 0.452,
    height: 0.335,
    opacity: 0.73,
    duration: 11700,
    direction: 'right' as const,
    sway: 8,
    swayDuration: 6300,
  },
  {
    source: waveFront,
    top: 0.50,
    height: 0.322,
    opacity: 0.70,
    duration: 8900,
    direction: 'left' as const,
    sway: 4.5,
    swayDuration: 4900,
  },
];

const BUBBLES = [
  { x: 0.12, y: 0.49, radius: 3.3, travel: 45, duration: 5800, delay: 350 },
  { x: 0.86, y: 0.52, radius: 2.3, travel: 58, duration: 6900, delay: 1200 },
  { x: 0.24, y: 0.67, radius: 2.8, travel: 48, duration: 7600, delay: 2600 },
  { x: 0.73, y: 0.62, radius: 3.5, travel: 57, duration: 6400, delay: 1900 },
  { x: 0.45, y: 0.53, radius: 1.9, travel: 39, duration: 5900, delay: 3300 },
  { x: 0.92, y: 0.73, radius: 2.7, travel: 53, duration: 7300, delay: 800 },
] as const;

type WaveLayerProps = {
  source: ImageSourcePropType;
  width: number;
  screenHeight: number;
  top: number;
  height: number;
  opacity: number;
  duration: number;
  direction: 'left' | 'right';
  sway: number;
  swayDuration: number;
};

function WaveLayer({
  source,
  width,
  screenHeight,
  top,
  height,
  opacity,
  duration,
  direction,
  sway,
  swayDuration,
}: WaveLayerProps) {
  const drift = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const tileWidth = Math.ceil(width * 1.5); // Wider than screen; never shows an uncovered edge.
  const layerHeight = Math.ceil(screenHeight * height);

  useEffect(() => {
    // Repeating once across one whole image always lands on the same wave shape.
    drift.setValue(0);
    bob.setValue(0);
    const drifting = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    const floating = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: swayDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: swayDuration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    drifting.start();
    floating.start();
    return () => {
      drifting.stop();
      floating.stop();
    };
  }, [bob, drift, duration, swayDuration]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: screenHeight * top,
        left: direction === 'left' ? 0 : -tileWidth,
        width: tileWidth * 2,
        height: layerHeight,
        flexDirection: 'row',
        opacity,
        transform: [
          {
            translateX: drift.interpolate({
              inputRange: [0, 1],
              outputRange: [0, direction === 'left' ? -tileWidth : tileWidth],
            }),
          },
          { translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [-sway, sway] }) },
        ],
      }}
    >
      <Image source={source} resizeMode="stretch" style={{ width: tileWidth, height: layerHeight }} />
      <Image source={source} resizeMode="stretch" style={{ width: tileWidth, height: layerHeight }} />
    </Animated.View>
  );
}

function Bubbles({ width, height }: { width: number; height: number }) {
  const values = useRef(BUBBLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = values.map((value, index) => {
      const bubble = BUBBLES[index];
      value.setValue(0);
      const animation = Animated.loop(
        Animated.sequence([
          Animated.delay(bubble.delay),
          Animated.timing(value, {
            toValue: 1,
            duration: bubble.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return animation;
    });
    return () => animations.forEach((animation) => animation.stop());
  }, [values]);

  return (
    <>
      {BUBBLES.map((bubble, index) => (
        <Animated.View
          key={index}
          style={{
            position: 'absolute',
            left: width * bubble.x,
            top: height * bubble.y,
            width: bubble.radius * 2,
            height: bubble.radius * 2,
            borderRadius: bubble.radius,
            borderWidth: 0.9,
            borderColor: '#6EBECD',
            backgroundColor: 'rgba(220, 248, 248, 0.2)',
            opacity: values[index].interpolate({
              inputRange: [0, 0.18, 0.75, 1],
              outputRange: [0, 0.37, 0.22, 0],
            }),
            transform: [
              {
                translateY: values[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [6, -bubble.travel],
                }),
              },
              {
                translateX: values[index].interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [-2, 5, 1],
                }),
              },
            ],
          }}
        />
      ))}
    </>
  );
}

/** Decorative, touch-through background shared by Splash and Welcome screens. */
export function OceanBackdrop() {
  const { width, height } = useWindowDimensions();
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [glow]);

  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clipped]}>
      <Animated.Image
        source={aquaGlow}
        resizeMode="contain"
        style={{
          position: 'absolute',
          width: width * 1.22,
          height: width * 1.22,
          left: -width * 0.11,
          top: height * 0.15,
          opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0.42, 0.60] }),
        }}
      />
      {WAVES.map((layer, index) => (
        <WaveLayer key={index} {...layer} width={width} screenHeight={height} />
      ))}
      <Bubbles width={width} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({ clipped: { overflow: 'hidden' } });
