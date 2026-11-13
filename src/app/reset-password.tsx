import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { AuthField, AuthShell, InlineAlert, PrimaryButton, TextLink } from '@/components/auth/AuthUI';
import { canResetPassword, maskPhone, resetPassword } from '@/services/demoAuth';

export default function ResetPasswordScreen() {
  const {phone=''}=useLocalSearchParams<{phone?:string}>();
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [error,setError]=useState('');
  const authorized=canResetPassword(phone);
  const submit=()=>{
    if(!authorized) return setError('Verification required before changing your password.');
    if(password.length<8) return setError('Use at least 8 characters.');
    if(password!==confirm) return setError('Passwords do not match.');
    if(!resetPassword(phone,password)) return setError('This reset session is no longer valid.');
    router.replace({pathname:'/login',params:{reset:'1'}});
  };
  return <AuthShell eyebrow="Final step" title="Set a new password" subtitle={`Create a fresh password for ${maskPhone(phone) || 'your account'}.`} backTo="/login">
    {!authorized&&<InlineAlert message="Please verify your demo OTP before resetting your password."/>}
    <AuthField label="New password" value={password} onChangeText={setPassword} isPassword placeholder="At least 8 characters" autoComplete="new-password"/>
    <AuthField label="Confirm new password" value={confirm} onChangeText={setConfirm} isPassword placeholder="Repeat your new password"/>
    {!!error&&<InlineAlert message={error}/>}
    <PrimaryButton title="Update password" onPress={submit} disabled={!authorized}/>
    <TextLink text="Back to login" onPress={()=>router.replace('/login')}/>
  </AuthShell>;
}
