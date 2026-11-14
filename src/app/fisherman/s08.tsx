import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

const CATEGORY_OPTIONS = [
  'Premium Pelagic',
  'Coastal Catch',
  'Shellfish',
  'Daily Catch',
  'Lagoon Variety',
];

const STOCK_STATUS_OPTIONS: ('Ready stock' | 'Limited stock' | 'Unavailable')[] = [
  'Ready stock',
  'Limited stock',
  'Unavailable',
];

export default function S08EditListingScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { listings, updateListing } = useFisherman();

  const listing = listings.find((l) => l.id === id) || listings[0];

  // Pre-fill existing listing values (Hooks called unconditionally at top)
  const [name, setName] = useState(listing ? listing.name : '');
  const [category, setCategory] = useState(listing ? listing.category : CATEGORY_OPTIONS[0]);
  const [pricePerKg, setPricePerKg] = useState(listing ? listing.price.toString() : '0');
  const [availableKg, setAvailableKg] = useState(
    listing ? (listing.availableKg ?? 10).toString() : '10',
  );
  const [freshness, setFreshness] = useState(listing ? listing.freshness : '');
  const [stockLabel, setStockLabel] = useState<'Ready stock' | 'Limited stock' | 'Unavailable'>(
    listing ? (listing.stockLabel as any) || 'Ready stock' : 'Ready stock',
  );
  const [shortDesc, setShortDesc] = useState(listing ? listing.shortDescription : '');
  const [description, setDescription] = useState(listing ? listing.description : '');

  if (!listing) {
    return (
      <FishermanShell back title="S08 · Edit Catch" subtitle="Catch not found">
        <View style={styles.card}>
          <Text style={styles.notFoundText}>This catch listing does not exist.</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/fisherman/listings')}
            style={styles.saveBtn}
          >
            <Text style={styles.saveBtnText}>Back to Listings</Text>
          </Pressable>
        </View>
      </FishermanShell>
    );
  }

  const priceNum = parseFloat(pricePerKg) || 0;
  const kgNum = parseFloat(availableKg) || 0;
  const batchTotal = priceNum * kgNum;

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Required Field', 'Please enter a fish name.');
      return;
    }
    if (priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price per kg greater than 0.');
      return;
    }
    if (kgNum <= 0) {
      Alert.alert('Invalid Weight', 'Please enter available weight in kg.');
      return;
    }

    updateListing(listing.id, {
      name: name.trim(),
      category,
      price: priceNum,
      availableKg: kgNum,
      weightLabel: `${kgNum} kg available`,
      freshness: freshness.trim(),
      stockLabel,
      shortDescription: shortDesc.trim(),
      description: description.trim(),
    });

    Alert.alert(
      'Listing Updated! (S08)',
      `${name} has been updated with ${kgNum} kg at ${money(priceNum)}/kg (Total: ${money(batchTotal)}).\n\nChanges are now live in your listings and customer view.`,
      [
        {
          text: 'View in My Catch',
          onPress: () => router.replace('/fisherman/listings'),
        },
      ],
    );
  };

  const handleCancel = () => {
    router.replace('/fisherman/listings');
  };

  return (
    <FishermanShell
      title="S08 · Edit Catch"
      subtitle={`Edit ${listing.name} details`}
      back
      onBack={handleCancel}
      rightIcon="check"
      rightLabel="Save"
      onRightPress={handleSave}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S08</Text>
        </View>
        <Text style={styles.helperText}>Edit price, available kilograms & stock availability</Text>
      </View>

      {/* FISH HEADER WITH THUMBNAIL */}
      <View style={styles.headerCard}>
        <Image source={listing.image} style={styles.headerImg} resizeMode="cover" />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text numberOfLines={1} style={styles.headerName}>{name || 'Fish Name'}</Text>
          <Text style={styles.headerCategory}>{category}</Text>
          <Text style={styles.batchValueText}>
            Batch Value: <Text style={{ color: ui.tealDark, fontWeight: '900' }}>{money(batchTotal)}</Text>
          </Text>
        </View>
      </View>

      {/* FORM SECTION: SPECIES & CATEGORY */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Fish Species & Category</Text>

        <Text style={styles.inputLabel}>Fish Name (Species) *</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Yellowfin Tuna (කෙළවල්ලා)"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Seafood Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORY_OPTIONS.map((cat) => {
            const isSelected = category === cat;
            return (
              <Pressable
                key={cat}
                accessibilityRole="button"
                onPress={() => setCategory(cat)}
                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* PRICING & QUANTITY */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Pricing & Stock Quantity</Text>

        <View style={styles.rowInputs}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Price Per Kg (Rs.) *</Text>
            <TextInput
              value={pricePerKg}
              onChangeText={setPricePerKg}
              keyboardType="numeric"
              placeholder="4200"
              placeholderTextColor={ui.mutedLight}
              style={styles.input}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Available Weight (kg) *</Text>
            <TextInput
              value={availableKg}
              onChangeText={setAvailableKg}
              keyboardType="numeric"
              placeholder="10"
              placeholderTextColor={ui.mutedLight}
              style={styles.input}
            />
          </View>
        </View>

        {/* AVAILABILITY STATUS SELECTOR */}
        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Availability Status</Text>
        <View style={styles.statusOptionsRow}>
          {STOCK_STATUS_OPTIONS.map((status) => {
            const active = stockLabel === status;
            return (
              <Pressable
                key={status}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                onPress={() => setStockLabel(status)}
                style={[
                  styles.statusOptionChip,
                  active && styles.statusOptionChipActive,
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    status === 'Ready stock'
                      ? styles.dotReady
                      : status === 'Limited stock'
                      ? styles.dotLimited
                      : styles.dotUnavailable,
                  ]}
                />
                <Text
                  style={[
                    styles.statusOptionText,
                    active && styles.statusOptionTextActive,
                  ]}
                >
                  {status}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* FRESHNESS & PREPARATION NOTES */}
      <View style={styles.card}>
        <Text style={styles.cardHeading}>Freshness & Landed Notes</Text>

        <Text style={styles.inputLabel}>Freshness Tagline</Text>
        <TextInput
          value={freshness}
          onChangeText={setFreshness}
          placeholder="e.g. Landed 1 hr ago at Negombo Pier"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Preparation Options / Cuts Summary</Text>
        <TextInput
          value={shortDesc}
          onChangeText={setShortDesc}
          placeholder="e.g. Cleaned & Gutted · Steak Cuts · Chilled on ice"
          placeholderTextColor={ui.mutedLight}
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Customer Description & Storage Notes</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          placeholder="Detailed notes regarding boat catch, cold storage & handling..."
          placeholderTextColor={ui.mutedLight}
          style={[styles.input, styles.textArea]}
        />
      </View>

      {/* ACTIONS BAR */}
      <View style={styles.actionsBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save Changes to Listing (S08)"
          onPress={handleSave}
          style={styles.saveBtn}
        >
          <FishermanIcon name="check" size={17} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Save Changes (S08)</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cancel and return to Listings"
          onPress={handleCancel}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </Pressable>
      </View>
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
  headerCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: ui.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
    shadowColor: ui.shadow,
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerImg: {
    width: 68,
    height: 68,
    borderRadius: 16,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  headerCategory: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  batchValueText: {
    fontSize: 11,
    color: ui.navy,
    marginTop: 4,
  },
  card: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
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
    marginBottom: 6,
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
  textArea: {
    minHeight: 68,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  categoryScroll: {
    gap: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  categoryChip: {
    backgroundColor: '#F5FAF9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4ECE7',
  },
  categoryChipSelected: {
    backgroundColor: ui.teal,
    borderColor: ui.tealDark,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  statusOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusOptionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: '#F7FAFB',
    borderWidth: 1,
    borderColor: ui.border,
  },
  statusOptionChipActive: {
    backgroundColor: '#E8F5F4',
    borderColor: ui.tealDark,
  },
  statusOptionText: {
    fontSize: 10,
    fontWeight: '800',
    color: ui.muted,
  },
  statusOptionTextActive: {
    color: ui.navy,
    fontWeight: '900',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotReady: {
    backgroundColor: ui.success,
  },
  dotLimited: {
    backgroundColor: ui.warning,
  },
  dotUnavailable: {
    backgroundColor: ui.danger,
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
  notFoundText: {
    fontSize: 14,
    fontWeight: '700',
    color: ui.muted,
    marginBottom: 14,
  },
});
