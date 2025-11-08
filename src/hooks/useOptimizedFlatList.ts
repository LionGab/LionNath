/**
 * Hook para FlatList otimizada
 *
 * Configurações otimizadas padrão para todas as FlatLists
 */

import { useMemo } from 'react';
import { FlatListProps, ListRenderItem } from 'react-native';

export interface OptimizedFlatListConfig<T> {
  windowSize?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  initialNumToRender?: number;
  removeClippedSubviews?: boolean;
  getItemLayout?: FlatListProps<T>['getItemLayout'];
}

/**
 * Retorna props otimizadas para FlatList
 */
export function useOptimizedFlatList<T>(
  data: T[],
  renderItem: ListRenderItem<T>,
  config?: OptimizedFlatListConfig<T>
): Partial<FlatListProps<T>> {
  return useMemo(
    () => ({
      data,
      renderItem,
      windowSize: config?.windowSize ?? 10,
      maxToRenderPerBatch: config?.maxToRenderPerBatch ?? 10,
      updateCellsBatchingPeriod: config?.updateCellsBatchingPeriod ?? 50,
      initialNumToRender: config?.initialNumToRender ?? 10,
      removeClippedSubviews: config?.removeClippedSubviews ?? true,
      getItemLayout: config?.getItemLayout,
    }),
    [data, renderItem, config]
  );
}

/**
 * Key extractor otimizado (usar ID ou índice)
 */
export const getOptimizedKeyExtractor = <T extends { id?: string | number }>(item: T, index: number): string => {
  return item.id !== undefined ? String(item.id) : `item-${index}`;
};
