import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomerIcon } from './Icon';
import { customerUi } from './theme';

const logo = require('../../../assets/fishmate/fishmate-icon.png');

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  back?: boolean;
  rightIcon?: 'bag' | 'search' | 'message';
  rightLabel?: string;
  onRightPress?: () => void;
  hideNavPadding?: boolean;
};

export function CustomerShell({ children, title, subtitle, back, rightIcon, rightLabel, onRightPress, hideNavPadding }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={back ? () => { if (router.canGoBack()) router.back(); else router.replace('/customer/home'); } : () => router.replace('/customer/home')}
          accessibilityRole="button"
          accessibilityLabel={back ? 'Go back' : 'Go to FishMate Home'}
          style={[styles.leading, back && styles.backBox]}
        >
          {back ? <CustomerIcon name="arrow-left" size={20} color={customerUi.navy} /> : <Image source={logo} resizeMode="contain" style={styles.brandIcon} />}
        </Pressable>
        <View style={styles.headline}>
          <Text style={styles.brandSmall}>{back ? 'FISHMATE MARKETPLACE' : 'FISHMATE  /  CUSTOMER'}</Text>
          {!!title && <Text numberOfLines={1} style={styles.title}>{title}</Text>}
          {!!subtitle && <Text numberOfLines={1} style={styles.subtitle}>{subtitle}</Text>}
        </View>
        {rightIcon ? (
          <Pressable accessibilityRole="button" accessibilityLabel={rightLabel ?? 'Open action'} onPress={onRightPress} style={styles.action}>
            <CustomerIcon name={rightIcon} color={customerUi.navy} size={21} />
          </Pressable>
        ) : <View style={styles.actionSpace} />}
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, hideNavPadding ? styles.contentDetail : styles.contentTabs]}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: customerUi.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 13, paddingBottom: 14, gap: 12 },
  leading: { width: 45, height: 45, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#E5F8F5' },
  backBox: { backgroundColor: customerUi.surface, borderWidth: 1, borderColor: customerUi.border },
  brandIcon: { width: 39, height: 39 },
  headline: { flex: 1, gap: 2 },
  brandSmall: { color: customerUi.tealDark, fontSize: 9, letterSpacing: 1.8, fontWeight: '900' },
  title: { color: customerUi.navy, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  subtitle: { color: customerUi.muted, fontSize: 11 },
  action: { width: 45, height: 45, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: customerUi.border, backgroundColor: customerUi.surface },
  actionSpace: { width: 45 },
  content: { paddingHorizontal: 20, paddingTop: 4, width: '100%', maxWidth: 620, alignSelf: 'center' },
  contentTabs: { paddingBottom: 138 },
  contentDetail: { paddingBottom: 40 },
});
