import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandMark } from '@/components/splash/BrandMark';
import { OceanBackdrop } from '@/components/splash/OceanBackdrop';
import { WelcomeActions } from '@/components/splash/WelcomeActions';

/**
 * Animated launch route based on the supplied preview video.
 * Sequence: ocean glow/ripple -> fish icon -> FishMate wordmark -> shift into Welcome.
 * All motion uses native-driver-friendly opacity and transforms.
 * Welcome is a real next route so relaunching '/' will replay this intro.
 */
export default function SplashScreen() {
  const { width, height } = useWindowDimensions();
  const rippleTop = height * 0.35 + (Math.min(width * 0.55, 226) * (467 / 844)) / 2 - 135;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.72)).current;
  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordOffset = useRef(new Animated.Value(16)).current;
  const brandShift = useRef(new Animated.Value(1)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeRise = useRef(new Animated.Value(22)).current;
  const rippleProgress = useRef(new Animated.Value(0)).current;
  const secondRipple = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // The video lasts around 10 seconds; the actual app uses a faster launch (~4.5 s).
    const sequence = Animated.sequence([
      Animated.delay(340),
      Animated.parallel([
        Animated.timing(iconOpacity, {
          toValue: 1,
          duration: 680,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1,
          friction: 8,
          tension: 54,
          useNativeDriver: true,
        }),
        Animated.timing(rippleProgress, {
          toValue: 1,
          duration: 1300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(270),
          Animated.timing(secondRipple, {
            toValue: 1,
            duration: 1120,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.delay(70),
      Animated.parallel([
        Animated.timing(wordOpacity, {
          toValue: 1,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(wordOffset, {
          toValue: 0,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(brandShift, {
          toValue: 0,
          duration: 820,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeOpacity, {
          toValue: 1,
          duration: 760,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeRise, {
          toValue: 0,
          duration: 760,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(420),
    ]);

    sequence.start(({ finished }) => {
      if (finished) router.replace('/welcome');
    });
    return () => sequence.stop();
  }, [
    brandShift,
    iconOpacity,
    iconScale,
    rippleProgress,
    secondRipple,
    welcomeOpacity,
    welcomeRise,
    wordOffset,
    wordOpacity,
  ]);

  const yShift = brandShift.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.185],
  });

  return (
    <View style={styles.page}>
      <OceanBackdrop />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ripple,
              {
                top: rippleTop,
                transform: [
                  {
                    scale: rippleProgress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1.55] }),
                  },
                ],
                opacity: rippleProgress.interpolate({
                  inputRange: [0, 0.18, 1],
                  outputRange: [0, 0.21, 0],
                }),
              },
            ]}
          />
          <Animated.View
            pointerEvents="none"
            style={[
              styles.ripple,
              {
                top: rippleTop,
                transform: [
                  {
                    scale: secondRipple.interpolate({ inputRange: [0, 1], outputRange: [0.45, 1.7] }),
                  },
                ],
                opacity: secondRipple.interpolate({
                  inputRange: [0, 0.17, 1],
                  outputRange: [0, 0.15, 0],
                }),
              },
            ]}
          />
          <Animated.View style={[styles.brandContainer, { top: height * 0.165, transform: [{ translateY: yShift }] }]}>
            <BrandMark
              iconOpacity={iconOpacity}
              iconScale={iconScale}
              wordOpacity={wordOpacity}
              wordOffset={wordOffset}
            />
          </Animated.View>
          <Animated.View
            style={[
              styles.welcomeContainer,
              {
                bottom: Math.max(32, height * 0.075),
                opacity: welcomeOpacity,
                transform: [{ translateY: welcomeRise }],
              },
            ]}
          >
            <WelcomeActions onGetStarted={() => router.replace('/role-select')} />
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#FBFCF8' },
  safeArea: { flex: 1 },
  content: { flex: 1, position: 'relative', overflow: 'hidden' },
  brandContainer: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  welcomeContainer: { position: 'absolute', left: 20, right: 20, alignItems: 'center' },
  ripple: {
    position: 'absolute',
    alignSelf: 'center',
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 2,
    borderColor: '#5CCDC8',
    backgroundColor: 'rgba(79, 199, 202, 0.035)',
  },
});
