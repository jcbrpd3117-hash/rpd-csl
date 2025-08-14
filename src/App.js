import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON } from './api/supabase';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// background image (placed at src/assets/rpd_bg.png)
const BG = require('./assets/rpd_bg.png');

export default function App() {
  const [email, setEmail] = useState('reviewer@raleighnc.gov');
  const [password, setPassword] = useState('DemoPass123!');
  const [sceneId, setSceneId] = useState('');
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) Alert.alert('Login error', error.message);
    else setSession(data.session);
  };

  const createScene = async () => {
    if (!session) return Alert.alert('Please login first');
    setBusy(true);
    // Simple square near Raleigh (dummy polygon) for testing
    const perimeter = { type:'Polygon', coordinates:[ [[-78.64,35.78],[-78.64,35.79],[-78.63,35.79],[-78.64,35.78]] ] };
    const { data, error } = await supabase.from('scenes').insert({
      title: 'Test Scene', case_number: '24-TEST-001', perimeter_geojson: perimeter, created_by: session.user.id
    }).select('id').single();
    setBusy(false);
    if (error) Alert.alert('Create error', error.message); else setSceneId(data.id);
  };

  const exportCSV = async () => {
    if (!sceneId) return Alert.alert('Set a sceneId (create one first)');
    const { data: sess } = await supabase.auth.getSession();
    const token = sess?.session?.access_token;
    const url = `${SUPABASE_URL}/functions/v1/export-scene-csv?sceneId=${sceneId}&token=${encodeURIComponent(token)}`;
    Alert.alert('CSV URL', url + '\n(Open this on your phone after logging in)');
  };

  const exportPDF = async () => {
    if (!sceneId) return Alert.alert('Set a sceneId (create one first)');
    const { data: sess } = await supabase.auth.getSession();
    const token = sess?.session?.access_token;
    const url = `${SUPABASE_URL}/functions/v1/export-scene-pdf?sceneId=${sceneId}&token=${encodeURIComponent(token)}`;
    Alert.alert('PDF URL', url + '\n(Open this on your phone after logging in)');
  };

  return (
    <ImageBackground source={BG} style={{ flex: 1 }} resizeMode="cover">
      {/* subtle dark overlay for contrast */}
      <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' }} />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <View style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
            {/* glass card */}
            <View style={{
              backgroundColor: 'rgba(255,255,255,0.92)',
              borderRadius: 16,
              padding: 18,
              shadowColor: '#000',
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 12,
              elevation: 4
            }}>
              <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>
                RPD Crime Scene Log
              </Text>

              <Text style={{ fontSize: 12, color: '#4b5563', marginBottom: 6 }}>1) Login</Text>
              <TextInput
                placeholder="email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10, marginBottom: 8, backgroundColor: '#fff' }}
              />
              <TextInput
                placeholder="password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 10, marginBottom: 10, backgroundColor: '#fff' }}
              />

              <Button title={busy ? 'Working…' : 'Login'} onPress={signIn} disabled={busy} />

              <View style={{ height: 16 }} />
              <Text style={{ fontSize: 12, color: '#4b5563', marginBottom: 6 }}>
                2) Create a test scene (simple square in Raleigh)
              </Text>
              <Button title="Create Test Scene" onPress={createScene} disabled={busy} />

              <Text style={{ fontSize: 12, color: '#6b7280', marginVertical: 10 }} numberOfLines={1}>
                sceneId: {sceneId || '(none yet)'}
              </Text>

              <Text style={{ fontSize: 12, color: '#4b5563', marginBottom: 6 }}>3) Export</Text>
              <Button title="Export CSV" onPress={exportCSV} />
              <View style={{ height: 8 }} />
              <Button title="Export PDF" onPress={exportPDF} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const StyleSheet = {
  absoluteFillObject: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0
  }
};
