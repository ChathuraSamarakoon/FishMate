import { useMemo, useState } from 'react';
import {
  Image,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { FishCard } from '@/components/customer/atoms';
import { CustomerIcon } from '@/components/customer/Icon';
import { customerUi as c } from '@/components/customer/theme';
import { categories, fishListings, getFishermanById } from '@/data/mockData';

type SortMode = 'default' | 'low' | 'high';
const sortOptions: { id: SortMode; label: string; detail: string }[] = [
  { id: 'default', label: 'Featured', detail: 'Discover our handpicked fresh catches' },
  { id: 'low', label: 'Price: Low to high', detail: 'Find the most affordable catches first' },
  { id: 'high', label: 'Price: High to low', detail: 'Browse the highest priced catches first' },
];
const locations = ['All locations', 'Negombo', 'Weligama'];
const categoryImages: Record<string, number> = {
  fish: require('../../../assets/customer/tuna.jpg'),
  shellfish: require('../../../assets/customer/prawns.jpg'),
  premium: require('../../../assets/customer/red_snapper.jpg'),
};
export default function CustomerSearch() {
  const params = useLocalSearchParams<{ category?: string; q?: string }>();
  const insets = useSafeAreaInsets();
  const [picker, setPicker] = useState<'category' | 'location' | 'sort' | null>(null);
  const [query, setQuery] = useState(params.q ?? '');
  const [category, setCategory] = useState(params.category ?? 'all');
  const selectedCategory = categories.find((item) => item.id === category);
  const [location, setLocation] = useState('All locations');
  const [sort, setSort] = useState<SortMode>('default');
  const [availableOnly, setAvailableOnly] = useState(true);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = fishListings.filter((item) => {
      const seller = getFishermanById(item.sellerId);
      const matchesText =
        !q ||
        [item.name, item.category, item.location, seller?.name ?? '', ...item.tags].some((part) =>
          part.toLowerCase().includes(q),
        );
      const matchesCategory =
        category === 'all' ||
        (category === 'fish' && item.category !== 'Shellfish') ||
        (category === 'shellfish' && item.category === 'Shellfish') ||
        (category === 'premium' && item.tags.some((t) => t.toLowerCase().includes('premium')));
      return (
        matchesText &&
        matchesCategory &&
        (location === 'All locations' || item.location === location) &&
        (!availableOnly || item.availableKg > 0)
      );
    });
    if (sort === 'low') return [...filtered].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [query, category, location, sort, availableOnly]);
  const reset = () => {
    setQuery('');
    setCategory('all');
    setLocation('All locations');
    setSort('default');
    setAvailableOnly(true);
  };
  return (
    <CustomerShell
      title="Explore seafood"
      subtitle="Search by fish, seller or location"
      rightIcon="search"
      rightLabel="Reset search"
      onRightPress={reset}
    >
      <View style={styles.searchBar}>
        <CustomerIcon name="search" color={c.tealDark} size={22} />
        <TextInput
          style={styles.input}
          accessibilityLabel="Search fish or fishermen"
          value={query}
          onChangeText={setQuery}
          placeholder="Search tuna, prawns, Negombo..."
          placeholderTextColor="#99AAB0"
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.filterButtons}>
        {(['category', 'location'] as const).map((kind) => (
          <Pressable
            key={kind}
            accessibilityRole="button"
            accessibilityLabel={`${kind === 'category' ? 'Categories' : 'Seller location'}: ${kind === 'category' ? (selectedCategory?.label ?? 'All') : location}. Select filter`}
            accessibilityState={{ expanded: picker === kind }}
            onPress={() => {
              Keyboard.dismiss();
              setPicker(kind);
            }}
            style={({ pressed }) => [styles.filterButton, pressed && styles.pressed]}
          >
            <View style={styles.filterTop}>
              <View style={[styles.filterIcon, kind === 'location' && styles.locationIcon]}>
                <CustomerIcon
                  name={kind === 'category' ? 'filter' : 'pin'}
                  size={21}
                  color={c.tealDark}
                />
              </View>
              <CustomerIcon
                name="chevron-right"
                size={16}
                color={c.tealDark}
                style={{ transform: [{ rotate: '90deg' }] }}
              />
            </View>
            <Text style={styles.filterLabel}>
              {kind === 'category' ? 'Categories' : 'Seller location'}
            </Text>
            <Text numberOfLines={1} style={styles.filterValue}>
              {kind === 'category'
                ? selectedCategory?.label === 'All'
                  ? 'All seafood'
                  : (selectedCategory?.label ?? 'All seafood')
                : location}
            </Text>
          </Pressable>
        ))}
      </View>
      <Modal
        visible={picker !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setPicker(null)}
      >
        <View style={styles.modalRoot}>
          <Pressable
            style={styles.backdrop}
            onPress={() => setPicker(null)}
            accessibilityRole="button"
            accessibilityLabel="Close selection"
          />
          <View
            accessibilityViewIsModal
            style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 20) }]}
          >
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeading}>
                <Text style={styles.sheetEyebrow}>REFINE YOUR CATCH</Text>
                <Text accessibilityRole="header" style={styles.sheetTitle}>
                  {picker === 'category'
                    ? 'Choose a category'
                    : picker === 'sort'
                      ? 'Sort your catches'
                      : 'Choose seller location'}
                </Text>
              </View>
              <Pressable
                onPress={() => setPicker(null)}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close selection"
              >
                <CustomerIcon
                  name="plus"
                  size={21}
                  color={c.navy}
                  style={{ transform: [{ rotate: '45deg' }] }}
                />
              </Pressable>
            </View>
            <Text style={styles.sheetSubtitle}>
              {picker === 'category'
                ? 'Find something fresh for your next meal.'
                : picker === 'sort'
                  ? 'Find your perfect catch in the order you prefer.'
                  : 'Explore fresh catches from your favourite coast.'}
            </Text>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.selectionList}
            >
              {(picker === 'category'
                ? categories.map((item) => ({
                    id: item.id,
                    label: item.id === 'all' ? 'All seafood' : item.label,
                    detail: (
                      {
                        all: 'Explore every fresh catch',
                        fish: 'Fresh fish from local fishermen',
                        shellfish: 'Prawns, crabs and more',
                        premium: 'Something extra special',
                      } as Record<string, string>
                    )[item.id],
                  }))
                : picker === 'sort'
                  ? sortOptions
                  : locations.map((place) => ({
                      id: place,
                      label: place,
                      detail:
                        place === 'All locations'
                          ? 'Fresh finds from every coast'
                          : `Shop catches from ${place}`,
                    }))
              ).map((item) => {
                const selected =
                  (picker === 'category' ? category : picker === 'sort' ? sort : location) ===
                  item.id;
                return (
                  <Pressable
                    key={item.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={item.label}
                    onPress={() => {
                      if (picker === 'category') setCategory(item.id);
                      else if (picker === 'sort') {
                        const option = sortOptions.find((option) => option.id === item.id);
                        if (option) setSort(option.id);
                      } else setLocation(item.id);
                      setPicker(null);
                    }}
                    style={({ pressed }) => [
                      styles.selection,
                      selected && styles.selectionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    {picker === 'category' && categoryImages[item.id] ? (
                      <Image
                        source={categoryImages[item.id]}
                        resizeMode="cover"
                        style={styles.selectionPhoto}
                      />
                    ) : (
                      <View style={[styles.selectionIcon, selected && styles.selectionIconActive]}>
                        <CustomerIcon
                          name={
                            picker === 'category'
                              ? 'sparkles'
                              : picker === 'sort'
                                ? 'filter'
                                : 'pin'
                          }
                          size={22}
                          color={selected ? '#FFFFFF' : c.tealDark}
                        />
                      </View>
                    )}
                    <View style={styles.selectionCopy}>
                      <Text style={styles.selectionLabel}>{item.label}</Text>
                      <Text style={styles.selectionDetail}>{item.detail}</Text>
                    </View>
                    <View style={[styles.radio, selected && styles.radioActive]}>
                      {selected && <CustomerIcon name="check" size={14} color="#FFFFFF" />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text style={styles.sheetFootnote}>Tap an option to update your catches</Text>
          </View>
        </View>
      </Modal>
      <View style={styles.optionsBar}>
        <Pressable
          onPress={() => setAvailableOnly((s) => !s)}
          style={styles.optionLeft}
          accessibilityRole="switch"
          accessibilityState={{ checked: availableOnly }}
        >
          <View style={[styles.checkBox, availableOnly && styles.checkActive]}>
            {availableOnly ? <CustomerIcon name="check" color="#FFFFFF" size={13} /> : null}
          </View>
          <Text style={styles.optionText}>Available now</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Sort by: ${sortOptions.find((option) => option.id === sort)?.label}`}
          accessibilityState={{ expanded: picker === 'sort' }}
          onPress={() => {
            Keyboard.dismiss();
            setPicker('sort');
          }}
          style={({ pressed }) => [styles.sortButton, pressed && styles.pressed]}
        >
          <Text style={styles.sortText}>Sort by</Text>
          <CustomerIcon
            name="chevron-right"
            size={14}
            color={c.tealDark}
            style={{ transform: [{ rotate: '90deg' }] }}
          />
        </Pressable>
      </View>
      <View style={styles.resultsHeading}>
        <Text style={styles.resultTitle}>Fresh catches</Text>
        <Text style={styles.count}>
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </Text>
      </View>
      {results.length ? (
        results.map((item) => (
          <FishCard
            key={item.id}
            item={item}
            variant="row"
            onPress={() => router.push(`/customer/listing/${item.id}` as never)}
          />
        ))
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>⌕</Text>
          <Text style={styles.emptyTitle}>No fish found</Text>
          <Text style={styles.emptyText}>Try another fish name, location or category.</Text>
          <Pressable style={styles.resetButton} onPress={reset}>
            <Text style={styles.resetLabel}>Reset all filters</Text>
          </Pressable>
        </View>
      )}
      <Text style={styles.demoNote}>
        Sample data only · Availability, delivery estimates and prices are illustrative.
      </Text>
    </CustomerShell>
  );
}
const styles = StyleSheet.create({
  searchBar: {
    height: 57,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 13, color: c.navy, minWidth: 0 },
  clear: { fontSize: 17, color: c.muted, padding: 6 },
  filterButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  filterButton: {
    flex: 1,
    minWidth: 0,
    padding: 15,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#CDE7E6',
    backgroundColor: c.surface,
    shadowColor: c.tealDark,
    shadowOpacity: 0.07,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  pressed: { opacity: 0.75 },
  filterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterIcon: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDF7F2',
  },
  locationIcon: { backgroundColor: '#E7F3FC' },
  filterLabel: { color: c.navy, fontSize: 13, fontWeight: '800' },
  filterValue: { color: c.tealDark, fontSize: 12, fontWeight: '600', marginTop: 5 },
  modalRoot: { flex: 1, justifyContent: 'flex-end', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(7, 34, 48, 0.48)' },
  sheet: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '85%',
    backgroundColor: c.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#C7DDDF',
    alignSelf: 'center',
    marginBottom: 21,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sheetHeading: { flex: 1 },
  sheetEyebrow: {
    color: c.tealDark,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.8,
    marginBottom: 7,
  },
  sheetTitle: { color: c.navy, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: '#E5EFEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetSubtitle: { color: c.muted, fontSize: 12, lineHeight: 18, marginTop: 9, marginBottom: 20 },
  selectionList: { gap: 10, paddingBottom: 4 },
  selection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    padding: 14,
    minHeight: 76,
    borderRadius: 19,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.border,
  },
  selectionActive: { backgroundColor: '#E7F8F3', borderColor: c.teal },
  selectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: c.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionIconActive: { backgroundColor: c.teal },
  selectionPhoto: { width: 52, height: 52, borderRadius: 15 },
  selectionCopy: { flex: 1 },
  selectionLabel: { color: c.navy, fontSize: 14, fontWeight: '800' },
  selectionDetail: { color: c.muted, fontSize: 11, lineHeight: 16, marginTop: 4 },
  radio: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C5DCDC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { backgroundColor: c.teal, borderColor: c.teal },
  sheetFootnote: {
    textAlign: 'center',
    color: c.muted,
    fontSize: 11,
    marginTop: 18,
    marginBottom: 5,
  },
  optionsBar: {
    marginTop: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  checkBox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ABCACB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: { backgroundColor: c.teal, borderColor: c.teal },
  optionText: { color: c.navy, fontSize: 11, fontWeight: '700' },
  sortButton: {
    minHeight: 44,
    minWidth: 104,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    backgroundColor: c.surface,
  },
  sortText: { fontSize: 10, fontWeight: '800', color: c.tealDark },
  resultsHeading: {
    marginTop: 25,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultTitle: { fontSize: 19, fontWeight: '900', color: c.navy },
  count: { color: c.muted, fontSize: 12, fontWeight: '700' },
  empty: {
    minHeight: 210,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    backgroundColor: c.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: c.border,
  },
  emptyIcon: { fontSize: 38, color: c.tealDark },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: c.navy, marginTop: 6 },
  emptyText: { fontSize: 12, color: c.muted, marginTop: 8 },
  resetButton: {
    backgroundColor: c.teal,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 15,
  },
  resetLabel: { fontSize: 12, fontWeight: '900', color: '#FFFFFF' },
  demoNote: { textAlign: 'center', fontSize: 10, color: c.muted, marginTop: 12 },
});
