import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthButton } from '../components/auth-button';
import { colors, fonts, spacing } from '../../../shared/theme/tokens';

interface WelcomeScreenProps {
  onNavigateToSignUp: () => void;
  onNavigateToSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onNavigateToSignUp,
  onNavigateToSignIn,
}) => {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Top Hero Image Section */}
      <ImageBackground
        source={{
          uri: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1200&auto=format&fit=crop',
        }}
        style={styles.heroImage}
        resizeMode="cover"
      >
        <View style={styles.heroOverlay}>
          <View style={styles.heroTextContainer}>
            <Text style={styles.heroTitle}>
              <Text style={styles.highlightText}>Discover </Text>
              <Text style={styles.whiteText}>Delicious</Text>
            </Text>
            <Text style={styles.heroSubtitle}>
              Plan your meals, keep your recipes in one place, and take a simpler grocery list with
              you.
            </Text>
          </View>
        </View>
      </ImageBackground>

      {/* Bottom Content Area */}
      <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.bottomSheet}>
        <View style={styles.contentContainer}>
          {/* Brand Row */}
          <View style={styles.brandRow}>
            <View style={styles.logoSquircle}>
              <Ionicons name="restaurant-outline" size={24} color={colors.primaryDark} />
            </View>
            <View style={styles.brandTextContainer}>
              <Text style={styles.brandName}>WeekBite</Text>
              <Text style={styles.brandTagline}>Good meals. One week at a time.</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <AuthButton
              title="Create account"
              variant="primary"
              onPress={onNavigateToSignUp}
            />
            <AuthButton
              title="Sign in"
              variant="secondary"
              onPress={onNavigateToSignIn}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroImage: {
    flex: 1.35,
    width: '100%',
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.screenMargin,
    paddingBottom: 24,
  },
  heroTextContainer: {
    width: '100%',
  },
  heroTitle: {
    fontFamily: fonts.bold,
    fontSize: 32,
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  highlightText: {
    color: colors.primary,
  },
  whiteText: {
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: 'rgba(255, 255, 255, 0.92)',
  },
  bottomSheet: {
    flex: 0.95,
    backgroundColor: colors.background,
    justifyContent: 'space-between',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.screenMargin,
    paddingTop: 24,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  logoSquircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  brandTextContainer: {
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fonts.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  brandTagline: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 8,
  },
});
