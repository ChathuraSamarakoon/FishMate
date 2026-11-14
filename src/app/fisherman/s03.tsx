import { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

// Available photo presets for pickers
const fisherman1 = require('../../../assets/customer/fisherman_1.jpg');
const fisherman2 = require('../../../assets/customer/fisherman_2.jpg');
const shop1 = require('../../../assets/customer/shop_1.jpg');
const shop2 = require('../../../assets/customer/shop_2.jpg');
const tuna = require('../../../assets/customer/tuna.jpg');
const redSnapper = require('../../../assets/customer/red_snapper.jpg');
const prawns = require('../../../assets/customer/prawns.jpg');
const blueCrab = require('../../../assets/customer/blue_crab.jpg');

const PROFILE_PHOTO_PRESETS = [
  { id: 'p1', label: 'Sunil (Master Fisherman)', source: fisherman1 },
  { id: 'p2', label: 'Kasun (Landing Specialist)', source: fisherman2 },
];

const SHOP_PHOTO_PRESETS = [
  { id: 's1', label: 'Harbor Stall & Display', source: shop1 },
  { id: 's2', label: 'Cold Storage & Ice Basin', source: shop2 },
  { id: 's3', label: 'Yellowfin Tuna Crate', source: tuna },
  { id: 's4', label: 'Red Snapper Landing Box', source: redSnapper },
  { id: 's5', label: 'Jumbo Sea Prawns Crushed Ice', source: prawns },
  { id: 's6', label: 'Lagoon Blue Crab Basin', source: blueCrab },
];

const POPULAR_VILLAGES = [
  'Negombo Fish Harbor',
  'Weligama Landing Site',
  'Chilaw Harbor',
  'Kalpitiya Pier',
  'Beruwala Fisheries Harbor',
  'Galle Harbor Pier',
];

const POPULAR_SPECIALTIES = [
  'Yellowfin tuna',
  'Red snapper',
  'Sea prawns',
  'King mackerel',
  'Blue crab',
  'Cleaned fillets',
  'Sailfish / Thalapath',
  'Jumbo cuttlefish',
  'Mud crab',
  'Seer fish',
  'Same-day chilled',
];

export default function S03EditProfileScreen() {
  const { profile, updateProfile } = useFisherman();

  // 03. EXISTING VALUES PREFILLED
  const [name, setName] = useState(profile.name);
  const [contactNumber, setContactNumber] = useState(profile.contactNumber);
  const [village, setVillage] = useState(profile.village);
  const [title, setTitle] = useState(profile.title);
  const [bio, setBio] = useState(profile.bio);
  const [boatName, setBoatName] = useState(profile.boatName ?? 'Sagara Rani II');
  const [registrationNumber, setRegistrationNumber] = useState(
    profile.registrationNumber ?? 'CFV-A-4198-NEG',
  );
  const [specialties, setSpecialties] = useState<string[]>(profile.specialties ?? []);
  const [avatar, setAvatar] = useState<any>(profile.avatar);
  const [shopImages, setShopImages] = useState<any[]>(profile.shopImages ?? [shop1, shop2]);

  // Validation state
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');

  // Picker modals state
  const [profilePickerVisible, setProfilePickerVisible] = useState(false);
  const [shopPickerVisible, setShopPickerVisible] = useState(false);

  // Check if anything was modified
  const isDirty =
    name !== profile.name ||
    contactNumber !== profile.contactNumber ||
    village !== profile.village ||
    title !== profile.title ||
    bio !== profile.bio ||
    boatName !== (profile.boatName ?? 'Sagara Rani II') ||
    registrationNumber !== (profile.registrationNumber ?? 'CFV-A-4198-NEG') ||
    avatar !== profile.avatar ||
    shopImages.length !== (profile.shopImages?.length ?? 0) ||
    JSON.stringify(specialties) !== JSON.stringify(profile.specialties);

  // 03. VALIDATION FUNCTIONS
  const validateName = (val: string): boolean => {
    const trimmed = val.trim();
    if (!trimmed) {
      setNameError('Full Name is required.');
      return false;
    }
    if (trimmed.length < 2) {
      setNameError('Full Name must be at least 2 characters.');
      return false;
    }
    setNameError('');
    return true;
  };

  const validatePhone = (val: string): boolean => {
    const cleaned = val.replace(/[\s-]/g, '');
    if (!cleaned) {
      setPhoneError('Contact Number is required.');
      return false;
    }
    // Sri Lanka phone format check: 07XXXXXXXX or +947XXXXXXXX or 9-11 digits
    const phoneRegex = /^(?:0|\+?94)?[1-9][0-9]{7,9}$/;
    if (!phoneRegex.test(cleaned)) {
      setPhoneError('Enter a valid phone number (e.g. 071 234 5678).');
      return false;
    }
    setPhoneError('');
    return true;
  };

  // MULTI-SELECT FISH TYPES
  const toggleSpecialty = (spec: string) => {
    setSpecialties((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec],
    );
  };

  // 03. IMAGE PREVIEW / REMOVE (PROFILE PHOTO)
  const handleRemoveAvatar = () => {
    Alert.alert('Remove Profile Photo', 'Are you sure you want to remove your profile photo?', [
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => setAvatar(null),
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // 03. IMAGE PREVIEW / REMOVE (SHOP PHOTOS)
  const handleRemoveShopImage = (indexToRemove: number) => {
    Alert.alert('Remove Shop Photo', 'Remove this image from your storefront gallery?', [
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setShopImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleAddShopImage = (preset: any) => {
    setShopImages((prev) => [...prev, preset.source]);
    setShopPickerVisible(false);
  };

  // 02. SAVE CHANGES -> S02
  const handleSave = () => {
    const isNameValid = validateName(name);
    const isPhoneValid = validatePhone(contactNumber);

    if (!isNameValid || !isPhoneValid) {
      Alert.alert('Validation Error', 'Please correct the highlighted fields before saving.');
      return;
    }

    if (specialties.length === 0) {
      Alert.alert('Fish Types Required', 'Please select at least one fish type sold by your storefront.');
      return;
    }

    updateProfile({
      name: name.trim(),
      contactNumber: contactNumber.trim(),
      village: village.trim() || 'Negombo Fish Harbor',
      title: title.trim(),
      bio: bio.trim(),
      boatName: boatName.trim(),
      registrationNumber: registrationNumber.trim(),
      specialties,
      avatar: avatar ?? fisherman1,
      shopImages: shopImages.length > 0 ? shopImages : [shop1],
    });

    Alert.alert(
      'Profile Updated! (S03)',
      'Your storefront details, contact number, fish types, and photos have been successfully updated.',
      [
        {
          text: 'Return to Profile (S02)',
          onPress: () => router.replace('/fisherman/profile'),
        },
      ],
    );
  };

  // 02. CANCEL -> S02
  const handleCancel = () => {
    if (isDirty) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved edits. Are you sure you want to discard them and return to your profile?',
        [
          {
            text: 'Discard & Exit',
            style: 'destructive',
            onPress: () => router.replace('/fisherman/profile'),
          },
          { text: 'Keep Editing', style: 'cancel' },
        ],
      );
    } else {
      router.replace('/fisherman/profile');
    }
  };

  return (
    <FishermanShell
      title="S03 · Edit Profile"
      subtitle="Update credentials, photos & fish types"
      back
      onBack={handleCancel}
      rightIcon="check"
      rightLabel="Save Changes"
      onRightPress={handleSave}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S03</Text>
        </View>
        <Text style={styles.helperText}>Storefront profile, photo pickers & catch varieties</Text>
      </View>

      {/* 01. PROFILE PHOTO PICKER & PREVIEW */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>01. Profile Photo Picker</Text>
        <Text style={styles.cardSub}>
          Your primary vendor portrait displayed on customer search and store header:
        </Text>

        <View style={styles.profilePickerRow}>
          <View style={styles.avatarPreviewWrap}>
            {avatar ? (
              <Image source={avatar} style={styles.avatarPreview} resizeMode="cover" />
            ) : (
              <View style={styles.emptyAvatarBox}>
                <FishermanIcon name="user" size={32} color={ui.muted} />
                <Text style={styles.emptyAvatarText}>No Photo</Text>
              </View>
            )}
            {avatar && (
              <View style={styles.avatarVerifiedDot}>
                <FishermanIcon name="check" size={10} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.avatarActionsCol}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setProfilePickerVisible(true)}
              style={styles.choosePhotoBtn}
            >
              <FishermanIcon name="sparkles" size={14} color="#FFFFFF" />
              <Text style={styles.choosePhotoText}>
                {avatar ? 'Change Photo' : 'Select Photo'}
              </Text>
            </Pressable>

            {avatar ? (
              <Pressable
                accessibilityRole="button"
                onPress={handleRemoveAvatar}
                style={styles.removePhotoBtn}
              >
                <Text style={styles.removePhotoText}>✕ Remove Photo</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      {/* 01. BASIC CONTACT INFORMATION */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>02. Personal & Contact Information</Text>

        {/* FULL NAME */}
        <Text style={styles.inputLabel}>Full Name / Business Name *</Text>
        <TextInput
          value={name}
          onChangeText={(val) => {
            setName(val);
            if (nameError) validateName(val);
          }}
          onBlur={() => validateName(name)}
          placeholder="e.g. Sunil Perera"
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, nameError ? styles.inputError : null]}
        />
        {nameError ? <Text style={styles.errorText}>⚠ {nameError}</Text> : null}

        {/* CONTACT NUMBER */}
        <Text style={styles.inputLabel}>Contact Phone Number *</Text>
        <TextInput
          value={contactNumber}
          onChangeText={(val) => {
            setContactNumber(val);
            if (phoneError) validatePhone(val);
          }}
          onBlur={() => validatePhone(contactNumber)}
          keyboardType="phone-pad"
          placeholder="e.g. 071 234 5678"
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, phoneError ? styles.inputError : null]}
        />
        {phoneError ? <Text style={styles.errorText}>⚠ {phoneError}</Text> : null}

        {/* VILLAGE */}
        <Text style={styles.inputLabel}>Harbor Village / Region *</Text>
        <TextInput
          value={village}
          onChangeText={setVillage}
          placeholder="e.g. Negombo Fish Harbor"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        {/* QUICK VILLAGE CHIPS */}
        <Text style={styles.inputHelp}>Or select a major fishing harbor:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.villageChipsScroll}
        >
          {POPULAR_VILLAGES.map((v) => {
            const selected = village === v;
            return (
              <Pressable
                key={v}
                accessibilityRole="button"
                onPress={() => setVillage(v)}
                style={[styles.villageChip, selected && styles.villageChipActive]}
              >
                <Text
                  style={[styles.villageChipText, selected && styles.villageChipTextActive]}
                >
                  📍 {v}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* PROFESSIONAL TITLE */}
        <Text style={styles.inputLabel}>Professional Role / Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Master Fisherman & Harbor Supplier"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        {/* BIO */}
        <Text style={styles.inputLabel}>Storefront Bio & Catch Announcement</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          placeholder="Describe your catch fresh landing, boat origin & cleaning services..."
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, styles.textArea]}
        />
      </View>

      {/* 01. FISH TYPES (MULTI-SELECT) */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeading}>03. Fish Types Sold</Text>
          <View style={styles.selectedCountBadge}>
            <Text style={styles.selectedCountText}>{specialties.length} Selected</Text>
          </View>
        </View>
        <Text style={styles.cardSub}>
          Multi-select all fresh fish and seafood varieties available on your storefront:
        </Text>

        <View style={styles.specialtiesGrid}>
          {POPULAR_SPECIALTIES.map((spec) => {
            const isSelected = specialties.includes(spec);
            return (
              <Pressable
                key={spec}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => toggleSpecialty(spec)}
                style={[styles.specialtyChip, isSelected && styles.specialtyChipSelected]}
              >
                <Text
                  style={[
                    styles.specialtyChipText,
                    isSelected && styles.specialtyChipTextSelected,
                  ]}
                >
                  {isSelected ? '✓ ' : '+ '}
                  {spec}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 01. SHOP PHOTOS PICKER & REMOVE */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeading}>04. Shop & Harbor Photos</Text>
          <View style={styles.selectedCountBadge}>
            <Text style={styles.selectedCountText}>{shopImages.length} Photos</Text>
          </View>
        </View>
        <Text style={styles.cardSub}>
          Display your harbor berth, cold storage crates, stall and fish displays:
        </Text>

        {/* SHOP PHOTOS PREVIEWS WITH REMOVE (✕) BUTTON */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shopGalleryScroll}
        >
          {shopImages.map((img, index) => (
            <View key={index} style={styles.shopThumbnailCard}>
              <Image source={img} style={styles.shopThumbnailImg} resizeMode="cover" />

              {/* REMOVE BUTTON (✕) */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove shop photo ${index + 1}`}
                onPress={() => handleRemoveShopImage(index)}
                style={styles.deletePhotoBtn}
              >
                <Text style={styles.deletePhotoBtnText}>✕</Text>
              </Pressable>

              <View style={styles.photoIndexBadge}>
                <Text style={styles.photoIndexText}>#{index + 1}</Text>
              </View>
            </View>
          ))}

          {/* ADD SHOP PHOTO BUTTON */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add shop photo"
            onPress={() => setShopPickerVisible(true)}
            style={styles.addShopPhotoCard}
          >
            <View style={styles.addPhotoIconCircle}>
              <FishermanIcon name="plus" size={18} color={ui.tealDark} />
            </View>
            <Text style={styles.addPhotoLabel}>+ Add Photo</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* BOAT & HARBOR CREDENTIALS */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>05. Vessel & Registration</Text>

        <Text style={styles.inputLabel}>Fishing Vessel (Boat Name)</Text>
        <TextInput
          value={boatName}
          onChangeText={setBoatName}
          placeholder="e.g. Sagara Rani II"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Harbor Registration Number</Text>
        <TextInput
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
          placeholder="e.g. CFV-A-4198-NEG"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />
      </View>

      {/* 02. ACTION BUTTONS: SAVE CHANGES & CANCEL -> S02 */}
      <View style={styles.actionsBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save Changes to Profile (S02)"
          onPress={handleSave}
          style={styles.saveBtn}
        >
          <FishermanIcon name="check" size={17} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Changes (S02)</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel and return to Profile (S02)"
          onPress={handleCancel}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel (S02)</Text>
        </Pressable>
      </View>

      {/* PROFILE PHOTO PICKER MODAL */}
      <Modal
        visible={profilePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfilePickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setProfilePickerVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose Profile Photo</Text>
            <Text style={styles.modalSub}>
              Select a verified fisherman portrait for your storefront:
            </Text>

            <View style={styles.modalPresetsRow}>
              {PROFILE_PHOTO_PRESETS.map((preset) => (
                <Pressable
                  key={preset.id}
                  accessibilityRole="button"
                  onPress={() => {
                    setAvatar(preset.source);
                    setProfilePickerVisible(false);
                  }}
                  style={styles.presetAvatarCard}
                >
                  <Image
                    source={preset.source}
                    style={styles.presetAvatarImg}
                    resizeMode="cover"
                  />
                  <Text numberOfLines={2} style={styles.presetAvatarLabel}>
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => setProfilePickerVisible(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* SHOP PHOTOS PICKER MODAL */}
      <Modal
        visible={shopPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setShopPickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShopPickerVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Shop / Harbor Photo</Text>
            <Text style={styles.modalSub}>
              Choose from sample harbor landing, stall and cold crate photos:
            </Text>

            <ScrollView contentContainerStyle={styles.shopPresetsGrid}>
              {SHOP_PHOTO_PRESETS.map((preset) => (
                <Pressable
                  key={preset.id}
                  accessibilityRole="button"
                  onPress={() => handleAddShopImage(preset)}
                  style={styles.presetShopItem}
                >
                  <Image
                    source={preset.source}
                    style={styles.presetShopImg}
                    resizeMode="cover"
                  />
                  <Text numberOfLines={1} style={styles.presetShopLabel}>
                    {preset.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            <Pressable
              accessibilityRole="button"
              onPress={() => setShopPickerVisible(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  screenTag: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  screenTagText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.8,
  },
  helperText: {
    fontSize: 11,
    color: ui.muted,
    flex: 1,
  },
  card: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 16,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeading: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  cardSub: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 16,
    marginTop: 2,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCountBadge: {
    backgroundColor: ui.tealLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  selectedCountText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.tealDark,
  },
  profilePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarPreviewWrap: {
    position: 'relative',
  },
  avatarPreview: {
    width: 82,
    height: 82,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: ui.tealLight,
  },
  emptyAvatarBox: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: '#F0F5F7',
    borderWidth: 2,
    borderColor: '#D4E2E6',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyAvatarText: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.muted,
    marginTop: 2,
  },
  avatarVerifiedDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: ui.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarActionsCol: {
    flex: 1,
    gap: 8,
  },
  choosePhotoBtn: {
    backgroundColor: ui.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  choosePhotoText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  removePhotoBtn: {
    backgroundColor: '#FFF0F2',
    borderWidth: 1,
    borderColor: '#F8CCD2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  removePhotoText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.danger,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#F7FAFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 13,
    color: ui.navy,
    fontWeight: '600',
  },
  inputError: {
    borderColor: ui.danger,
    backgroundColor: '#FFF7F8',
  },
  errorText: {
    fontSize: 11,
    fontWeight: '700',
    color: ui.danger,
    marginTop: 4,
  },
  inputHelp: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 6,
  },
  villageChipsScroll: {
    gap: 6,
    paddingBottom: 4,
  },
  villageChip: {
    backgroundColor: '#F5FAF9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D4ECE7',
  },
  villageChipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  villageChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  villageChipTextActive: {
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 72,
    textAlignVertical: 'top',
  },
  specialtiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyChip: {
    backgroundColor: '#F5FAF9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4ECE7',
  },
  specialtyChipSelected: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  specialtyChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  specialtyChipTextSelected: {
    color: '#FFFFFF',
  },
  shopGalleryScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  shopThumbnailCard: {
    position: 'relative',
    width: 120,
    height: 90,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EBF4F6',
    borderWidth: 1,
    borderColor: ui.border,
  },
  shopThumbnailImg: {
    width: '100%',
    height: '100%',
  },
  deletePhotoBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(215, 38, 56, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 3,
  },
  deletePhotoBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 14,
  },
  photoIndexBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(6, 63, 80, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  photoIndexText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  addShopPhotoCard: {
    width: 100,
    height: 90,
    borderRadius: 16,
    backgroundColor: '#F5FAF9',
    borderWidth: 2,
    borderColor: '#D0E9E4',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addPhotoIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: ui.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.tealDark,
  },
  actionsBar: {
    gap: 10,
    marginTop: 6,
    marginBottom: 24,
  },
  saveBtn: {
    backgroundColor: ui.teal,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: ui.tealDark,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  cancelBtn: {
    backgroundColor: ui.surface,
    borderRadius: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ui.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: ui.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 30, 40, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: ui.surface,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 20,
    maxHeight: '80%',
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#D0E0E3',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  modalSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
    marginBottom: 16,
  },
  modalPresetsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  presetAvatarCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F7FAFB',
    borderWidth: 1,
    borderColor: ui.border,
  },
  presetAvatarImg: {
    width: 68,
    height: 68,
    borderRadius: 22,
    marginBottom: 8,
  },
  presetAvatarLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    textAlign: 'center',
  },
  shopPresetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 16,
  },
  presetShopItem: {
    width: '48%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F7FAFB',
    borderWidth: 1,
    borderColor: ui.border,
    padding: 6,
  },
  presetShopImg: {
    width: '100%',
    height: 80,
    borderRadius: 10,
  },
  presetShopLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.navy,
    marginTop: 6,
    textAlign: 'center',
  },
  modalCancelBtn: {
    backgroundColor: '#F0F5F7',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '800',
    color: ui.navy,
  },
});
