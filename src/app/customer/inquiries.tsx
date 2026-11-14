import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CustomerShell } from '@/components/customer/CustomerShell';
import { CustomerIcon } from '@/components/customer/Icon';
import { useMarketplace } from '@/components/customer/MarketplaceContext';
import { customerUi as c } from '@/components/customer/theme';
import { getFishermanById, getListingById } from '@/data/mockData';

/** A lightweight demo list supporting the navigation; full C05–C07 inquiry flow is a later phase. */
export default function DemoInquiries() {
  const { inquiries } = useMarketplace();
  return <CustomerShell title="My inquiries" subtitle="Locally saved draft inquiries" rightIcon="search" rightLabel="Explore fish" onRightPress={()=>router.push('/customer/search')}>
    <View style={styles.notice}><CustomerIcon name="message" color={c.tealDark} size={21}/><Text style={styles.noticeText}>Frontend demo only. Entries below are saved in memory and are <Text style={{fontWeight:'900'}}>not sent</Text> to sellers.</Text></View>
    {inquiries.length===0 ? <View style={styles.empty}><CustomerIcon name="message" color={c.tealDark} size={42}/><Text style={styles.emptyTitle}>No inquiry drafts yet</Text><Text style={styles.emptyText}>Open a fish listing or fisherman profile and tap “Ask seller” to save a test inquiry.</Text><Pressable style={styles.button} onPress={()=>router.push('/customer/search')}><Text style={styles.buttonText}>Explore catches</Text></Pressable></View> : inquiries.map(entry=>{
      const seller=getFishermanById(entry.sellerId);
      const listing=entry.listingId ? getListingById(entry.listingId) : undefined;
      return <View key={entry.id} style={styles.inquiry}><Text style={styles.inquiryTitle}>{seller?.name??'Fisherman'}{listing ? ` · ${listing.name}` : ''}</Text><Text style={styles.inquiryMessage}>{entry.message}</Text><Text style={styles.status}>Saved locally · not sent</Text></View>;
    })}
    <Text style={styles.footer}>The dedicated Inquiry Details and communication module will be developed in C05–C07.</Text>
  </CustomerShell>;
}
const styles=StyleSheet.create({
  notice:{borderRadius:18,padding:14,backgroundColor:c.soft,flexDirection:'row',gap:10,alignItems:'flex-start',marginTop:5},noticeText:{color:c.muted,fontSize:12,lineHeight:19,flex:1},
  empty:{marginTop:22,backgroundColor:c.surface,borderWidth:1,borderColor:c.border,borderRadius:25,padding:28,alignItems:'center'},emptyTitle:{color:c.navy,fontSize:18,fontWeight:'900',marginTop:13},emptyText:{fontSize:12,color:c.muted,lineHeight:19,textAlign:'center',marginTop:9},
  button:{marginTop:18,paddingHorizontal:19,paddingVertical:13,backgroundColor:c.teal,borderRadius:14},buttonText:{fontSize:12,color:'#FFFFFF',fontWeight:'900'},
  inquiry:{borderWidth:1,borderColor:c.border,backgroundColor:c.surface,borderRadius:19,padding:16,marginTop:12},inquiryTitle:{fontSize:14,fontWeight:'900',color:c.navy},inquiryMessage:{fontSize:12,lineHeight:19,color:c.muted,marginTop:8},status:{fontSize:10,color:c.tealDark,fontWeight:'800',marginTop:10},footer:{fontSize:10,color:c.muted,textAlign:'center',marginTop:20},
});
