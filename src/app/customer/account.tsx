import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CustomerIcon } from '@/components/customer/Icon';
import { customerUi as c } from '@/components/customer/theme';
import { getSession, logout } from '@/services/demoAuth';

const brand=require('../../../assets/fishmate/fishmate-icon.png');
/** Minimal navigable account tab; full C08–C09 account-management UI comes later. */
export default function DemoCustomerAccount() {
  const account=getSession();
  return <CustomerShell title="Your account" subtitle="FishMate customer demo profile">
    <View style={styles.card}><View style={styles.avatar}><CustomerIcon name="user" size={44} color={c.tealDark}/></View><Text style={styles.name}>{account?.fullName ?? 'Demo Customer'}</Text><Text style={styles.role}>CUSTOMER · FRONTEND DEMO</Text><View style={styles.divider}/><Text style={styles.muted}>Mobile</Text><Text style={styles.value}>{account?.phone ?? 'Not signed in'}</Text></View>
    <View style={styles.message}><Image source={brand} style={styles.brand}/><Text style={styles.messageText}>Full profile editing, delivery preferences and settings are planned in C08–C09.</Text></View>
    <Pressable style={styles.logout} onPress={()=>{logout();router.replace('/login');}}><Text style={styles.logoutText}>Log out of demo account</Text></Pressable>
  </CustomerShell>;
}
const styles=StyleSheet.create({
  card:{borderRadius:25,backgroundColor:c.surface,borderWidth:1,borderColor:c.border,padding:23,alignItems:'center'},avatar:{width:90,height:90,borderRadius:28,backgroundColor:c.soft,alignItems:'center',justifyContent:'center'},name:{fontSize:23,fontWeight:'900',color:c.navy,marginTop:15},role:{fontSize:10,fontWeight:'800',letterSpacing:1.4,color:c.tealDark,marginTop:7},divider:{height:1,backgroundColor:c.border,width:'100%',marginVertical:18},muted:{fontSize:11,color:c.muted,alignSelf:'flex-start'},value:{fontSize:14,color:c.navy,fontWeight:'800',alignSelf:'flex-start',marginTop:5},
  message:{backgroundColor:c.soft,padding:18,flexDirection:'row',gap:10,alignItems:'center',borderRadius:19,marginTop:14},brand:{height:46,width:46},messageText:{flex:1,fontSize:12,lineHeight:19,color:c.muted},logout:{marginTop:20,backgroundColor:c.surface,borderWidth:1,borderColor:'#F1B5BB',height:51,borderRadius:16,alignItems:'center',justifyContent:'center'},logoutText:{fontSize:13,fontWeight:'900',color:'#B84958'},
});
