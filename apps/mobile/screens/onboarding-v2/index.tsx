/**
 * Onboarding v2 - Navigator
 * Fluxo completo de 5 blocos com navegação e progresso
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Block1Identity } from './Block1Identity';
import { Block2Emotions } from './Block2Emotions';
import { Block3Challenges } from './Block3Challenges';
import { Block4Support } from './Block4Support';
import { Block5Expectations } from './Block5Expectations';

export type OnboardingV2StackParamList = {
  Block1Identity: undefined;
  Block2Emotions: undefined;
  Block3Challenges: undefined;
  Block4Support: undefined;
  Block5Expectations: undefined;
};

const Stack = createStackNavigator<OnboardingV2StackParamList>();

interface OnboardingV2NavigatorProps {
  onComplete: () => void;
}

export function OnboardingV2Navigator({ onComplete }: OnboardingV2NavigatorProps) {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#FFF8F3' }, // tokens.palette.background
        animationEnabled: true,
        gestureEnabled: false, // Prevent swipe back
      }}
      initialRouteName="Block1Identity"
    >
      <Stack.Screen name="Block1Identity">
        {({ navigation }) => (
          <Block1Identity
            onNext={() => navigation.navigate('Block2Emotions')}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Block2Emotions">
        {({ navigation }) => (
          <Block2Emotions
            onNext={() => navigation.navigate('Block3Challenges')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Block3Challenges">
        {({ navigation }) => (
          <Block3Challenges
            onNext={() => navigation.navigate('Block4Support')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Block4Support">
        {({ navigation }) => (
          <Block4Support
            onNext={() => navigation.navigate('Block5Expectations')}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Block5Expectations">
        {({ navigation }) => (
          <Block5Expectations
            onComplete={onComplete}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// Re-export components
export { Block1Identity, Block2Emotions, Block3Challenges, Block4Support, Block5Expectations };
