/**
 * Expo App Configuration
 *
 * Processa variáveis de ambiente e retorna configuração dinâmica
 * Necessário porque app.json não processa process.env
 *
 * ⚠️ NOTA: Este projeto usa Prebuild (tem pastas android/ios nativas).
 * Quando as pastas nativas estão presentes, o EAS Build não sincroniza
 * automaticamente as seguintes propriedades do app.config.js:
 * - orientation, icon, userInterfaceStyle, splash, ios, android, scheme, plugins
 *
 * Essas configurações devem estar nos arquivos nativos (AndroidManifest.xml, Info.plist, etc.)
 * ou usar `npx expo prebuild` para regenerar as pastas nativas a partir deste config.
 *
 * Para desenvolvimento com Expo Go, essas configurações funcionam normalmente.
 */

module.exports = {
  expo: {
    name: 'Nossa Maternidade',
    slug: 'nossa-maternidade',
    version: '1.0.0',
    // Hermes Engine - JavaScript engine otimizado para React Native
    jsEngine: 'hermes',
    // Runtime version para compatibilidade com EAS Update
    // Baseado na versão do React Native (0.81.5) para garantir compatibilidade do bytecode Hermes
    runtimeVersion: '0.81.5',
    // ⚠️ Estas propriedades não são sincronizadas automaticamente quando android/ios existem
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#FFE5F1',
    },
    assetBundlePatterns: ['**/*'],
    // ⚠️ Configurações iOS - não sincronizadas automaticamente com pastas nativas
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.nossa.maternidade',
    },
    // ⚠️ Configurações Android - não sincronizadas automaticamente com pastas nativas
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#FFE5F1',
      },
      package: 'com.nossa.maternidade',
      permissions: ['RECORD_AUDIO', 'INTERNET'],
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          data: [
            {
              scheme: 'nossa-maternidade',
              host: 'auth',
            },
          ],
          category: ['BROWSABLE', 'DEFAULT'],
        },
      ],
    },
    // ⚠️ Scheme - não sincronizado automaticamente com pastas nativas
    scheme: 'nossa-maternidade',
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      // Configurações de viewport para garantir formato mobile no browser
      // iPhone 13: 390x844 (device-width)
      meta: {
        viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'default',
        'theme-color': '#FFE5F1',
      },
    },
    plugins: ['expo-notifications', 'expo-av', '@react-native-voice/voice'],
    extra: {
      // Sentry DSN - processa variáveis de ambiente corretamente
      sentry: {
        dsn: process.env.SENTRY_DSN || process.env.EXPO_PUBLIC_SENTRY_DSN || '',
      },
      // Outras variáveis de ambiente para acesso via Constants.expoConfig.extra
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      // Expo Project ID para notificações push
      projectId: process.env.EXPO_PUBLIC_PROJECT_ID || process.env.EAS_PROJECT_ID || '',
      // EAS Project ID (se configurado)
      eas: {
        projectId: process.env.EAS_PROJECT_ID || process.env.EXPO_PUBLIC_PROJECT_ID || '',
      },
    },
  },
};
