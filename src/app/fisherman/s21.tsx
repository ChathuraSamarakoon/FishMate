import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FishermanShell } from '@/components/fisherman/FishermanShell';
import { FishermanIcon } from '@/components/fisherman/FishermanIcon';
import { SectionHeader, money } from '@/components/fisherman/atoms';
import { fishermanUi as ui } from '@/components/fisherman/theme';
import { defaultFishermanSummary } from '@/data/fishermanData';

const PERIODS = ['This Week', 'This Month', 'Last Month', 'Season 2024'];

const WEEKLY_STATS = [
  { week: 'Week 1 (Nov 1–7)', revenue: 58000, cost: 19800, profit: 38200 },
  { week: 'Week 2 (Nov 8–14)', revenue: 64500, cost: 22400, profit: 42100 },
  { week: 'Week 3 (Nov 15–21)', revenue: 62000, cost: 21500, profit: 40500 },
  { week: 'Week 4 (Current)', revenue: 64000, cost: 22600, profit: 41400 },
];

export default function S21FinancialSummaryScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[1]);
  const s = defaultFishermanSummary;
  const totalCost = s.fuelCost + s.iceBaitCost + s.harborFee;

  const handleExport = () => {
    Alert.alert(
      'Export Financial Statement (S21)',
      `Generating monthly harbor sales and expense statement for Sunil Perera (${s.monthlyRevenue.toLocaleString()} LKR gross revenue).\n\nPDF statement exported to documents.`,
      [{ text: 'OK' }],
    );
  };

  return (
    <FishermanShell
      title="S21 · Financial Summary"
      subtitle="Revenue analytics & net earnings report"
      back
      rightIcon="sparkles"
      rightLabel="Export"
      onRightPress={handleExport}
    >
      <View style={styles.badgeRow}>
        <View style={styles.screenTag}>
          <Text style={styles.screenTagText}>SCREEN S21</Text>
        </View>
        <Text style={styles.helperText}>Harbor revenue, operational deductions & net profit</Text>
      </View>

      {/* PERIOD TABS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.periodScroll}
      >
        {PERIODS.map((period) => {
          const active = selectedPeriod === period;
          return (
            <Pressable
              key={period}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setSelectedPeriod(period)}
              style={[styles.periodChip, active && styles.periodChipActive]}
            >
              <Text style={[styles.periodText, active && styles.periodTextActive]}>
                {period}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* MAIN FINANCIAL CARDS */}
      <View style={styles.heroFinanceCard}>
        <View style={styles.heroTop}>
          <View>
            <Text style={styles.heroEyebrow}>NET EARNINGS (PROFIT)</Text>
            <Text style={styles.heroMainAmount}>{money(s.estimatedProfit)}</Text>
          </View>
          <View style={styles.marginPill}>
            <Text style={styles.marginPillText}>{s.profitMarginPercent}% Net Margin</Text>
          </View>
        </View>

        <Text style={styles.heroSub}>
          Take-home profit after all diesel, bait, ice crates, and harbor landing taxes are deducted.
        </Text>

        <View style={styles.heroDivider} />

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>Gross Catch Sales</Text>
            <Text style={styles.heroStatValue}>{money(s.monthlyRevenue)}</Text>
            <Text style={styles.growthText}>▲ +{s.revenueGrowthPercent}%</Text>
          </View>

          <View style={styles.heroStatDivider} />

          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatLabel}>Total Voyage Costs</Text>
            <Text style={[styles.heroStatValue, { color: ui.danger }]}>
              − {money(totalCost)}
            </Text>
            <Text style={styles.expenseRatioText}>34.7% of gross</Text>
          </View>
        </View>
      </View>

      {/* EXPENSE DEDUCTION BREAKDOWN */}
      <SectionHeader
        title="Cost Deductions Breakdown"
        subtitle="Where your operational money is invested"
      />

      <View style={styles.breakdownCard}>
        <View style={styles.breakdownItem}>
          <View style={styles.breakdownIconWrap}>
            <Text style={styles.costEmoji}>⛽</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.breakdownTitleRow}>
              <Text style={styles.breakdownTitle}>Diesel Fuel (Boat Engine)</Text>
              <Text style={styles.breakdownAmount}>{money(s.fuelCost)}</Text>
            </View>
            <Text style={styles.breakdownSub}>~150 Litres consumed across 14 voyages</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '55.6%', backgroundColor: ui.teal }]} />
            </View>
          </View>
        </View>

        <View style={styles.itemDivider} />

        <View style={styles.breakdownItem}>
          <View style={styles.breakdownIconWrap}>
            <Text style={styles.costEmoji}>🧊</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.breakdownTitleRow}>
              <Text style={styles.breakdownTitle}>Ice Blocks & Live Bait</Text>
              <Text style={styles.breakdownAmount}>{money(s.iceBaitCost)}</Text>
            </View>
            <Text style={styles.breakdownSub}>Crushed ice crates + squid/sardine bait</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '26.1%', backgroundColor: ui.warning }]} />
            </View>
          </View>
        </View>

        <View style={styles.itemDivider} />

        <View style={styles.breakdownItem}>
          <View style={styles.breakdownIconWrap}>
            <Text style={styles.costEmoji}>⚓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.breakdownTitleRow}>
              <Text style={styles.breakdownTitle}>Harbor Docking & Landing Tax</Text>
              <Text style={styles.breakdownAmount}>{money(s.harborFee)}</Text>
            </View>
            <Text style={styles.breakdownSub}>Negombo Fishery Harbor pier permits</Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: '18.3%', backgroundColor: '#6C48B2' }]} />
            </View>
          </View>
        </View>
      </View>

      {/* WEEK-BY-WEEK SUMMARY */}
      <SectionHeader
        title="Weekly Performance"
        subtitle="Consistent weekly sales consistency"
      />

      <View style={styles.weeklyCard}>
        {WEEKLY_STATS.map((wk, idx) => (
          <View key={idx} style={[styles.weeklyRow, idx > 0 && styles.weeklyRowBorder]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.weeklyWeek}>{wk.week}</Text>
              <Text style={styles.weeklyCosts}>Expenses: {money(wk.cost)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.weeklyRev}>{money(wk.revenue)}</Text>
              <Text style={styles.weeklyProfit}>Net: {money(wk.profit)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* PAYOUT VERIFICATION */}
      <View style={styles.payoutCard}>
        <View style={styles.payoutTop}>
          <FishermanIcon name="check" size={16} color={ui.success} />
          <Text style={styles.payoutTitle}>Direct Payout Account (Verified)</Text>
        </View>
        <Text style={styles.payoutAccount}>Commercial Bank of Ceylon · Negombo Main Branch</Text>
        <Text style={styles.payoutSub}>
          Pre-order app settlements are transferred directly every Monday morning.
        </Text>
      </View>

      {/* EXPORT ACTION */}
      <Pressable
        accessibilityRole="button"
        onPress={handleExport}
        style={styles.exportBtn}
      >
        <FishermanIcon name="sparkles" size={17} color="#FFFFFF" />
        <Text style={styles.exportBtnText}>Export S21 Financial Statement (PDF)</Text>
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
  periodScroll: {
    gap: 8,
    paddingBottom: 14,
  },
  periodChip: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: ui.surface,
    borderWidth: 1,
    borderColor: ui.border,
  },
  periodChipActive: {
    backgroundColor: ui.teal,
    borderColor: ui.teal,
  },
  periodText: {
    fontSize: 11,
    fontWeight: '800',
    color: ui.navy,
  },
  periodTextActive: {
    color: '#FFFFFF',
  },
  heroFinanceCard: {
    backgroundColor: '#FAFDFD',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#CDE5E2',
    shadowColor: ui.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroEyebrow: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: ui.emerald,
  },
  heroMainAmount: {
    fontSize: 30,
    fontWeight: '900',
    color: ui.navy,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  marginPill: {
    backgroundColor: ui.emeraldSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  marginPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.emerald,
  },
  heroSub: {
    fontSize: 11,
    color: ui.muted,
    lineHeight: 16,
    marginTop: 8,
  },
  heroDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 14,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroStatItem: {
    flex: 1,
  },
  heroStatLabel: {
    fontSize: 10,
    color: ui.muted,
    fontWeight: '700',
  },
  heroStatValue: {
    fontSize: 16,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 2,
  },
  growthText: {
    fontSize: 10,
    fontWeight: '900',
    color: ui.success,
    marginTop: 2,
  },
  expenseRatioText: {
    fontSize: 10,
    fontWeight: '700',
    color: ui.danger,
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    height: 38,
    backgroundColor: ui.border,
    marginHorizontal: 16,
  },
  breakdownCard: {
    backgroundColor: ui.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: ui.border,
  },
  breakdownItem: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  breakdownIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: ui.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  costEmoji: {
    fontSize: 18,
  },
  breakdownTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.navy,
  },
  breakdownAmount: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  breakdownSub: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: ui.bg,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  itemDivider: {
    height: 1,
    backgroundColor: ui.borderSubtle,
    marginVertical: 12,
  },
  weeklyCard: {
    backgroundColor: ui.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: ui.border,
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  weeklyRowBorder: {
    borderTopWidth: 1,
    borderTopColor: ui.borderSubtle,
  },
  weeklyWeek: {
    fontSize: 12,
    fontWeight: '800',
    color: ui.navy,
  },
  weeklyCosts: {
    fontSize: 10,
    color: ui.muted,
    marginTop: 2,
  },
  weeklyRev: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
  },
  weeklyProfit: {
    fontSize: 11,
    fontWeight: '900',
    color: ui.emerald,
    marginTop: 2,
  },
  payoutCard: {
    backgroundColor: ui.tealLight,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D4EDE9',
    marginTop: 14,
  },
  payoutTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  payoutTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: ui.tealDark,
  },
  payoutAccount: {
    fontSize: 13,
    fontWeight: '900',
    color: ui.navy,
    marginTop: 6,
  },
  payoutSub: {
    fontSize: 10,
    color: ui.muted,
    lineHeight: 15,
    marginTop: 4,
  },
  exportBtn: {
    backgroundColor: ui.teal,
    borderRadius: 16,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 18,
    marginBottom: 20,
    shadowColor: ui.teal,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  exportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
});
