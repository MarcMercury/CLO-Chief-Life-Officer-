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
  Dimensions,
} from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import * as Haptics from 'expo-haptics';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

// Brand colors from CLO logo
const COLORS = {
  navy: '#3D4A5C',
  terracotta: '#C17A5E', 
  sage: '#8B9A7D',
  cream: '#F5F5F0',
  overlap: '#6B6B6B',
};

// Animated Venn diagram logo component
function CLOLogo({ size = 120 }: { size?: number }) {
  const circleRadius = size * 0.28;
  const centerX = size / 2;
  const centerY = size / 2;
  const offset = size * 0.18;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#4A5568" stopOpacity="0.9" />
          <Stop offset="100%" stopColor="#2D3748" stopOpacity="0.9" />
        </LinearGradient>
        <LinearGradient id="terracottaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#C17A5E" stopOpacity="0.85" />
          <Stop offset="100%" stopColor="#D4927A" stopOpacity="0.85" />
        </LinearGradient>
        <LinearGradient id="sageGrad" x1="100%" y1="100%" x2="0%" y2="0%">
          <Stop offset="0%" stopColor="#7A8B6F" stopOpacity="0.85" />
          <Stop offset="100%" stopColor="#9BAA8E" stopOpacity="0.85" />
        </LinearGradient>
      </Defs>
      {/* Navy circle - top */}
      <Circle
        cx={centerX}
        cy={centerY - offset}
        r={circleRadius}
        fill="url(#navyGrad)"
      />
      {/* Terracotta circle - bottom left */}
      <Circle
        cx={centerX - offset * 0.9}
        cy={centerY + offset * 0.6}
        r={circleRadius}
        fill="url(#terracottaGrad)"
      />
      {/* Sage circle - bottom right */}
      <Circle
        cx={centerX + offset * 0.9}
        cy={centerY + offset * 0.6}
        r={circleRadius}
        fill="url(#sageGrad)"
      />
    </Svg>
  );
}

export default function LoginScreen() {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password');
      return;
    }

    if (isSignUp && !fullName) {
      Alert.alert('Missing Information', 'Please enter your full name');
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isSignUp) {
        const { error, data } = await signUpWithEmail(email, password, fullName);
        setIsLoading(false);

        if (error) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          Alert.alert('Sign Up Error', error.message);
        } else if (data?.user) {
          // Always show confirmation message for signup
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert(
            'Welcome to CLO!',
            data?.session 
              ? 'Your account has been created successfully.'
              : 'Please check your email for a confirmation link to activate your account.',
            [{ text: 'OK', onPress: () => {
              if (!data?.session) {
                setIsSignUp(false);
                setEmail('');
                setPassword('');
                setFullName('');
              }
            }}]
          );
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        setIsLoading(false);

        if (error) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          // Provide more helpful error messages
          if (error.message.includes('Invalid login credentials')) {
            Alert.alert('Sign In Failed', 'Invalid email or password. Please try again.');
          } else if (error.message.includes('Email not confirmed')) {
            Alert.alert('Email Not Verified', 'Please check your email and click the confirmation link before signing in.');
          } else {
            Alert.alert('Sign In Error', error.message);
          }
        } else {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (e) {
      setIsLoading(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleGoogleAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const { error } = await signInWithGoogle();
      
      // Note: For OAuth, this returns immediately as the browser opens.
      // The actual auth completion happens via callback/deep link.
      // Don't set loading state for OAuth - it confuses users.
      
      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Authentication Error', error.message);
      }
      // If no error, OAuth flow is starting - browser will open
    } catch (e) {
      console.error('Google auth error:', e);
      Alert.alert('Error', 'Failed to start Google sign-in. Please try again.');
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
      <View style={styles.loadingContainer}>
        <CLOLogo size={80} />
        <ActivityIndicator size="small" color={COLORS.sage} style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo and Branding */}
        <View style={styles.logoSection}>
          <CLOLogo size={140} />
          <Text style={styles.brandName}>CLO</Text>
          <Text style={styles.tagline}>Chief Life Officer</Text>
        </View>

        {/* Welcome Text */}
        <Text style={styles.title}>
          {isSignUp ? 'Create Your Sanctuary' : 'Welcome Back'}
        </Text>

        {/* Form */}
        <View style={styles.form}>
          {isSignUp && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#8B9A7D"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                editable={!isLoading}
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8B9A7D"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8B9A7D"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleEmailAuth}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.cream} />
            ) : (
              <Text style={styles.primaryButtonText}>
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
            style={[styles.button, styles.secondaryButton, isLoading && styles.buttonDisabled]}
            onPress={handleGoogleAuth}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Continue with Google</Text>
          </TouchableOpacity>
        </View>

        {/* Toggle Sign In/Up */}
        <TouchableOpacity onPress={toggleMode} disabled={isLoading} style={styles.toggleButton}>
          <Text style={styles.toggleText}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <Text style={styles.toggleTextBold}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.cream,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '300',
    color: COLORS.navy,
    letterSpacing: 8,
    marginTop: 16,
  },
  tagline: {
    fontSize: 14,
    color: COLORS.sage,
    letterSpacing: 2,
    marginTop: 4,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 24,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    color: COLORS.navy,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 154, 125, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.navy,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: COLORS.terracotta,
    shadowOpacity: 0.08,
  },
  primaryButtonText: {
    color: COLORS.cream,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryButtonText: {
    color: COLORS.terracotta,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(139, 154, 125, 0.3)',
  },
  dividerText: {
    color: COLORS.sage,
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButton: {
    marginTop: 24,
    padding: 8,
  },
  toggleText: {
    color: COLORS.sage,
    textAlign: 'center',
    fontSize: 15,
  },
  toggleTextBold: {
    color: COLORS.terracotta,
    fontWeight: '600',
  },
});
