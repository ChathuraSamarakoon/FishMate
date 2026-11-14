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
import { router } from 'expo-router';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { useFisherman } from '@/components/fisherman/FishermanContext';

const SPECIES_PRESETS = [
  { id: 'tuna', name: 'Yellowfin Tuna (කෙළවල්ලා)', price: 4200, category: 'Premium Pelagic', img: require('../../../assets/customer/tuna.jpg') },
  { id: 'snapper', name: 'Red Snapper (තම්බලයා)', price: 3150, category: 'Coastal Catch', img: require('../../../assets/customer/red_snapper.jpg') },
  { id: 'prawns', name: 'Jumbo Prawns (ඉස්සෝ)', price: 3650, category: 'Shellfish', img: require('../../../assets/customer/prawns.jpg') },
  { id: 'mackerel', name: 'King Mackerel (තෝරා)', price: 2600, category: 'Daily Catch', img: require('../../../assets/customer/mackerel.jpg') },
  { id: 'crab', name: 'Blue Crab (කකුළුවෝ)', price: 2950, category: 'Shellfish', img: require('../../../assets/customer/blue_crab.jpg') },
];

const PREPARATION_OPTIONS = [
  'Whole Fish on Ice',
  'Cleaned & Gutted',
  'Steak Cut Packs',
  'De-boned Fillets',
];

export default function S06AddFishScreen() {
  const { addListing } = useFisherman();
  const [selectedSpecies, setSelectedSpecies] = useState(SPECIES_PRESETS[0]);
  const [weightKg, setWeightKg] = useState('8.5');
  const [pricePerKg, setPricePerKg] = useState(SPECIES_PRESETS[0].price.toString());
  const [freshness, setFreshness] = useState('Landed 1 hr ago at Negombo');
  const [selectedPrep, setSelectedPrep] = useState<string[]>([PREPARATION_OPTIONS[0], PREPARATION_OPTIONS[1]]);
  const [notes, setNotes] = useState('Kept on clean crushed ice, direct from Sagara Rani II boat landing.');

  const weightNum = parseFloat(weightKg) || 0;
  const priceNum = parseFloat(pricePerKg) || 0;
  const totalValue = weightNum * priceNum;

  const togglePrep = (prep: string) => {
    setSelectedPrep((prev) =>
      prev.includes(prep) ? prev.filter((p) => p !== prep) : [...prev, prep],
    );
  };

  const handlePublish = () => {
    if (weightNum <= 0) {
      Alert.alert('Invalid Weight', 'Please specify available catch weight in KG.');
      return;
    }
    if (priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price per KG.');
      return;
    }

    addListing({
      id: `listing-${Date.now()}`,
      name: selectedSpecies.name,
      category: selectedSpecies.category,
      shortDescription: `${selectedPrep.join(', ')} · ${freshness}`,
      description: notes,
      price: priceNum,
      unit: '/kg',
      weightLabel: `${weightNum} kg available`,
      availableKg: weightNum,
      stockLabel: 'Ready stock',
      freshness: freshness,
      rating: 5.0,
      reviewCount: 1,
      location: 'Negombo Fish Harbor',
      deliveryEta: '30–45 min',
      distance: 'Negombo Pier',
      image: selectedSpecies.img,
      sellerId: 'fisher-01',
      tags: ['New catch', 'Freshly landed'],
    });

    Alert.alert(
      'Catch Published! (S06)',
      `${weightNum} KG of ${selectedSpecies.name} published at ${money(priceNum)}/kg (Total batch: ${money(totalValue)}).\n\nYour listing is now live and updated on the dashboard cards.`,
      [
        {
          text: 'View in My Catch',
          onPress: () => router.replace('/fisherman/listings'),
        },
        {
          text: 'Back to Dashboard',
          onPress: () => router.replace('/fisherman/dashboard'),
        },
      ],
    );
  };

  return (
    <FishermanShell
      title="S06 · Add Fish Catch"
      subtitle="Publish fresh catch to marketplace"
      back
      rightIcon="check"
      rightLabel="Publish"
      onRightPress={handlePublish}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S06</Text>
        </View>
        <Text style={styles.helperText}>Landed catch inventory publishing</Text>
      </View>

      {/* SPECIES SELECTION */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeading}>1. Select Fish Species</Text>
        <Text style={styles.cardSub}>Choose landed catch variety from today&apos;s haul</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.speciesScroll}
        >
          {SPECIES_PRESETS.map((item) => {
            const isSelected = selectedSpecies.id === item.id;
            return (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                onPress={() => {
                  setSelectedSpecies(item);
                  setPricePerKg(item.price.toString());
                }}
                style={[styles.speciesCard, isSelected && styles.speciesCardSelected]}
              >
                <Image source={item.img} style={styles.speciesImg} resizeMode="cover" />
                <Text numberOfLines={1} style={[styles.speciesName, isSelected && styles.speciesNameSelected]}>
                  {item.name}
                </Text>
                <Text style={styles.speciesPrice}>{money(item.price)}/kg</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* WEIGHT & PRICE */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeading}>2. Quantity & Harbor Price</Text>
        <Text style={styles.cardSub}>Set landing weight and your direct selling price</Text>

        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Available Weight (KG)</Text>
            <View style={styles.stepperContainer}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setWeightKg(Math.max(0.5, weightNum - 1).toFixed(1))}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </Pressable>
              <TextInput
                value={weightKg}
                onChangeText={setWeightKg}
                keyboardType="numeric"
                style={styles.stepperInput}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => setWeightKg((weightNum + 1).toFixed(1))}
                style={styles.stepperBtn}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.inputLabel}>Price / KG (LKR)</Text>
            <View style={styles.priceInputBox}>
              <Text style={styles.currencyPrefix}>Rs.</Text>
              <TextInput
                value={pricePerKg}
                onChangeText={setPricePerKg}
                keyboardType="numeric"
                style={styles.priceInput}
              />
            </View>
          </View>
        </View>

        <View style={styles.batchValueBox}>
          <Text style={styles.batchValueLabel}>Calculated Batch Worth:</Text>
          <Text style={styles.batchValueAmount}>{money(totalValue)}</Text>
        </View>
      </View>

      {/* FRESHNESS & PREPARATION */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeading}>3. Freshness & Prep Options</Text>
        <Text style={styles.cardSub}>Customer options for cuts and storage</Text>

        <Text style={styles.inputLabel}>Landing Time Tag</Text>
        <TextInput
          value={freshness}
          onChangeText={setFreshness}
          style={styles.textInput}
          placeholder="e.g. Landed 30 mins ago, kept on ice"
        />

        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Available Cuts & Cleaning</Text>
        <View style={styles.prepRow}>
          {PREPARATION_OPTIONS.map((prep) => {
            const active = selectedPrep.includes(prep);
            return (
              <Pressable
                key={prep}
                accessibilityRole="button"
                onPress={() => togglePrep(prep)}
                style={[styles.prepChip, active && styles.prepChipActive]}
              >
                <Text style={[styles.prepText, active && styles.prepTextActive]}>
                  {active ? '✓ ' : '+ '}
                  {prep}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.inputLabel, { marginTop: 14 }]}>Seller Note to Buyers</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={2}
          style={[styles.textInput, { minHeight: 60 }]}
          placeholder="Add storage or harbor pickup details"
        />
      </View>

      {/* LIVE MARKETPLACE PREVIEW */}
      <View style={styles.previewCard}>
        <View style={styles.previewHeader}>
          <FishermanIcon name="sparkles" size={16} color={ui.tealDark} />
          <Text style={styles.previewTitle}>Buyer Marketplace Preview (S06)</Text>
        </View>

        <View style={styles.previewContent}>
          <Image source={selectedSpecies.img} style={styles.previewImg} resizeMode="cover" />
          <View style={{ flex: 1 }}>
            <Text style={styles.previewName}>{selectedSpecies.name}</Text>
            <Text style={styles.previewSub}>
              {weightNum} kg available · {freshness}
            </Text>
            <Text style={styles.previewPrice}>
              {money(priceNum)} <Text style={styles.previewUnit}>/ kg</Text>
            </Text>
            <View style={styles.previewBadge}>
              <Text style={styles.previewBadgeText}>Direct from Negombo Harbor</Text>
            </View>
          </View>
        </View>
      </View>

      {/* PUBLISH ACTION BUTTON */}
      <Pressable
        accessibilityRole="button"
        onPress={handlePublish}
        style={styles.publishBtn}
      >
        <FishermanIcon name="check" size={18} color="#FFFFFF" />
        <Text style={styles.publishBtnText}>Publish Catch to Marketplace (S06)</Text>
      </Pressable>
    </FishermanShell>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  screenTag: {
    backgroundColor: ui.tealDark,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  screenTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  helperText: {
    fontSize: 11,
    color: ui.muted,
  },
  sectionCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
    marginBottom: 14,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  cardSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
    marginBottom: 12,
  },
  speciesScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  speciesCard: {
    width: 140,
    padding: 10,
    borderRadius: 16,
    backgroundColor: '#FAFDFD',
    borderWidth: 1.5,
    borderColor: ui.border,
    alignItems: 'center',
  },
  speciesCardSelected: {
    borderColor: ui.teal,
    backgroundColor: ui.tealLight,
  },
  speciesImg: {
    width: 110,
    height: 70,
    borderRadius: 10,
    marginBottom: 8,
  },
  speciesName: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
    textAlign: 'center',
  },
  speciesNameSelected: {
    color: ui.tealDark,
    fontWeight: '900',
  },
  speciesPrice: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
    marginBottom: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ui.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    overflow: 'hidden',
  },
  stepperBtn: {
    width: 38,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ui.softBlue,
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: ui.navy,
  },
  stepperInput: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '900',
    color: ui.navy,
  },
  priceInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ui.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 12,
    height: 44,
  },
  currencyPrefix: {
    fontSize: 13,
    fontWeight: '800',
    color: ui.muted,
    marginRight: 6,
  },
  priceInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    color: ui.navy,
  },
  batchValueBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ui.tealLight,
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  batchValueLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.tealDark,
  },
  batchValueAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
  },
  textInput: {
    backgroundColor: ui.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ui.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: ui.navy,
  },
  prepRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  prepChip: {
    backgroundColor: ui.bg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: ui.border,
  },
  prepChipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.teal,
  },
  prepText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  prepTextActive: {
    color: '#FFFFFF',
  },
  previewCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#CDE5E2',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.tealDark,
    letterSpacing: 0.5,
  },
  previewContent: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  previewImg: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  previewName: {
    fontSize: 14,
    fontWeight: '900',
    color: ui.navy,
  },
  previewSub: {
    fontSize: 11,
    color: ui.muted,
    marginTop: 2,
  },
  previewPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: ui.tealDark,
    marginTop: 4,
  },
  previewUnit: {
    fontSize: 10,
    color: ui.muted,
  },
  previewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: ui.tealLight,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  previewBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: ui.tealDark,
  },
  publishBtn: {
    backgroundColor: ui.teal,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 18,
    shadowColor: ui.teal,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
