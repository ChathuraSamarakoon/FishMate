import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { DemoNotice, OrderMiniCard, ShopHeading, ShopPrimaryButton } from '@/components/customer/ShopUI';
import { customerUi as c } from '@/components/customer/theme';

type Filter='all'|'active'|'delivered'|'payment';
export default function MyOrders(){
  const {orders}=useMarketplace();
  const [filter,setFilter]=useState<Filter>('all');
  const filtered=useMemo(()=>orders.filter(order=>{
    if(filter==='delivered')return order.status==='delivered';
    if(filter==='payment')return order.status==='awaiting_payment';
    if(filter==='active')return order.status!=='delivered'&&order.status!=='cancelled'&&order.status!=='awaiting_payment';
    return true;
  }),[orders,filter]);
  const filters: {key:Filter;label:string}[]=[{key:'all',label:'All'},{key:'active',label:'Active'},{key:'delivered',label:'Delivered'},{key:'payment',label:'Payment issue'}];
  return <CustomerShell back title="My orders" subtitle="C15 · All your demo seafood purchases" hideNavPadding rightIcon="bag" rightLabel="Cart" onRightPress={()=>router.push('/customer/cart')}>
    <DemoNotice>Orders shown below are simulated. Sample history is marked and new orders are session-only.</DemoNotice>
    <View style={s.summary}><View style={s.stat}><Text style={s.count}>{orders.length}</Text><Text style={s.label}>Total orders</Text></View><View style={s.line}/><View style={s.stat}><Text style={s.count}>{orders.filter(o=>o.status==='delivered').length}</Text><Text style={s.label}>Delivered</Text></View><View style={s.line}/><View style={s.stat}><Text style={s.count}>{orders.filter(o=>o.status==='awaiting_payment').length}</Text><Text style={s.label}>Payment issue</Text></View></View>
    <ShopHeading title="Order history" caption="Tap any order to view its items and status"/>
    <View style={s.filters}>{filters.map(item=><Pressable key={item.key} onPress={()=>setFilter(item.key)} accessibilityRole="button" accessibilityState={{selected:filter===item.key}} style={[s.chip,filter===item.key&&s.activeChip]}><Text style={[s.chipLabel,filter===item.key&&s.activeLabel]}>{item.label}</Text></Pressable>)}</View>
    {filtered.length?filtered.map(order=><OrderMiniCard key={order.id} order={order} onPress={()=>router.push({pathname:'/customer/order/[id]',params:{id:order.id}})}/>):<View style={s.empty}><Text style={s.emptyTitle}>No orders in this category</Text><Text style={s.emptyText}>Try another filter or browse fresh seafood.</Text><ShopPrimaryButton label="Explore catches" onPress={()=>router.push('/customer/search')}/></View>}
  </CustomerShell>;
}
const s=StyleSheet.create({
  summary:{backgroundColor:'#064B5D',borderRadius:24,padding:17,marginTop:18,flexDirection:'row',alignItems:'center',justifyContent:'space-around'},stat:{alignItems:'center',flex:1},count:{fontSize:25,color:'#FFFFFF',fontWeight:'900'},label:{color:'#C0ECEB',fontSize:10,marginTop:5,fontWeight:'700'},line:{height:28,width:1,backgroundColor:'#367985'},filters:{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:18},chip:{backgroundColor:c.surface,borderColor:c.border,borderWidth:1,borderRadius:15,paddingVertical:9,paddingHorizontal:12},activeChip:{backgroundColor:c.teal,borderColor:c.teal},chipLabel:{fontSize:11,color:c.navy,fontWeight:'800'},activeLabel:{color:'#FFFFFF'},empty:{backgroundColor:c.surface,borderRadius:22,padding:26,borderColor:c.border,borderWidth:1,alignItems:'center'},emptyTitle:{color:c.navy,fontWeight:'900',fontSize:17},emptyText:{color:c.muted,fontSize:12,marginTop:10,textAlign:'center'},
});
