import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { router } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CustomerAvatar, ProfileNotice, ProfileSectionHeading } from '@/components/customer/ProfileUI';
import { useCustomerProfile } from '@/components/customer/CustomerProfileContext';
import { customerUi as c } from '@/components/customer/theme';
import { AVATAR_THEMES, type AvatarTheme, type ProfileFieldErrors } from '@/utils/customerProfileUtils';
import type { CustomerProfileDraft } from '@/utils/customerProfileUtils';

function EditInput({ label, hint, error, multiline, ...props }: TextInputProps & { label: string; hint?: string; error?: string }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        {...props}
        accessibilityLabel={label}
        multiline={multiline}
        placeholderTextColor="#99AEB6"
        selectionColor={c.teal}
        style={[styles.field, multiline && styles.fieldMultiline, !!error && styles.fieldInvalid]}
      />
      {!!error ? <Text style={styles.errorText}>{error}</Text> : hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

export default function EditCustomerProfile() {
  const { profile, saveProfile } = useCustomerProfile();
  const [form, setForm] = useState<CustomerProfileDraft>(() => ({
    fullName: profile?.fullName ?? '',
    phone: profile?.phone ?? '',
    email: profile?.email ?? '',
    city: profile?.city ?? '',
    address: profile?.address ?? '',
    avatarTheme: profile?.avatarTheme ?? 'aqua',
  }));
  const [errors, setErrors] = useState<ProfileFieldErrors>({});
  const [generalError, setGeneralError] = useState('');

  const change = (field: keyof CustomerProfileDraft, value: string) => {
    setForm(previous => ({ ...previous, [field]: value }));
    if (field !== 'avatarTheme') setErrors(previous => ({ ...previous, [field]: undefined }));
    setGeneralError('');
  };
  const save = () => {
    setGeneralError('');
    const result = saveProfile(form);
    if (!result.ok) {
      setErrors(result.errors);
      setGeneralError(result.message ?? (Object.keys(result.errors).length > 0 ? 'Please check the highlighted fields.' : 'Unable to save changes.'));
      return;
    }
    router.replace({ pathname: '/customer/account', params: { saved: '1' } });
  };
  const cancel = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/customer/account');
  };

  if (!profile) {
    return <CustomerShell title="Edit profile" subtitle="C09 · Customer details" back hideNavPadding>
      <View style={styles.formCard}><Text style={styles.fieldLabel}>A customer login is required to edit your profile.</Text>
        <Pressable onPress={() => router.replace('/login')} style={styles.save}><Text style={styles.saveText}>Go to login</Text></Pressable>
      </View>
    </CustomerShell>;
  }

  return (
    <CustomerShell title="Edit profile" subtitle="C09 · Make your FishMate profile yours" back hideNavPadding>
      <View style={styles.avatarCard}>
        <View style={styles.avatarAccent} />
        <CustomerAvatar name={form.fullName} avatarTheme={form.avatarTheme} size={93} />
        <Text style={styles.avatarTitle}>Choose your avatar style</Text>
        <Text style={styles.avatarHelp}>Your initials will appear on your customer profile.</Text>
        <View style={styles.swatches}>
          {AVATAR_THEMES.map(theme => (
            <Pressable
              key={theme.value}
              accessibilityRole="radio"
              accessibilityLabel={theme.name}
              accessibilityState={{ selected: form.avatarTheme === theme.value }}
              onPress={() => change('avatarTheme', theme.value)}
              style={[styles.swatchOutline, form.avatarTheme === theme.value && styles.swatchSelected]}
            >
              <View style={[styles.swatch, { backgroundColor: theme.color }]}>
                <View style={[styles.swatchDot, { backgroundColor: theme.accent }]} />
              </View>
            </Pressable>
          ))}
        </View>
        <Text style={styles.avatarSmallNote}>A real profile photo picker will be added when image-upload support is connected.</Text>
      </View>

      <ProfileSectionHeading title="Personal information" subtitle="Fields marked * are required" />
      <View style={styles.formCard}>
        <EditInput
          label="Full name *"
          value={form.fullName}
          onChangeText={value => change('fullName', value)}
          autoCapitalize="words"
          autoComplete="name"
          placeholder="Your full name"
          maxLength={60}
          error={errors.fullName}
        />
        <EditInput
          label="Mobile number *"
          value={form.phone}
          onChangeText={value => change('phone', value)}
          keyboardType="phone-pad"
          autoComplete="tel"
          placeholder="07X XXX XXXX"
          maxLength={13}
          error={errors.phone}
          hint="Use a Sri Lankan mobile number. Real re-verification requires a backend."
        />
        <EditInput
          label="Email address (optional)"
          value={form.email}
          onChangeText={value => change('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="example@email.com"
          maxLength={100}
          error={errors.email}
        />
      </View>

      <ProfileSectionHeading title="Delivery preferences" subtitle="Optional details for future orders and checkout" />
      <View style={styles.formCard}>
        <EditInput
          label="City / area"
          value={form.city}
          onChangeText={value => change('city', value)}
          placeholder="e.g. Negombo"
          maxLength={60}
          error={errors.city}
        />
        <EditInput
          label="Preferred delivery address"
          value={form.address}
          onChangeText={value => change('address', value)}
          placeholder="House number, street, landmarks..."
          maxLength={180}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          error={errors.address}
        />
        <Text style={styles.addressHint}>Address is not shared with a seller in this frontend prototype.</Text>
      </View>

      {!!generalError ? <View style={styles.errorPanel}><Text style={styles.errorPanelText}>{generalError}</Text></View> : null}
      <ProfileNotice>Changes are stored locally in demo memory only. Changing your mobile number here does not send a verification code.</ProfileNotice>
      <Pressable onPress={save} accessibilityRole="button" style={styles.save}><Text style={styles.saveText}>Save changes  ✓</Text></Pressable>
      <Pressable onPress={cancel} accessibilityRole="button" style={styles.cancel}><Text style={styles.cancelText}>Cancel changes</Text></Pressable>
    </CustomerShell>
  );
}

const styles = StyleSheet.create({
  avatarCard: { borderRadius: 26, borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, alignItems: 'center', padding: 22, overflow: 'hidden' },
  avatarAccent: { width: 190, height: 190, backgroundColor: '#E8F8F5', borderRadius: 100, position: 'absolute', right: -55, top: -90 },
  avatarTitle: { color: c.navy, fontSize: 17, fontWeight: '900', marginTop: 11 },
  avatarHelp: { color: c.muted, fontSize: 12, textAlign: 'center', marginTop: 5 },
  swatches: { flexDirection: 'row', gap: 13, marginTop: 17 },
  swatchOutline: { height: 44, width: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  swatchSelected: { borderColor: c.tealDark },
  swatch: { height: 34, width: 34, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  swatchDot: { height: 12, width: 12, borderRadius: 6 },
  avatarSmallNote: { color: c.muted, fontSize: 10, lineHeight: 15, marginTop: 12, textAlign: 'center' },
  formCard: { borderWidth: 1, borderColor: c.border, backgroundColor: c.surface, borderRadius: 23, padding: 17 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { color: c.navy, fontSize: 12, fontWeight: '800', marginBottom: 8 },
  field: { borderWidth: 1, borderColor: '#DCE8E9', backgroundColor: '#FBFDFD', borderRadius: 14, paddingHorizontal: 14, height: 51, color: c.navy, fontSize: 14 },
  fieldMultiline: { height: 95, paddingTop: 13, paddingBottom: 12 },
  fieldInvalid: { borderColor: '#E28C94', backgroundColor: '#FFF9F9' },
  fieldHint: { color: c.muted, fontSize: 10, lineHeight: 16, marginTop: 6 },
  errorText: { color: c.danger, fontSize: 11, marginTop: 5, lineHeight: 16 },
  addressHint: { color: c.muted, fontSize: 10, lineHeight: 16, marginTop: -5 },
  errorPanel: { marginTop: 16, backgroundColor: '#FFF0F1', padding: 13, borderRadius: 14, borderWidth: 1, borderColor: '#F3C8CC' },
  errorPanelText: { color: c.danger, fontSize: 12, fontWeight: '700' },
  save: { marginTop: 18, height: 54, backgroundColor: c.teal, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  saveText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },
  cancel: { marginTop: 11, height: 48, justifyContent: 'center', alignItems: 'center' },
  cancelText: { color: c.muted, fontSize: 13, fontWeight: '800' },
});
