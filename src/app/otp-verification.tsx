import { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, Keyboard, Pressable, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AuthShell, InlineAlert, TextLink, ui } from '@/components/auth/AuthUI';
import {
  authorizePasswordReset, completeRegistration, DEMO_OTP,
  hasPendingRegistration, maskPhone,
} from '@/services/demoAuth';

type VerifyStatus = 'entering'|'checking'|'verified'|'error';
const DIGITS = 4;

/** Four separate spring cards inspired by the uploaded 4-digit OTP deck video.
 * Animated entirely in React Native; no video playback or OTP provider required.
 */
export default function OTPVerificationScreen() {
  const { mode='register',phone='' } = useLocalSearchParams<{mode?:string;phone?:string}>();
  const forReset=mode==='reset';
  const input=useRef<any>(null);
  const [code,setCode]=useState('');
  const codeRef=useRef('');
  const [status,setStatus]=useState<VerifyStatus>('entering');
  const [message,setMessage]=useState('');
  const [seconds,setSeconds]=useState(30);
  const entry=useRef(Array.from({length:DIGITS},()=>new Animated.Value(0))).current;
  const highlights=useRef(Array.from({length:DIGITS},()=>new Animated.Value(0))).current;
  const shake=useRef(new Animated.Value(0)).current;
  const checkPulse=useRef(new Animated.Value(0)).current;
  const checked=useRef(new Animated.Value(0)).current;
  const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
  const alive=useRef(true);
  const pending=forReset ? !!phone : hasPendingRegistration(phone);
  const schedule=(cb:()=>void,delay:number)=>{
    const timer=setTimeout(()=>{if(alive.current)cb();},delay);
    timers.current.push(timer);
  };
  useEffect(()=>{
    alive.current=true;
    Animated.stagger(115,entry.map(v=>Animated.spring(v,{
      toValue:1,tension:66,friction:7,useNativeDriver:true,
    }))).start();
    const interval=setInterval(()=>setSeconds(v=>Math.max(0,v-1)),1000);
    return ()=>{
      alive.current=false;clearInterval(interval);
      timers.current.forEach(clearTimeout);
      entry.forEach(v=>v.stopAnimation());
      highlights.forEach(v=>v.stopAnimation());
      shake.stopAnimation();checkPulse.stopAnimation();checked.stopAnimation();
    };
  // mount-only entrance / lifecycle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  useEffect(()=>{
    highlights.forEach((v,i)=>Animated.spring(v,{
      toValue:status==='entering'||status==='error' ? (i===code.length?1:0) : 0,
      tension:95,friction:10,useNativeDriver:true,
    }).start());
  },[code,highlights,status]);

  useEffect(()=>{
    if(status!=='checking') return;
    checkPulse.setValue(0);
    const animation=Animated.loop(Animated.sequence([
      Animated.timing(checkPulse,{toValue:1,duration:420,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
      Animated.timing(checkPulse,{toValue:0,duration:420,easing:Easing.inOut(Easing.sin),useNativeDriver:true}),
    ]));
    animation.start();
    return ()=>animation.stop();
  },[checkPulse,status]);

  const verify=(value:string)=>{
    if(value.length!==DIGITS||status==='checking'||status==='verified')return;
    setMessage('');
    setStatus('checking');
    Keyboard.dismiss();
    schedule(()=>{
      if(value!==DEMO_OTP){
        setStatus('error');
        setMessage('That code is incorrect. Try the demo code shown below.');
        shake.setValue(0);
        Animated.sequence([-15,14,-9,7,0].map(v=>Animated.timing(shake,{toValue:v,duration:62,useNativeDriver:true}))).start();
        schedule(()=>{codeRef.current='';setCode('');input.current?.focus();},650);
        return;
      }
      const passed=forReset ? authorizePasswordReset(phone) : completeRegistration(phone);
      if(!passed){
        setStatus('error');
        setMessage('Verification session expired. Please start again.');
        return;
      }
      setStatus('verified');
      setMessage(forReset ? 'Identity confirmed! Set your new password.' : 'Your FishMate account is verified!');
      checked.setValue(0);
      Animated.spring(checked,{toValue:1,friction:6,tension:70,useNativeDriver:true}).start();
      schedule(()=>{
        if(forReset) router.replace({pathname:'/reset-password',params:{phone}});
        else router.replace({pathname:'/login',params:{registered:'1'}});
      },1150);
    },850);
  };

  const onChange=(value:string)=>{
    if(status==='checking'||status==='verified') return;
    const clean=value.replace(/\D/g,'').slice(0,DIGITS);
    codeRef.current=clean;
    setCode(clean);
    setStatus('entering');
    setMessage('');
    if(clean.length===DIGITS){schedule(()=>{if(codeRef.current===clean) verify(clean);},260);}
  };
  const resend=()=>{
    if(seconds>0||status==='checking'||status==='verified')return;
    codeRef.current='';setCode('');setStatus('entering');setSeconds(30);
    setMessage('A fresh demo verification attempt is ready. No real SMS was sent.');
    input.current?.focus();
  };

  return <AuthShell eyebrow="Secure your connection" title={status==='verified'?'Successfully verified!':'Verify your number'}
    subtitle={status==='verified'?'You are all set. Taking you to the next step…':`Enter the 4-digit code for ${maskPhone(phone)}.`}>
    {!pending && status!=='verified' && !forReset && <InlineAlert message="No pending registration. Please return to Registration and submit your details."/>}
    <View style={styles.deckHeader}>
      <View style={styles.line}/><Text style={styles.deckEyebrow}>OTP VERIFICATION</Text><View style={styles.line}/>
    </View>
    <Text style={styles.deckTitle}>{status==='verified'?'Verified':status==='checking'?'Checking your code':'Enter your code'}</Text>
    <Text style={styles.deckSub}>{status==='verified'?'Identity confirmed successfully':status==='checking'?'One moment — we are confirming it':'Four little steps to your FishMate account'}</Text>
    <View style={styles.deckFrame}>
      <Pressable accessibilityRole="button" accessibilityLabel="Tap to enter verification digits" onPress={()=>input.current?.focus()}>
      <Animated.View style={[styles.digits,{transform:[{translateX:shake}]}]}>
        {status==='checking'||status==='verified' ?
          <Animated.View style={[styles.checkCard,status==='verified'&&styles.checkCardSuccess,{
            transform:[{scale:status==='verified'?checked.interpolate({inputRange:[0,1],outputRange:[.63,1]}):checkPulse.interpolate({inputRange:[0,1],outputRange:[.92,1.09]})}],
          }]}>
            <Text style={[styles.checkIcon,status==='verified'&&{color:'#E7FFF4'}]}>{status==='verified'?'✓':'···'}</Text>
          </Animated.View>
        : Array.from({length:DIGITS},(_,i)=>{
          const isFilled=!!code[i];
          const isActive=i===code.length;
          const tilt=(i-1.5)*12;
          return <Animated.View key={i} style={[
            styles.digitCard,
            isFilled&&styles.filledCard,
            isActive&&styles.activeCard,
            {
              opacity:entry[i],
              transform:[
                {translateX:entry[i].interpolate({inputRange:[0,1],outputRange:[(1.5-i)*24,0]})},
                {translateY:entry[i].interpolate({inputRange:[0,1],outputRange:[55,0]})},
                {rotate:entry[i].interpolate({inputRange:[0,1],outputRange:[`${tilt}deg`,'0deg']})},
                {scale:highlights[i].interpolate({inputRange:[0,1],outputRange:[1,1.06]})},
              ],
            }
          ]}>
            <Text style={[styles.digitText,isFilled&&styles.filledText]}>{code[i]??''}</Text>
            {isActive&&!isFilled&&<View style={styles.cursor}/>} 
          </Animated.View>;
        })}
      </Animated.View>
      </Pressable>
      <Pressable accessibilityLabel="Type your four-digit verification code" accessibilityRole="button" onPress={()=>input.current?.focus()} style={styles.tapTarget} disabled={status==='checking'||status==='verified'}>
        <Text style={styles.tapText}>{status==='verified'?'Verification complete':status==='checking'?'Verifying…':'Tap the boxes to enter the code'}</Text>
      </Pressable>
      <TextInput ref={input} value={code} onChangeText={onChange} keyboardType="number-pad" maxLength={4}
        textContentType="oneTimeCode" autoComplete="sms-otp" accessibilityLabel="Four digit OTP" caretHidden
        style={styles.hiddenInput} editable={status!=='checking'&&status!=='verified'} />
    </View>
    {!!message&&<InlineAlert message={message} kind={status==='verified'?'success':status==='error'?'error':'info'}/>}
    <View style={styles.resend}>
      <Text style={styles.resendCopy}>Didn't get a code? </Text>
      <Pressable onPress={resend} disabled={seconds>0||status==='checking'||status==='verified'} accessibilityRole="button">
        <Text style={[styles.resendAction,seconds>0&&{color:'#9AB1B5'}]}>{seconds>0?`Resend in ${seconds}s`:'Resend code'}</Text>
      </Pressable>
    </View>
    <View style={styles.demoBox}>
      <Text style={styles.demoBadge}>DEMO MODE · NO SMS SENT</Text>
      <Text style={styles.demoBody}>Use code <Text style={styles.demoCode}>1234</Text> to test the animated verification flow.</Text>
    </View>
    <TextLink text={forReset?'Back to password recovery':'Back to registration'} onPress={()=>router.back()}/>
  </AuthShell>;
}

const styles=StyleSheet.create({
  deckHeader:{flexDirection:'row',alignItems:'center',gap:10,marginBottom:16},
  deckEyebrow:{fontWeight:'800',fontSize:9,letterSpacing:1.8,color:ui.teal},
  line:{flex:1,height:1,backgroundColor:'#DDE9E6'},
  deckTitle:{fontSize:18,color:ui.navy,fontWeight:'800',textAlign:'center'},
  deckSub:{textAlign:'center',color:ui.gray,fontSize:11,marginTop:6},
  deckFrame:{minHeight:153,justifyContent:'center',marginTop:2},
  digits:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:11,minHeight:104},
  digitCard:{width:52,height:66,borderRadius:15,backgroundColor:'#F9FCFC',borderWidth:1.5,borderColor:'#DCE7E9',alignItems:'center',justifyContent:'center'},
  activeCard:{borderColor:ui.teal,backgroundColor:'#F0FBFA',shadowColor:ui.teal,shadowOpacity:.16,shadowOffset:{width:0,height:3},shadowRadius:7,elevation:3},
  filledCard:{backgroundColor:'#E8F6F4',borderColor:'#A5DAD6'},
  digitText:{fontSize:24,fontWeight:'800',color:ui.navy},filledText:{color:'#066E82'},
  cursor:{position:'absolute',bottom:13,width:17,height:2,backgroundColor:ui.teal,borderRadius:3},
  checkCard:{width:68,height:68,borderRadius:22,backgroundColor:'#E3F5F1',borderColor:ui.teal,borderWidth:2,justifyContent:'center',alignItems:'center',shadowColor:ui.teal,shadowOpacity:.27,shadowRadius:20,elevation:5},
  checkCardSuccess:{backgroundColor:ui.success,borderColor:'#7BE0B7'},
  checkIcon:{fontSize:32,fontWeight:'800',color:ui.teal},
  tapTarget:{alignItems:'center',paddingVertical:8},tapText:{color:'#99ADB2',fontSize:11},
  hiddenInput:{position:'absolute',width:1,height:1,opacity:0,bottom:0,left:0},
  resend:{flexDirection:'row',justifyContent:'center',marginTop:7,alignItems:'center'},
  resendCopy:{color:ui.gray,fontSize:12},resendAction:{fontSize:12,fontWeight:'800',color:ui.teal},
  demoBox:{borderRadius:14,backgroundColor:'#EFF9F7',borderWidth:1,borderColor:'#D9F0EB',padding:13,marginTop:24},
  demoBadge:{color:ui.teal,fontWeight:'800',fontSize:9,letterSpacing:1.2,marginBottom:5},
  demoBody:{color:ui.gray,fontSize:11,lineHeight:18},demoCode:{fontWeight:'900',fontSize:14,letterSpacing:2,color:ui.navy},
});
