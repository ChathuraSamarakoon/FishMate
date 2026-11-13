import { ImageBackground, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

const buttonGradient = require('../../../assets/fishmate/button-gradient.png');

type WelcomeActionsProps = {
  onGetStarted: () => void;
};

export function WelcomeActions({ onGetStarted }: WelcomeActionsProps) {
  const { width } = useWindowDimensions();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FishMate</Text>
      <Text style={styles.subtitle}>Connecting Fisheries, Empowering Trade</Text>
      <Pressable
        onPress={onGetStarted}
        accessibilityRole="button"
        accessibilityLabel="Get started with FishMate"
        style={({ pressed }) => [
          styles.button,
          { width: Math.min(width - 80, 330) },
          pressed && styles.buttonPressed,
        ]}
      >
        <ImageBackground
          source={buttonGradient}
          resizeMode="stretch"
          style={styles.buttonBackground}
          imageStyle={styles.buttonImage}
        >
          <Text style={styles.buttonLabel}>Get Started</Text>
          <Text style={styles.buttonArrow}>›</Text>
        </ImageBackground>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 21,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: '#273D49',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.1,
    color: '#78868B',
    marginTop: 7,
    textAlign: 'center',
  },
  button: {
    marginTop: 34,
    height: 56,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#009E9C',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 5,
  },
  buttonPressed: { opacity: 0.87, transform: [{ scale: 0.985 }] },
  buttonBackground: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  buttonImage: { borderRadius: 30 },
  buttonLabel: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.1 },
  buttonArrow: {
    position: 'absolute',
    right: 22,
    top: 10,
    color: '#E9FFFC',
    fontWeight: '300',
    fontSize: 27,
  },
});
