import type { SupabaseClient } from "@supabase/supabase-js"

export interface MemoryEntry {
  id: string
  contentText: string
  contentType: string
  metadata: any
  similarity: number
  createdAt: string
}

/**
 * MemoryManager - Gerencia memória contextual das conversas
 * Armazena e busca informações relevantes para manter contexto no chat
 */
export class MemoryManager {
  private supabase: SupabaseClient
  private userId: string

  constructor(supabase: SupabaseClient, userId: string) {
    this.supabase = supabase
    this.userId = userId
  }

  /**
   * Armazenar uma nova memória
   */
  async storeMemory(
    contentText: string,
    contentType: "conversation" | "diary" | "post" | "onboarding",
    contentId?: string,
    metadata: any = {},
  ) {
    try {
      // TODO: Gerar embedding com AI SDK quando configurado
      // Por enquanto, armazenar sem embedding (busca full-text later)

      // Armazenar no banco de dados
      const { data, error } = await this.supabase
        .from("memory_embeddings")
        .insert({
          user_id: this.userId,
          content_type: contentType,
          content_id: contentId,
          content_text: contentText,
          metadata: metadata,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("[MemoryManager] Erro ao armazenar memória:", error)
      throw error
    }
  }

  /**
   * Buscar memórias similares (usando busca por texto)
   */
  async searchMemories(query: string, limit = 10, threshold = 0.7): Promise<MemoryEntry[]> {
    try {
      // TODO: Implementar busca semântica com embedding quando AI SDK estiver ready

      // Por enquanto, fazer busca por Full-Text Search
      const { data, error } = await this.supabase
        .from("memory_embeddings")
        .select("*")
        .eq("user_id", this.userId)
        .or(
          `content_text.ilike.%${query}%,metadata.ilike.%${query}%`,
        )
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error

      return (
        data?.map((item) => ({
          id: item.id,
          contentText: item.content_text,
          contentType: item.content_type,
          metadata: item.metadata,
          similarity: 1.0, // Placeholder
          createdAt: item.created_at,
        })) || []
      )
    } catch (error) {
      console.error("[MemoryManager] Erro ao buscar memórias:", error)
      return []
    }
  }

  /**
   * Buscar memórias de um período específico
   */
  async getMemoriesFromPeriod(daysAgo: number, limit = 50): Promise<MemoryEntry[]> {
    try {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysAgo)

      const { data, error } = await this.supabase
        .from("memory_embeddings")
        .select("*")
        .eq("user_id", this.userId)
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error

      return (
        data?.map((item) => ({
          id: item.id,
          contentText: item.content_text,
          contentType: item.content_type,
          metadata: item.metadata,
          similarity: 1.0,
          createdAt: item.created_at,
        })) || []
      )
    } catch (error) {
      console.error("[MemoryManager] Erro ao buscar período:", error)
      return []
    }
  }

  /**
   * Obter contexto completo para IA
   * Combina memórias recentes + relevantes + resumidas
   */
  async getComprehensiveContext(currentQuery: string, daysBack = 90): Promise<string> {
    try {
      // Buscar memórias recentes (últimos 7 dias)
      const recentMemories = await this.getMemoriesFromPeriod(7, 10)

      // Buscar memórias relevantes semanticamente
      const relevantMemories = await this.searchMemories(currentQuery, 15, 0.75)

      // Buscar resumos de contexto de períodos anteriores
      const { data: contextSummaries } = await this.supabase
        .from("ai_memory_context")
        .select("*")
        .eq("user_id", this.userId)
        .gte("start_date", new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString())
        .order("start_date", { ascending: false })

      // Construir contexto abrangente
      let context = "=== CONTEXTO HISTÓRICO DA USUÁRIA ===\n\n"

      if (contextSummaries && contextSummaries.length > 0) {
        context += "## Resumos de Períodos Anteriores:\n"
        contextSummaries.forEach((summary: any) => {
          context += `\n### ${summary.start_date} a ${summary.end_date}:\n${summary.summary}\n`
          if (summary.key_events) {
            context += `Eventos importantes: ${JSON.stringify(summary.key_events)}\n`
          }
        })
      }

      if (recentMemories.length > 0) {
        context += "\n## Memórias Recentes (últimos 7 dias):\n"
        recentMemories.forEach((memory) => {
          context += `- [${memory.createdAt}] ${memory.contentText}\n`
        })
      }

      if (relevantMemories.length > 0) {
        context += "\n## Memórias Relevantes ao Contexto Atual:\n"
        relevantMemories.forEach((memory) => {
          context += `- [${memory.createdAt}] (relevância: ${(memory.similarity * 100).toFixed(0)}%) ${memory.contentText}\n`
        })
      }

      return context
    } catch (error) {
      console.error("[MemoryManager] Erro ao obter contexto:", error)
      return ""
    }
  }

  /**
   * Gerar resumo periódico (executar semanal/mensalmente)
   */
  async generatePeriodSummary(startDate: Date, endDate: Date) {
    try {
      // Buscar todas as memórias do período
      const { data: memories } = await this.supabase
        .from("memory_embeddings")
        .select("*")
        .eq("user_id", this.userId)
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())

      if (!memories || memories.length === 0) return null

      // Combinar todo o conteúdo
      const allContent = memories.map((m: any) => m.content_text).join("\n\n")

      // TODO: Gerar resumo com IA quando configurado
      const summary = await this.summarizeContent(allContent)

      // Armazenar resumo
      const { data, error } = await this.supabase
        .from("ai_memory_context")
        .insert({
          user_id: this.userId,
          time_period: "custom",
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          summary: summary,
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("[MemoryManager] Erro ao gerar resumo:", error)
      throw error
    }
  }

  /**
   * Sumarizar conteúdo (placeholder)
   */
  private async summarizeContent(content: string): Promise<string> {
    // TODO: Implementar sumarização com IA (Claude ou Gemini)
    // Por enquanto, retornar os primeiros 500 caracteres
    return content.substring(0, 500) + "..."
  }

  /**
   * Limpar memórias antigas (manutenção)
   */
  async cleanOldMemories(daysOld: number = 90): Promise<void> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysOld)

      const { error } = await this.supabase
        .from("memory_embeddings")
        .delete()
        .eq("user_id", this.userId)
        .lt("created_at", cutoffDate.toISOString())

      if (error) throw error
    } catch (error) {
      console.error("[MemoryManager] Erro ao limpar memórias antigas:", error)
    }
  }
}
