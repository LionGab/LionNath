import type { NossaMaternidadeDesignTokens } from '../themes/v1-nossa-maternidade';

type DesignTokens = NossaMaternidadeDesignTokens;

interface NativeWindTokens {
  colors: Record<string, string>;
  spacing: DesignTokens['spacing'];
  borderRadius: DesignTokens['radius'];
  boxShadow: {
    soft: string;
    medium: string;
  };
  elevation: {
    soft: number;
    medium: number;
  };
}

export declare const nossaMaternidadeTokens: {
  palette: DesignTokens['palette'];
  typography: DesignTokens['typography'];
  spacing: DesignTokens['spacing'];
  radius: DesignTokens['radius'];
  shadow: DesignTokens['shadow'];
  nativewind: NativeWindTokens;
};

export declare function getNativeWindColor(token: string): string | undefined;

export declare function getNativeWindSpacing(token: string): number | undefined;

export declare function getNativeWindRadius(token: string): number | undefined;

