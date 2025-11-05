/**
 * Checklist de Performance - Nossa Maternidade
 * Verifique se seu código segue todas as otimizações
 */

// ==================== COMPONENTES ====================

// ✅ Componentes pesados memoizados
export const MessageItem = React.memo<MessageItemProps>(({ message, onPress }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.message.id === nextProps.message.id;
});

// ✅ Handlers memoizados
const handleSend = useCallback(() => {
  if (!inputText.trim() || loading) return;
  sendMessage(inputText.trim());
}, [inputText, loading, sendMessage]);

// ✅ Computações pesadas memoizadas
const filteredActions = useMemo(() => {
  return QUICK_ACTIONS.filter(action => 
    action.type === userContext.type
  );
}, [userContext.type]);

// ✅ FlatList otimizada
<FlatList
  data={messages}
  renderItem={renderMessageItem}
  keyExtractor={keyExtractor}
  windowSize={10}
  maxToRenderPerBatch={10}
  initialNumToRender={10}
  removeClippedSubviews={true}
  updateCellsBatchingPeriod={50}
/>

// ==================== PERFORMANCE ====================

// ✅ Lazy loading de screens
const HomeScreen = lazy(() => import('@/screens/HomeScreen'));

// ✅ Cache de dados
const getCachedData = async (key: string) => {
  const cached = await AsyncStorage.getItem(key);
  if (cached) return JSON.parse(cached);
  // Buscar e cachear...
};

// ✅ Debounce em inputs
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    performSearch(query);
  }, 300),
  []
);

// ==================== TIPOS ====================

// ✅ Tipos explícitos (zero any)
interface UserProfile {
  id: string;
  name: string;
  type: UserType;
}

// ❌ Evitar any
const profile: any = { ... };

// ==================== MOBILE-FIRST ====================

// ✅ SafeAreaView
<SafeAreaView style={styles.container}>
  {/* Conteúdo */}
</SafeAreaView>

// ✅ Áreas de toque adequadas (44x44px mínimo)
<TouchableOpacity style={{ minHeight: 44, minWidth: 44 }}>

// ✅ KeyboardAvoidingView em formulários
<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

// ==================== LOGGING ====================

// ✅ Usar logger centralizado
import { logger } from '@/utils/logger';
logger.info('Evento', { context });
logger.error('Erro', { context }, error);

// ❌ Evitar console.log
console.log('Debug'); // Use logger.debug()

// ==================== VALIDAÇÕES ====================

// ✅ Validações centralizadas
import { validateOnboardingData } from '@/utils/validation';
const result = validateOnboardingData(data);
if (!result.isValid) {
  // Tratar erros
}

// ==================== REPOSITÓRIOS ====================

// ✅ Usar repositórios
import { DailyPlanRepository } from '@/repositories/DailyPlanRepository';
const plan = await DailyPlanRepository.getByDate(userId, date);

// ❌ Evitar acesso direto ao Supabase na UI
const plan = await supabase.from('daily_plans').select('*')...

// ==================== CONSTANTES ====================

// ✅ Constantes centralizadas
import { MIN_TOUCHABLE_SIZE, API_TIMEOUT } from '@/constants';

// ❌ Evitar magic numbers
const timeout = 30000; // Use API_TIMEOUT

// ==================== ACESSIBILIDADE ====================

// ✅ Sempre incluir acessibilidade
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Botão enviar"
  accessibilityHint="Envia sua mensagem"
  accessibilityState={{ disabled: loading }}
>

// ==================== THEME ====================

// ✅ Usar cores do tema
import { colors, spacing, typography } from '@/theme/colors';
<View style={{ backgroundColor: colors.primary, padding: spacing.lg }}>

// ❌ Evitar cores hardcoded
<View style={{ backgroundColor: '#DD5B9A', padding: 16 }}>

// ==================== ERROS ====================

// ✅ Tratamento de erros robusto
try {
  await saveData();
} catch (error) {
  logger.error('Erro ao salvar', { context }, error);
  // Fallback ou mensagem amigável
}

// ==================== OFFLINE ====================

// ✅ Suporte offline
import { saveOfflineMessage, syncPendingMessages } from '@/utils/offlineStorage';

try {
  await saveMessage();
} catch (error) {
  if (isRecoverableError(error)) {
    await saveOfflineMessage(message, 'user');
  }
}

// ==================== RETRY ====================

// ✅ Retry inteligente
import { smartRetry } from '@/utils/retry';

const result = await smartRetry(
  () => apiCall(),
  { maxRetries: 3, initialDelay: 1000 },
  logger
);
