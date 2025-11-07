import React from 'react';
import { Image, StyleSheet, View, ViewStyle } from 'react-native';
import { borderRadius } from '@/theme';

export interface LogoProps {
  size?: number;
  style?: ViewStyle;
}

/**
 * Logo Component - Sistema de Design Bubblegum
 *
 * Logo da Nossa Maternidade.
 * Usa imagem real da URL fornecida.
 */
export const Logo: React.FC<LogoProps> = ({ size = 80, style }) => {
  return (
    <View
      style={[styles.container, { width: size, height: size }, style]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel="Logo da Nossa Maternidade"
    >
      <Image
        source={{ uri: 'https://i.imgur.com/jzb0IgO.jpg' }}
        style={[styles.image, { width: size, height: size, borderRadius: borderRadius.lg }]}
        resizeMode="contain"
        defaultSource={require('../../assets/logo.png')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

