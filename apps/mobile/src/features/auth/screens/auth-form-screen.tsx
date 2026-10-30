import React, { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BackButton } from '../components/back-button';
import { AuthInput } from '../components/auth-input';
import { AuthButton } from '../components/auth-button';
import { colors, fonts, spacing, typography } from '../../../shared/theme/tokens';

type AuthMode = 'signin' | 'signup';

interface AuthFormScreenProps {
  initialMode?: AuthMode;
  onBack: () => void;
}

export const AuthFormScreen: React.FC<AuthFormScreenProps> = ({
  initialMode = 'signin',
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>(initialMode);

  // Form states
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@email.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // Animation values for fluid transition
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const switchMode = (newMode: AuthMode) => {
    if (newMode === mode) return;

    // Fluid out-transition
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: newMode === 'signup' ? -10 : 10,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMode(newMode);
      setErrors({});
      slideAnim.setValue(newMode === 'signup' ? 10 : -10);

      // Fluid in-transition
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const validate = () => {
    const errs: { name?: string; email?: string; password?: string } = {};
    if (mode === 'signup' && !name.trim()) {
      errs.name = 'Please enter your name';
    }
    if (!email.trim()) {
      errs.email = 'Please enter your email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = mode === 'signup' ? 'Please enter a password' : 'Please enter your password';
    } else if (mode === 'signup' && password.length < 8) {
      errs.password = 'Use at least 8 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (mode === 'signin') {
        Alert.alert('Signed In', `Welcome back, ${email}!`);
      } else {
        Alert.alert('Account Created', `Welcome to WeekBite, ${name}!`);
      }
    }, 1000);
  };

  const isSignIn = mode === 'signin';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <StatusBar style="dark" />

      {/* Persistent Top Bar: NEVER unmounts or jumps when switching modes */}
      <View style={styles.topBar}>
        <BackButton onPress={onBack} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 16, 28) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Body: Smooth cross-fade and subtle slide */}
          <Animated.View
            style={[
              styles.animatedBody,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {isSignIn ? 'Welcome back' : 'Make room for a\nsimpler week'}
              </Text>
              <Text style={styles.subtitle}>
                {isSignIn
                  ? 'Sign in to pick up your week where you left off.'
                  : 'A few details, then you’re ready to plan.'}
              </Text>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
              {!isSignIn && (
                <AuthInput
                  label="Name"
                  placeholder="Alex Morgan"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  error={errors.name}
                />
              )}

              <AuthInput
                label="Email"
                placeholder="alex.morgan@email.com"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                keyboardType="email-address"
                error={errors.email}
              />

              <AuthInput
                label="Password"
                placeholder={isSignIn ? 'Enter your password' : 'Create a password'}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                isPassword
                helperText={!isSignIn ? 'Use at least 8 characters.' : undefined}
                error={errors.password}
              />

              <AuthButton
                title={isSignIn ? 'Sign in' : 'Create account'}
                variant="primary"
                onPress={handleSubmit}
                loading={loading}
                style={styles.submitButton}
              />

              {isSignIn && (
                <Text style={styles.caption}>Your recipes and plans, all in one place.</Text>
              )}
            </View>

            {/* Bottom Switch Link */}
            <View style={styles.footer}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => switchMode(isSignIn ? 'signup' : 'signin')}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                {isSignIn ? (
                  <Text style={styles.footerLink}>
                    New to WeekBite? <Text style={styles.highlightLink}>Create account</Text>
                  </Text>
                ) : (
                  <Text style={styles.footerLink}>
                    Already have an account? <Text style={styles.highlightLink}>Sign in</Text>
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: 16,
    zIndex: 10,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenMargin,
  },
  animatedBody: {
    flex: 1,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 32,
    color: colors.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  caption: {
    fontFamily: fonts.regular,
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerLink: {
    fontFamily: fonts.regular,
    fontSize: 14.5,
    color: colors.primaryDark,
  },
  highlightLink: {
    fontFamily: fonts.semiBold,
    color: colors.primaryDark,
  },
});
