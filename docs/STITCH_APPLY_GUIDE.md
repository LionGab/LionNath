# 🎨 Guia de Aplicação - Referências Stitch

## 📋 Como Aplicar as Referências do Stitch

Para aplicar as referências do projeto Stitch ao nosso design system, siga estes passos:

### 1. **Coletar Informações do Stitch**

Acesse o projeto no Stitch e colete:

#### **Cores:**

- Cor primária (Primary)
- Cor secundária (Accent/Secondary)
- Cores de feedback (Success, Warning, Error, Info)
- Cores de background e surface
- Gradientes específicos

#### **Tipografia:**

- Família de fontes (geralmente "Google Sans" no Stitch)
- Escala de tamanhos (display, h1-h6, body, caption, etc.)
- Pesos de fonte (300, 400, 500, 600, 700)
- Line heights

#### **Espaçamentos:**

- Sistema de espaçamento (base 4 ou 8)
- Valores de padding e margin padrão

#### **Outros:**

- Border radius
- Elevações/sombras
- Componentes específicos

---

### 2. **Preencher o Arquivo de Configuração**

Edite `src/config/stitch-references.ts` e preencha os valores:

```typescript
export const stitchReferences: StitchDesignTokens = {
  colors: {
    primary: '#SEU_VALOR_AQUI',
    secondary: '#SEU_VALOR_AQUI',
    // ... outros valores
  },
  typography: {
    fontFamily: {
      primary: 'Google Sans', // ou outra fonte
    },
    scale: {
      display: 40,
      h1: 32,
      // ... outros tamanhos
    },
    // ... outros valores
  },
  // ... outros tokens
};
```

---

### 3. **Aplicar as Referências**

Após preencher os valores, execute:

```bash
npm run apply-stitch-references
```

Ou manualmente atualize os arquivos:

- `src/theme/designSystemV1.ts` - Cores e tokens principais
- `src/theme/themes/v1-nossa-maternidade.ts` - Tema específico

---

### 4. **Verificar Aplicação**

1. Verifique se as cores foram aplicadas corretamente
2. Teste os componentes principais
3. Valide acessibilidade (contraste WCAG 2.1 AA)
4. Teste em diferentes tamanhos de tela

---

## ✅ O que já foi implementado:

1. ✅ Gradientes rosa suaves (`pinkSoft`) adicionados ao tema
2. ✅ Foto da influenciadora no DailyInsightCard (`nat1.png`)
3. ✅ Cores centralizadas no sistema de design
4. ✅ Estrutura pronta para receber novas referências
5. ✅ Arquivo de configuração criado (`src/config/stitch-references.ts`)

---

## 📝 Próximos Passos:

1. **Coletar valores do Stitch** - Preencha `stitch-references.ts`
2. **Aplicar referências** - Execute o script ou atualize manualmente
3. **Testar** - Valide visualmente e funcionalmente
4. **Documentar** - Atualize este guia com valores finais

---

**Aguardando suas referências específicas para aplicar! 🎨**

**URL do projeto Stitch:** https://stitch.withgoogle.com/projects/11277703543515991022
