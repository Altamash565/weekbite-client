import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BackButton } from '../components/back-button';
import { AuthInput } from '../components/auth-input';
import { AuthButton } from '../components/auth-button';
import { colors, fonts, spacing, typography } from '../../../shared/theme/tokens';

interface SignUpScreenProps {
  onBack: () => void;
  onNavigateToSignIn: () => void;
}

export const SignUpScreen: React.FC<SignUpScreenProps> = ({
  onBack,
  onNavigateToSignIn,
}) => {
  const [name, setName] = useState('Alex Morgan');
  const [email, setEmail] = useState('alex.morgan@email.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const validate = () => {
    const errs: { name?: string; email?: string; password?: string } = {};
    if (!name.trim()) {
      errs.name = 'Please enter your name';
    }
    if (!email.trim()) {
      errs.email = 'Please enter your email';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Please enter a password';
    } else if (password.length < 8) {
      errs.password = 'Use at least 8 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    // Simulate sign up
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Account Created', `Welcome to WeekBite, ${name}!`);
    }, 1000);
  };

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar with Back Button */}
          <View style={styles.topBar}>
            <BackButton onPress={onBack} />
          </View>

          {/* Heading */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Make room for a{'\n'}simpler week
            </Text>
            <Text style={styles.subtitle}>
              A few details, then you’re ready to plan.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
              placeholder="Create a password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              isPassword
              helperText="Use at least 8 characters."
              error={errors.password}
            />

            <AuthButton
              title="Create account"
              variant="primary"
              onPress={handleSignUp}
              loading={loading}
              style={styles.submitButton}
            />
          </View>

          {/* Bottom Switch Link */}
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onNavigateToSignIn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.footerLink}>
                Already have an account?{' '}
                <Text style={styles.highlightLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topBar: {
    marginBottom: 28,
  },
  header: {
    marginBottom: 32,
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
    marginBottom: 28,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 12,
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
