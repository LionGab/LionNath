# 💰 Recomendações de IAs Econômicas - Nossa Maternidade

**Última atualização**: 2025-01-XX  
**Objetivo**: Minimizar custos mantendo qualidade

---

## 📊 Resumo Executivo

| Funcionalidade        | IA Recomendada            | Custo/Mês\* | Justificativa                           |
| --------------------- | ------------------------- | ----------- | --------------------------------------- |
| **NathIA Chat**       | Gemini 1.5 Flash          | $5-15       | Barato, rápido, bom para conversas      |
| **Memória/Contexto**  | Gemini 1.5 Flash          | $2-5        | Embeddings baratos, contexto longo      |
| **Notícias/Trending** | Perplexity API            | $10-20      | Especializado em busca em tempo real    |
| **Moderação**         | Heurística + Gemini Flash | $1-3        | 90% heurística, IA só quando necessário |
| **Curadoria**         | Gemini 1.5 Flash          | $3-8        | Excelente para resumos e transformações |
| **Triagem Risco**     | Heurística + Gemini Flash | $1-2        | Detecção de keywords primeiro           |
| **Recomendações**     | Heurística pura           | $0          | Algoritmo já implementado               |
| **Dicas Diárias**     | Gemini 1.5 Flash          | $2-5        | Geração simples e barata                |

**Total estimado**: $24-58/mês para 1000 usuários ativos

\* Baseado em uso médio de 10 mensagens/usuário/mês

---

## 🎯 Recomendações Detalhadas

### 1. **NathIA Chat Empático** ✅ Gemini 1.5 Flash

**Por quê Gemini Flash?**

- **Custo**: $0.075/1M tokens input, $0.30/1M tokens output
- **Velocidade**: Respostas em <2s
- **Qualidade**: Suficiente para conversas empáticas
- **Contexto**: 1M tokens (memória longa)

**Alternativa mais barata**: Gemini 1.5 Pro (só se precisar de mais qualidade)
**Alternativa gratuita**: Gemini 1.5 Flash (free tier: 15 RPM)

**Implementação**:

```typescript
// Usar Gemini 1.5 Flash para chat principal
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: SYSTEM_PROMPTS.CHAT_EMPATICO,
});
```

---

### 2. **Memória/Contexto** ✅ Gemini 1.5 Flash

**Por quê Gemini Flash?**

- Embeddings baratos (ou usar vector store do Supabase)
- Contexto longo (1M tokens) = menos chamadas
- Cache de embeddings reduz custos

**Estratégia de economia**:

- Cache embeddings por 7 dias
- Usar vector search do Supabase (grátis até 500MB)
- Só chamar IA quando contexto muda significativamente

**Implementação**:

```typescript
// Embeddings com Gemini (ou Supabase Vector)
const embedding = await model.embedContent(text);
// Armazenar no Supabase Vector Store
```

---

### 3. **Notícias/Trending-5min** ✅ Perplexity API

**Por quê Perplexity?**

- Especializado em busca em tempo real
- Citações e fontes confiáveis
- Custo: $0.001/request (muito barato)

**Alternativa**: Gemini Flash com web search (mais barato mas menos preciso)

**Implementação**:

```typescript
// Perplexity para trending/notícias
const response = await perplexity.chat.completions.create({
  model: 'pplx-70b-online', // ou pplx-7b-online (mais barato)
  messages: [{ role: 'user', content: 'Notícias sobre maternidade hoje' }],
});
```

---

### 4. **Moderação de Conteúdo** ✅ Heurística + Gemini Flash (quando necessário)

**Estratégia híbrida**:

1. **90% heurística** (regex, keywords) - **GRÁTIS**
2. **10% Gemini Flash** - só quando heurística não decide

**Por quê?**

- Maioria dos posts é segura (heurística aprova/rejeita)
- IA só para casos ambíguos (zona cinzenta)
- Reduz custos em 90%

**Implementação**:

```typescript
// 1. Heurística primeiro (grátis)
const judgementScore = analyzeJudgementPatterns(message); // regex
const toxicityScore = analyzeToxicityPatterns(message); // regex

// 2. IA só se necessário
if (judgementScore > 0.3 && judgementScore < 0.7) {
  // Zona cinzenta - usar IA
  const aiAnalysis = await geminiFlash.analyzeModeration(message);
}
```

**Custo**: ~$1-3/mês (só casos ambíguos)

---

### 5. **Curadoria de Conteúdo** ✅ Gemini 1.5 Flash

**Funcionalidades**:

- Resumos (5 linhas)
- Versão "5 minutos"
- Checklists
- Simplificação de linguagem

**Por quê Gemini Flash?**

- Excelente para transformação de texto
- Barato para resumos
- Rápido

**Estratégia de economia**:

- Cache resumos por 30 dias
- Processar em batch (múltiplos artigos de uma vez)
- Usar streaming para respostas longas

**Custo**: ~$3-8/mês

---

### 6. **Triagem de Risco** ✅ Heurística + Gemini Flash (quando necessário)

**Estratégia**:

1. **Keywords de risco** (regex) - detecta 95% dos casos
2. **Gemini Flash** - só para casos ambíguos ou refinamento

**Por quê?**

- Keywords detectam urgências claras
- IA só para análise mais profunda quando necessário
- Reduz custos drasticamente

**Implementação**:

```typescript
// 1. Keywords primeiro
const riskKeywords = detectRiskKeywords(message); // regex

// 2. IA só se necessário
if (riskKeywords.length > 0 && confidence < 0.8) {
  const aiAnalysis = await geminiFlash.analyzeRisk(message);
}
```

**Custo**: ~$1-2/mês (só casos ambíguos)

---

### 7. **Recomendações Personalizadas** ✅ Heurística Pura

**Por quê sem IA?**

- Algoritmo já implementado funciona bem
- Match por stage, interests, activity
- Não precisa de IA para isso

**Quando usar IA?**

- Apenas para gerar "razão" da recomendação (texto explicativo)
- Usar Gemini Flash para isso (muito barato)

**Custo**: $0 (heurística) + $0.50/mês (textos explicativos)

---

### 8. **Dicas Diárias** ✅ Gemini 1.5 Flash

**Por quê Gemini Flash?**

- Geração simples de texto
- Barato para conteúdo curto
- Cache por usuário reduz chamadas

**Estratégia de economia**:

- Gerar em batch (todas as dicas de uma vez)
- Cache por usuário/stage (reutilizar dicas similares)
- Usar templates + IA para personalização

**Custo**: ~$2-5/mês

---

## 💡 Estratégias de Economia

### 1. **Cache Agressivo**

- Cache embeddings por 7 dias
- Cache resumos por 30 dias
- Cache dicas por usuário/stage

### 2. **Heurística Primeiro**

- Sempre usar regex/keywords antes de IA
- IA só para casos ambíguos
- Reduz custos em 80-90%

### 3. **Batch Processing**

- Processar múltiplos itens de uma vez
- Reduz overhead de API calls
- Mais eficiente

### 4. **Streaming**

- Usar streaming para respostas longas
- Melhor UX + economia de tokens

### 5. **Free Tiers**

- Gemini Flash: 15 RPM free
- Perplexity: 5 requests/day free
- Usar free tiers para desenvolvimento/testes

---

## 📈 Projeção de Custos

### Cenário Conservador (500 usuários ativos)

- NathIA Chat: $3-8/mês
- Memória: $1-3/mês
- Notícias: $5-10/mês
- Moderação: $0.50-1/mês
- Curadoria: $1-4/mês
- Triagem: $0.50-1/mês
- Recomendações: $0.25/mês
- Dicas: $1-3/mês

**Total**: $12-30/mês

### Cenário Médio (1000 usuários ativos)

- NathIA Chat: $5-15/mês
- Memória: $2-5/mês
- Notícias: $10-20/mês
- Moderação: $1-3/mês
- Curadoria: $3-8/mês
- Triagem: $1-2/mês
- Recomendações: $0.50/mês
- Dicas: $2-5/mês

**Total**: $24-58/mês

### Cenário Alto (5000 usuários ativos)

- NathIA Chat: $25-75/mês
- Memória: $10-25/mês
- Notícias: $50-100/mês
- Moderação: $5-15/mês
- Curadoria: $15-40/mês
- Triagem: $5-10/mês
- Recomendações: $2-5/mês
- Dicas: $10-25/mês

**Total**: $122-295/mês

---

## 🔄 Alternativas Mais Baratas

### Se precisar reduzir ainda mais:

1. **NathIA Chat**: Usar Gemini 1.5 Flash free tier (15 RPM) + fila
2. **Notícias**: Gemini Flash com web search (mais barato que Perplexity)
3. **Moderação**: 100% heurística (sem IA)
4. **Curadoria**: Templates + IA só para personalização
5. **Triagem**: 100% keywords (sem IA)

**Custo mínimo**: $5-15/mês (1000 usuários)

---

## ✅ Recomendação Final

**Stack recomendado**:

- **Gemini 1.5 Flash**: NathIA, Memória, Curadoria, Dicas
- **Perplexity API**: Notícias/Trending
- **Heurística**: Moderação, Triagem, Recomendações (com IA opcional)

**Custo esperado**: $24-58/mês para 1000 usuários ativos

**Próximos passos**:

1. Implementar cache agressivo
2. Usar heurística primeiro em tudo
3. Monitorar custos reais
4. Ajustar conforme necessário

---

## 📚 Referências

- [Gemini Pricing](https://ai.google.dev/pricing)
- [Perplexity Pricing](https://www.perplexity.ai/pricing)
- [Supabase Vector Store](https://supabase.com/docs/guides/ai/vector-columns)

---

**Última atualização**: 2025-01-XX  
**Mantido por**: Time Nossa Maternidade
