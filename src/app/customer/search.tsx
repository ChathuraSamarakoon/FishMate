import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CategoryChip, FishCard, SectionHeader } from '@/components/customer/atoms';
import { CustomerIcon } from '@/components/customer/Icon';
import { customerUi as c } from '@/components/customer/theme';
import { categories, fishListings, getFishermanById } from '@/data/mockData';

type SortMode = 'default'|'low'|'high';
const locations=['All locations','Negombo','Weligama'];
export default function CustomerSearch() {
  const params=useLocalSearchParams<{category?: string; q?: string}>();
  const [query,setQuery]=useState(params.q ?? '');
  const [category,setCategory]=useState(params.category ?? 'all');
  const [location,setLocation]=useState('All locations');
  const [sort,setSort]=useState<SortMode>('default');
  const [availableOnly,setAvailableOnly]=useState(true);
  const results=useMemo(()=>{
    const q=query.trim().toLowerCase();
    const filtered=fishListings.filter(item=>{
      const seller=getFishermanById(item.sellerId);
      const matchesText=!q||[item.name,item.category,item.location,seller?.name ?? '',...item.tags].some(part=>part.toLowerCase().includes(q));
      const matchesCategory=category==='all'||(category==='fish'&&item.category!=='Shellfish')||(category==='shellfish'&&item.category==='Shellfish')||(category==='premium'&&item.tags.some(t=>t.toLowerCase().includes('premium')));
      return matchesText&&matchesCategory&&(location==='All locations'||item.location===location)&&(!availableOnly||item.availableKg>0);
    });
    if(sort==='low') return [...filtered].sort((a,b)=>a.price-b.price);
    if(sort==='high') return [...filtered].sort((a,b)=>b.price-a.price);
    return filtered;
  },[query,category,location,sort,availableOnly]);
  const reset=()=>{setQuery('');setCategory('all');setLocation('All locations');setSort('default');setAvailableOnly(true);};
  const nextSort=()=>setSort(s=>s==='default'?'low':s==='low'?'high':'default');
  return <CustomerShell title="Explore seafood" subtitle="Search by fish, seller or location" rightIcon="search" rightLabel="Reset search" onRightPress={reset}>
    <View style={styles.searchBar}><CustomerIcon name="search" color={c.tealDark} size={22}/><TextInput style={styles.input} accessibilityLabel="Search fish or fishermen" value={query} onChangeText={setQuery} placeholder="Search tuna, prawns, Negombo..." placeholderTextColor="#99AAB0" autoCapitalize="none" returnKeyType="search"/>{query.length>0?<Pressable onPress={()=>setQuery('')} accessibilityRole="button" accessibilityLabel="Clear search"><Text style={styles.clear}>✕</Text></Pressable>:null}</View>
    <SectionHeader title="Categories" subtitle="Filter the catch"/>
    <View style={styles.chips}>{categories.map(item=><CategoryChip key={item.id} label={item.label} icon={item.icon} selected={category===item.id} onPress={()=>setCategory(item.id)}/>)}</View>
    <SectionHeader title="Seller location"/>
    <View style={styles.locationWrap}>{locations.map(place=><Pressable key={place} onPress={()=>setLocation(place)} accessibilityRole="button" accessibilityState={{selected:location===place}} style={[styles.locationChip,place===location&&styles.locationSelected]}><Text style={[styles.locationLabel,place===location&&styles.locationLabelSelected]}>{place}</Text></Pressable>)}</View>
    <View style={styles.optionsBar}>
      <Pressable onPress={()=>setAvailableOnly(s=>!s)} style={styles.optionLeft} accessibilityRole="switch" accessibilityState={{checked:availableOnly}}><View style={[styles.checkBox,availableOnly&&styles.checkActive]}>{availableOnly?<CustomerIcon name="check" color="#FFFFFF" size={13}/>:null}</View><Text style={styles.optionText}>Available now</Text></Pressable>
      <Pressable onPress={nextSort} style={styles.sortButton} accessibilityRole="button"><Text style={styles.sortText}>{sort==='default'?'Sort: Featured':sort==='low'?'Price: Low to high':'Price: High to low'}</Text><Text style={styles.sortChev}>⌄</Text></Pressable>
    </View>
    <View style={styles.resultsHeading}><Text style={styles.resultTitle}>Fresh catches</Text><Text style={styles.count}>{results.length} {results.length===1?'result':'results'}</Text></View>
    {results.length?results.map(item=><FishCard key={item.id} item={item} variant="row" onPress={()=>router.push(`/customer/listing/${item.id}` as never)}/>):<View style={styles.empty}><Text style={styles.emptyIcon}>⌕</Text><Text style={styles.emptyTitle}>No fish found</Text><Text style={styles.emptyText}>Try another fish name, location or category.</Text><Pressable style={styles.resetButton} onPress={reset}><Text style={styles.resetLabel}>Reset all filters</Text></Pressable></View>}
    <Text style={styles.demoNote}>Sample data only · Availability, delivery estimates and prices are illustrative.</Text>
  </CustomerShell>;
}
const styles=StyleSheet.create({
  searchBar:{height:57,borderRadius:18,borderWidth:1,borderColor:c.border,backgroundColor:c.surface,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:16},
  input:{flex:1,fontSize:13,color:c.navy,minWidth:0},clear:{fontSize:17,color:c.muted,padding:6},
  chips:{flexDirection:'row',flexWrap:'wrap',gap:8},locationWrap:{flexDirection:'row',flexWrap:'wrap',gap:8},
  locationChip:{borderRadius:13,backgroundColor:c.surface,borderWidth:1,borderColor:c.border,paddingVertical:10,paddingHorizontal:12},
  locationSelected:{backgroundColor:c.soft,borderColor:c.teal},locationLabel:{fontSize:11,color:c.muted,fontWeight:'700'},locationLabelSelected:{color:c.tealDark},
  optionsBar:{marginTop:23,flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:7},optionLeft:{flexDirection:'row',alignItems:'center',gap:7},
  checkBox:{width:19,height:19,borderRadius:6,borderWidth:1,borderColor:'#ABCACB',alignItems:'center',justifyContent:'center'},checkActive:{backgroundColor:c.teal,borderColor:c.teal},
  optionText:{color:c.navy,fontSize:11,fontWeight:'700'},sortButton:{flexDirection:'row',alignItems:'center',gap:6,paddingVertical:9,paddingHorizontal:10,borderWidth:1,borderColor:c.border,borderRadius:12,backgroundColor:c.surface},sortText:{fontSize:10,fontWeight:'800',color:c.tealDark},sortChev:{color:c.tealDark,fontSize:15,fontWeight:'700'},
  resultsHeading:{marginTop:25,marginBottom:14,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},resultTitle:{fontSize:19,fontWeight:'900',color:c.navy},count:{color:c.muted,fontSize:12,fontWeight:'700'},
  empty:{minHeight:210,alignItems:'center',justifyContent:'center',padding:22,backgroundColor:c.surface,borderRadius:22,borderWidth:1,borderColor:c.border},
  emptyIcon:{fontSize:38,color:c.tealDark},emptyTitle:{fontSize:18,fontWeight:'900',color:c.navy,marginTop:6},emptyText:{fontSize:12,color:c.muted,marginTop:8},resetButton:{backgroundColor:c.teal,paddingHorizontal:16,paddingVertical:10,borderRadius:12,marginTop:15},resetLabel:{fontSize:12,fontWeight:'900',color:'#FFFFFF'},
  demoNote:{textAlign:'center',fontSize:10,color:c.muted,marginTop:12},
});
