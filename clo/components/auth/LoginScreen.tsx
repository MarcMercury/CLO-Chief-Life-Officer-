import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    if (isSignUp && !fullName) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isSignUp) {
      const { error, data } = await signUpWithEmail(email, password, fullName);
      setIsLoading(false);

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Sign Up Error', error.message);
      } else if (data?.user && !data?.session) {
        // User created but needs to confirm email
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Check Your Email',
          'We sent a confirmation link to your email. Please check your inbox and click the link to activate your account.',
          [{ text: 'OK', onPress: () => setIsSignUp(false) }]
        );
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        // User created and logged in (email confirmation disabled)
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      const { error } = await signInWithEmail(email, password);
      setIsLoading(false);

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Sign In Error', error.message);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { error } = await signInWithGoogle();

    setIsLoading(false);

    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Authentication Error', error.message);
    }
  };

  const toggleMode = () => {
    Haptics.selectionAsync();
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setFullName('');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Enter Your Sanctuary</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? 'Create your private Life OS' : 'Welcome back to CLO'}
        </Text>

        <View style={styles.form}>
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#A0A0A0"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              editable={!isLoading}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A0A0A0"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleEmailAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#E0E0E0" />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleGoogleAuth}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMode} disabled={isLoading}>
            <Text style={styles.toggleText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#E0E0E0',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 48,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    color: '#E0E0E0',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonText: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  dividerText: {
    color: '#A0A0A0',
    marginHorizontal: 16,
    fontSize: 14,
  },
  toggleText: {
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});
