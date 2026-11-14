import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FishermanIcon, type FishermanIconName } from './FishermanIcon';
import { fishermanUi as ui } from './theme';

const logo = require('../../../assets/fishmate/fishmate-icon.png');

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean;
  onBack?: () => void;
  rightIcon?: FishermanIconName;
  rightLabel?: string;
  onRightPress?: () => void;
  hideNavPadding?: boolean;
};

export function FishermanShell({
  children,
  title,
  subtitle,
  back,
  onBack,
  rightIcon,
  rightLabel,
  onRightPress,
  hideNavPadding,
}: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={
            onBack
              ? onBack
              : back
              ? () => {
                  if (router.canGoBack()) router.back();
                  else router.replace('/fisherman/dashboard');
                }
              : () => router.replace('/fisherman/dashboard')
          }
          accessibilityRole="button"
          accessibilityLabel={back ? 'Go back' : 'Go to Fisherman Dashboard'}
          style={[styles.leading, back && styles.backBox]}
        >
          {back ? (
            <FishermanIcon name="arrow-left" size={20} color={ui.navy} />
          ) : (
            <Image source={logo} resizeMode="contain" style={styles.brandIcon} />
          )}
        </Pressable>

        <View style={styles.headline}>
          <Text style={styles.brandSmall}>
            {back ? 'FISHMATE SELLER' : 'FISHMATE  /  FISHERMAN'}
          </Text>
          {!!title && (
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
          )}
          {!!subtitle && (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        {rightIcon ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={rightLabel ?? 'Open action'}
            onPress={onRightPress}
            style={styles.action}
          >
            <FishermanIcon name={rightIcon} color={ui.navy} size={21} />
          </Pressable>
        ) : (
          <View style={styles.actionSpace} />
        )}
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          hideNavPadding ? styles.contentDetail : styles.contentTabs,
        ]}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: ui.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 14,
    gap: 12,
  },
  leading: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: ui.tealLight,
  },
  backBox: {
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  brandIcon: { width: 39, height: 39 },
  headline: { flex: 1, gap: 2 },
  brandSmall: {
    color: ui.tealDark,
    fontSize: 9,
    letterSpacing: 1.8,
    fontWeight: '900',
  },
  title: {
    color: ui.navy,
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  subtitle: { color: ui.muted, fontSize: 11 },
  action: {
    width: 45,
    height: 45,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ui.border,
    backgroundColor: ui.surface,
  },
  actionSpace: { width: 45 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 4,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  contentTabs: { paddingBottom: 138 },
  contentDetail: { paddingBottom: 40 },
});
