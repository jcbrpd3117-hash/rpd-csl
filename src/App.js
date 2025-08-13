import React, { useState } from 'react';
import { SafeAreaView, View, Text, TextInput, Button, ScrollView, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON } from './api/supabase';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export default function App() {
  const [email, setEmail] = useState('reviewer@raleighnc.gov');
  const [password, setPassword] = useState('DemoPass123!');
  const [sceneId, setSceneId] = useState('');
  const [session, setSession] = useState(null);

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Login error', error.message);
    else setSession(data.session);
  };

  const createScene = async () => {
    if (!session) return Alert.alert('Please login first');
    // Simple square near Raleigh (dummy polygon) for testing
    const perimeter = { type:'Polygon', coordinates:[ [[-78.64,35.78],[-78.64,35.79],[-78.63,35.79],[-78.64,35.78]] ] };
    const { data, error } = await supabase.from('scenes').insert({
      title: 'Test Scene', case_number: '24-TEST-001', perimeter_geojson: perimeter, created_by: session.user.id
    }).select('id').single();
    if (error) Alert.alert('Create error', error.message); else setSceneId(data.id);
  };

  const exportCSV = async () => {
    if (!sceneId) return Alert.alert('Set a sceneId (create one first)');
    const url = `${SUPABASE_URL}/functions/v1/export-scene-csv?sceneId=${sceneId}`;
    Alert.alert('CSV URL', url + '\n(Open this on your phone after logging in)');
  };

  const exportPDF = async () => {
    if (!sceneId) return Alert.alert('Set a sceneId (create one first)');
    const url = `${SUPABASE_URL}/functions/v1/export-scene-pdf?sceneId=${sceneId}`;
    Alert.alert('PDF URL', url + '\n(Open this on your phone after logging in)');
  };

  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView contentContainerStyle={{padding:16}}>
        <Text style={{fontSize:20, fontWeight:'bold'}}>RPD Crime Scene Log (Cloud Test)</Text>
        <Text>1) Login</Text>
        <TextInput placeholder="email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{borderWidth:1, padding:8, marginVertical:6}}/>
        <TextInput placeholder="password" value={password} onChangeText={setPassword} secureTextEntry style={{borderWidth:1, padding:8, marginVertical:6}}/>
        <Button title="Login" onPress={signIn} />

        <View style={{height:16}}/>
        <Text>2) Create a test scene (simple square in Raleigh)</Text>
        <Button title="Create Test Scene" onPress={createScene} />
        <Text selectable>sceneId: {sceneId || '(none yet)'}</Text>

        <View style={{height:16}}/>
        <Text>3) Export</Text>
        <Button title="Export CSV" onPress={exportCSV} />
        <View style={{height:8}}/>
        <Button title="Export PDF" onPress={exportPDF} />
      </ScrollView>
    </SafeAreaView>
  );
}
