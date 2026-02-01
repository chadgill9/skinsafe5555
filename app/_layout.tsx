/**
 * Root Layout for SkinSafe
 * Uses expo-router for navigation
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { trackEvent } from '../src/lib/analytics';
import { colors, typography } from '../src/ui';

export default function RootLayout() {
  useEffect(() => {
    trackEvent('app_open');
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: true,
          gestureEnabled: true,
          headerBackVisible: true,
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.accent,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
            color: colors.textPrimary,
            ...Platform.select({
              ios: {
                letterSpacing: -0.3,
              },
              default: {},
            }),
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'SkinSafe',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="preferences"
          options={{
            title: 'Your Preferences',
            presentation: 'modal',
            headerShown: true,
            gestureEnabled: true,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="scan"
          options={{
            title: 'Scan Product',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            title: 'Results',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="saved"
          options={{
            title: 'Saved Products',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="submit-product"
          options={{
            title: 'Add Product',
            presentation: 'modal',
            headerShown: true,
            gestureEnabled: true,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}
