import { StyleSheet, Text, View } from 'react-native';
import { CustomerIcon } from '@/components/customer/Icon';
import { customerUi as c } from '@/components/customer/theme';
import { AVATAR_THEMES, makeInitials, type AvatarTheme } from '@/utils/customerProfileUtils';

type RowIcon = 'user' | 'phone' | 'pin' | 'message' | 'bag';

export function CustomerAvatar({ name, avatarTheme, size = 88 }: { name: string; avatarTheme: AvatarTheme; size?: number }) {
  const palette = AVATAR_THEMES.find(theme => theme.value === avatarTheme) ?? AVATAR_THEMES[0];
  const radius = Math.round(size * 0.34);
  return (
    <View style={{ width: size, height: size, borderRadius: radius, backgroundColor: palette.color, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#FFFFFF' }}>
      <Text style={{ fontSize: size * 0.31, color: palette.accent, fontWeight: '900', letterSpacing: -1 }}>{makeInitials(name)}</Text>
    </View>
  );
}

export function ProfileSectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={styles.heading}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
    </View>
  );
}

export function ProfileInfoRow({ icon, label, value, last = false }: { icon: RowIcon; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <View style={styles.iconBox}><CustomerIcon name={icon} size={19} color={c.tealDark} /></View>
      <View style={styles.rowCopy}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
}

export function ProfileNotice({ children, kind = 'info' }: { children: string; kind?: 'info' | 'success' | 'warning' }) {
  const success = kind === 'success';
  return <View style={[styles.notice, success && styles.successNotice]}>
    <Text style={[styles.noticeText, success && styles.successText]}>{children}</Text>
  </View>;
}

const styles = StyleSheet.create({
  sectionHeading: { marginTop: 25, marginBottom: 12, gap: 3 },
  heading: { fontSize: 18, fontWeight: '900', color: c.navy },
  sectionSub: { color: c.muted, fontSize: 11, lineHeight: 17 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EDF3F2' },
  iconBox: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: c.soft },
  rowCopy: { flex: 1, gap: 4 },
  label: { color: c.muted, fontSize: 11, fontWeight: '600' },
  value: { color: c.navy, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  notice: { backgroundColor: '#EEF7FA', borderWidth: 1, borderColor: '#D9EBEE', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 15, marginTop: 16 },
  successNotice: { backgroundColor: '#E7FAF0', borderColor: '#B8E5CA' },
  noticeText: { color: c.muted, fontSize: 12, lineHeight: 18 },
  successText: { color: '#147453', fontWeight: '700' },
});
