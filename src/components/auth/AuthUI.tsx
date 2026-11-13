import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Image, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, View, type TextInputProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

export const ui = {
  bg: '#F7FBFA', navy: '#123C57', teal: '#0CA9A3', gray: '#748B93', border: '#DEE9E8',
  light: '#E9F7F4', error: '#C64853', success: '#119A71', white: '#FFFFFF',
};
const brand = require('../../../assets/fishmate/fishmate-complete.png');
const buttonTexture = require('../../../assets/fishmate/button-gradient.png');

type ShellProps = { eyebrow: string; title: string; subtitle: string; children: ReactNode; backTo?: string };
export function AuthShell({ eyebrow, title, subtitle, children, backTo }: ShellProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top','bottom']}>
      <View pointerEvents="none" style={styles.aquaOrb} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => backTo ? router.replace(backTo as never) : router.back()} style={styles.back}>
              <Text style={styles.backLabel}>‹</Text>
            </Pressable>
            <Text style={styles.topBadge}>FISHMATE  /  ACCOUNT</Text>
          </View>
          <Image source={brand} resizeMode="contain" style={styles.brand} accessibilityLabel="FishMate logo" />
          <Text style={styles.eyebrow}>{eyebrow.toUpperCase()}</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          <View style={styles.card}>{children}</View>
          <Text style={styles.footer}>Fresh fish. Real connections.  •  FishMate</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = TextInputProps & { label: string; error?: string; isPassword?: boolean; hint?: string };
export function AuthField({ label, error, isPassword, hint, style, ...rest }: FieldProps) {
  const [show, setShow] = useState(false);
  return <View style={styles.fieldWrap}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={[styles.fieldBox, error ? styles.fieldError : null]}>
      <TextInput {...rest} accessibilityLabel={label} placeholderTextColor="#9AAEB3"
        secureTextEntry={isPassword && !show} style={[styles.fieldInput, style]} />
      {isPassword && <Pressable accessibilityRole="button" accessibilityLabel={show ? 'Hide password':'Show password'} onPress={() => setShow(!show)} hitSlop={12}>
        <Text style={styles.toggle}>{show ? 'Hide' : 'Show'}</Text>
      </Pressable>}
    </View>
    {error ? <Text style={styles.validation}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
  </View>;
}

export function PrimaryButton({ title, onPress, disabled=false, loading=false }: { title:string; onPress:()=>void; disabled?:boolean; loading?:boolean }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled || loading} onPress={onPress} style={({pressed})=>[styles.cta, (disabled || loading) && { opacity: .55 }, pressed && { transform:[{scale:.99}] }]}>
    <ImageBackground source={buttonTexture} resizeMode="stretch" style={styles.ctaBg} imageStyle={styles.ctaImg}>
      <Text style={styles.ctaLabel}>{loading ? 'Please wait…' : title}</Text><Text style={styles.ctaArrow}>→</Text>
    </ImageBackground>
  </Pressable>;
}
export function TextLink({ prefix, text, onPress }: { prefix?:string; text:string; onPress:()=>void }) {
  return <View style={styles.linkRow}>
    {!!prefix && <Text style={styles.linkPrefix}>{prefix} </Text>}
    <Pressable onPress={onPress} accessibilityRole="link"><Text style={styles.linkText}>{text}</Text></Pressable>
  </View>;
}
export function InlineAlert({ message, kind='error' }: { message:string; kind?:'error'|'success'|'info' }) {
  const color = kind==='error' ? ui.error : kind==='success' ? ui.success : ui.navy;
  return <View style={[styles.alert,{ backgroundColor:kind==='error'?'#FFF1F1':'#EAF8F5' }]}>
    <Text style={{color,fontSize:12,lineHeight:18}}>{message}</Text>
  </View>;
}

const styles=StyleSheet.create({
  safe:{ flex:1, backgroundColor:ui.bg },
  aquaOrb:{ position:'absolute',top:-195,right:-140,width:430,height:430,borderRadius:220,backgroundColor:'#E5F7F3' },
  scroll:{ paddingHorizontal:24, paddingTop:8, paddingBottom:36, width:'100%',maxWidth:490,alignSelf:'center' },
  topRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',minHeight:42},
  back:{width:39,height:39,borderWidth:1,borderColor:'#DCEAE6',borderRadius:14,backgroundColor:'#FFFFFF',alignItems:'center',justifyContent:'center'},
  backLabel:{fontSize:29,lineHeight:32,color:ui.navy,marginTop:-4},
  topBadge:{fontSize:9,fontWeight:'800',letterSpacing:2.2,color:ui.teal},
  brand:{width:140,height:96,alignSelf:'center',marginTop:9,marginBottom:8},
  eyebrow:{textAlign:'center',fontSize:10,letterSpacing:2.8,fontWeight:'800',color:ui.teal,marginBottom:10},
  title:{fontSize:29,lineHeight:35,letterSpacing:-1.2,fontWeight:'800',textAlign:'center',color:ui.navy},
  subtitle:{textAlign:'center',color:ui.gray,fontSize:13,lineHeight:20,marginTop:10,marginBottom:23,paddingHorizontal:5},
  card:{backgroundColor:'#FFFFFF',padding:22,borderRadius:26,borderWidth:1,borderColor:'#E3EEEB',shadowColor:'#124A55',shadowOpacity:.045,shadowRadius:18,shadowOffset:{width:0,height:7},elevation:2},
  fieldWrap:{marginBottom:16},fieldLabel:{color:ui.navy,fontSize:12,fontWeight:'700',marginBottom:8},
  fieldBox:{minHeight:52,borderRadius:14,borderWidth:1,borderColor:ui.border,backgroundColor:'#FAFCFC',flexDirection:'row',alignItems:'center',paddingHorizontal:14},
  fieldError:{borderColor:'#E6A1A7'},
  fieldInput:{color:ui.navy,flex:1,fontSize:15,paddingVertical:12,minWidth:0},
  toggle:{fontSize:12,color:ui.teal,fontWeight:'700',paddingLeft:8},
  validation:{color:ui.error,fontSize:11,marginTop:5},hint:{fontSize:11,color:ui.gray,marginTop:5},
  cta:{height:54,borderRadius:16,overflow:'hidden',marginTop:6},
  ctaBg:{height:'100%',alignItems:'center',justifyContent:'center',flexDirection:'row'},
  ctaImg:{borderRadius:16},ctaLabel:{fontSize:15,color:'#FFFFFF',fontWeight:'800',letterSpacing:.2},
  ctaArrow:{position:'absolute',right:18,fontSize:22,color:'#E8FFFD'},
  linkRow:{marginTop:21,flexDirection:'row',justifyContent:'center',alignItems:'center',flexWrap:'wrap'},
  linkPrefix:{color:ui.gray,fontSize:12},linkText:{fontSize:12,color:ui.teal,fontWeight:'800'},
  footer:{marginTop:27,textAlign:'center',fontSize:10,color:'#93A8AC',letterSpacing:.15},
  alert:{marginTop:4,marginBottom:12,padding:12,borderRadius:12},
});
