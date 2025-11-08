import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import Slider from '@react-native-community/slider';
import { nossaMaternidadeDesignTokens } from '@/theme/themes/v1-nossa-maternidade';

// Try to import haptics, fallback if not available
let Haptics: any = null;
try {
  Haptics = require('expo-haptics');
} catch (e) {
  // Haptics not available
}

export interface SliderInputProps {
  label?: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  showMarkers?: boolean;
  showValue?: boolean;
  hapticFeedback?: boolean;
  accessibilityLabel: string;
  testID?: string;
}

const tokens = nossaMaternidadeDesignTokens;

export function SliderInput({
  label,
  min,
  max,
  value,
  onChange,
  step = 1,
  showMarkers = true,
  showValue = true,
  hapticFeedback = true,
  accessibilityLabel,
  testID,
}: SliderInputProps) {
  const [currentValue, setCurrentValue] = useState(value);

  const handleValueChange = (newValue: number) => {
    setCurrentValue(newValue);
  };

  const handleSlidingComplete = (newValue: number) => {
    // Haptic feedback on value change
    if (hapticFeedback && Haptics && newValue !== value) {
      try {
        Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle?.Light ?? 1);
      } catch (e) {
        // Ignore haptics error
      }
    }
    onChange(newValue);
  };

  const markers = React.useMemo(() => {
    const count = (max - min) / step + 1;
    return Array.from({ length: count }, (_, i) => min + i * step);
  }, [min, max, step]);

  return (
    <View style={styles.container} testID={testID}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider as any}
          minimumValue={min}
          maximumValue={max}
          value={currentValue}
          step={step}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          minimumTrackTintColor={tokens.palette.primary}
          maximumTrackTintColor={tokens.palette.neutrals[300]}
          thumbTintColor={tokens.palette.primary}
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ min, max, now: currentValue }}
        />

        {showValue && (
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{Math.round(currentValue)}</Text>
          </View>
        )}
      </View>

      {showMarkers && (
        <View style={styles.markersContainer}>
          {markers.map((marker) => (
            <Text key={marker} style={styles.marker}>
              {marker}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: tokens.spacing.sm,
  } as ViewStyle,
  label: {
    fontSize: tokens.typography.bodyMd.fontSize,
    lineHeight: tokens.typography.bodyMd.lineHeight,
    fontWeight: tokens.typography.bodyMd.fontWeight,
    color: tokens.palette.text,
    marginBottom: tokens.spacing.xs,
  } as TextStyle,
  sliderContainer: {
    backgroundColor: tokens.palette.surface,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing.lg,
    gap: tokens.spacing.md,
  } as ViewStyle,
  slider: {
    width: '100%',
    height: 40,
  } as ViewStyle,
  valueContainer: {
    alignItems: 'center',
  } as ViewStyle,
  value: {
    fontSize: tokens.typography.headlineMd.fontSize,
    fontWeight: '600',
    color: tokens.palette.primary,
  } as TextStyle,
  markersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.xs,
  } as ViewStyle,
  marker: {
    fontSize: tokens.typography.caption.fontSize,
    color: tokens.palette.neutrals[600],
  } as TextStyle,
});
