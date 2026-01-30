/**
 * Root Layout for SkinSafe
 * Uses expo-router for navigation
 */

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { trackEvent } from '../src/lib/analytics';

export default function RootLayout() {
  useEffect(() => {
    trackEvent('app_open');
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#1a1a1a',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#f8f9fa',
          },
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
          }}
        />
        <Stack.Screen
          name="scan"
          options={{
            title: 'Scan Product',
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            title: 'Results',
          }}
        />
        <Stack.Screen
          name="saved"
          options={{
            title: 'Saved Products',
          }}
        />
        <Stack.Screen
          name="submit-product"
          options={{
            title: 'Add Product',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
