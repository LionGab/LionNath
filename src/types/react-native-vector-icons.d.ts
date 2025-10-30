declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  export default class MaterialCommunityIcons extends Component<TextProps & { name: string; size?: number; color?: string }> {}
}
