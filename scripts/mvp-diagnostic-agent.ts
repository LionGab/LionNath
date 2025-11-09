#!/usr/bin/env tsx
/**
 * MVP Diagnostic Agent - Análise Completa do Projeto
 *
 * Analisa o repositório completo e gera diagnóstico detalhado para apresentação à influenciadora
 */

import fs from 'node:fs';
import path from 'node:path';

interface DiagnosticResult {
  feature: string;
  status: '✅' | '⚠️' | '❌';
  details: string[];
  priority: 'ALTA' | 'MEDIA' | 'BAIXA';
  impact: string;
  fix?: string;
}

interface ScreenAnalysis {
  file: string;
  exists: boolean;
  hasNavigation: boolean;
  hasLoading: boolean;
  hasError: boolean;
  hasAccessibility: boolean;
  issues: string[];
}

interface ComponentAnalysis {
  file: string;
  hasProps: boolean;
  hasTypes: boolean;
  hasAccessibility: boolean;
  usesTheme: boolean;
  issues: string[];
}

class MVPDiagnosticAgent {
  private rootDir: string;
  private results: DiagnosticResult[] = [];
  private screens: ScreenAnalysis[] = [];
  private components: ComponentAnalysis[] = [];

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
  }

  async run(): Promise<void> {
    console.log('🔍 Iniciando análise completa do MVP...\n');

    // 1. Análise de Features Principais
    this.analyzeMainFeatures();

    // 2. Análise de Screens
    this.analyzeScreens();

    // 3. Análise de Componentes
    this.analyzeComponents();

    // 4. Análise de Navegação
    this.analyzeNavigation();

    // 5. Análise de Integrações
    this.analyzeIntegrations();

    // 6. Análise de UX/UI
    this.analyzeUXUI();

    // 7. Análise de Performance
    this.analyzePerformance();

    // 8. Gera relatório
    this.generateReport();
  }

  private analyzeMainFeatures(): void {
    console.log('📱 Analisando features principais...');

    const expectedFeatures = [
      { name: 'Onboarding', path: 'src/screens/OnboardingScreen.tsx' },
      { name: 'Login/Auth', path: 'src/services/auth.ts' },
      { name: 'Feed/Comunidade', path: 'src/features/content/ContentFeedScreen.tsx' },
      { name: 'NathIA Chat', path: 'src/screens/ChatScreen.tsx' },
      { name: 'Diário/Frase do dia', path: 'src/screens/DailyPlanScreen.tsx' },
      { name: 'MundoNath', path: 'src/features/content/ContentFeedScreen.tsx' },
      { name: 'Perfil/Hábitos', path: 'src/screens/ProfileScreen.tsx' },
      { name: 'Push Notifications', path: 'src/services/notifications.ts' },
      { name: 'Configurações', path: 'src/screens/ProfileScreen.tsx' },
    ];

    expectedFeatures.forEach((feature) => {
      const exists = fs.existsSync(path.join(this.rootDir, feature.path));
      const content = exists ? fs.readFileSync(path.join(this.rootDir, feature.path), 'utf-8') : '';

      let status: '✅' | '⚠️' | '❌' = exists ? '✅' : '❌';
      const details: string[] = [];
      let priority: 'ALTA' | 'MEDIA' | 'BAIXA' = 'MEDIA';

      if (exists) {
        // Verifica se está completo
        if (content.includes('TODO') || content.includes('FIXME')) {
          status = '⚠️';
          details.push('Contém TODOs/FIXMEs');
          priority = 'ALTA';
        }

        if (content.includes('mock') || content.includes('Mock')) {
          status = '⚠️';
          details.push('Usa dados mockados');
        }

        if (!content.includes('useState') && !content.includes('useEffect')) {
          status = '⚠️';
          details.push('Pode estar incompleto');
        }
      } else {
        details.push('Arquivo não encontrado');
        priority = 'ALTA';
      }

      this.results.push({
        feature: feature.name,
        status,
        details,
        priority,
        impact: this.getImpact(feature.name, status),
      });
    });
  }

  private analyzeScreens(): void {
    console.log('🖼️  Analisando screens...');

    const screensDir = path.join(this.rootDir, 'src/screens');
    if (!fs.existsSync(screensDir)) return;

    const screenFiles = fs.readdirSync(screensDir).filter((f) => f.endsWith('.tsx'));

    screenFiles.forEach((file) => {
      const filePath = path.join(screensDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');

      const analysis: ScreenAnalysis = {
        file,
        exists: true,
        hasNavigation: content.includes('useNavigation') || content.includes('navigation'),
        hasLoading: content.includes('loading') || content.includes('isLoading'),
        hasError: content.includes('error') || content.includes('Error'),
        hasAccessibility: content.includes('accessibility') || content.includes('accessible'),
        issues: [],
      };

      // Detecta problemas
      if (!analysis.hasLoading) {
        analysis.issues.push('Sem estado de loading');
      }

      if (!analysis.hasError) {
        analysis.issues.push('Sem tratamento de erro');
      }

      if (!analysis.hasAccessibility) {
        analysis.issues.push('Sem acessibilidade');
      }

      if (content.includes('any')) {
        analysis.issues.push('Usa tipo any');
      }

      if (content.includes('console.log')) {
        analysis.issues.push('Contém console.log (remover em produção)');
      }

      this.screens.push(analysis);
    });
  }

  private analyzeComponents(): void {
    console.log('🧩 Analisando componentes...');

    const componentsDir = path.join(this.rootDir, 'src/components');
    if (!fs.existsSync(componentsDir)) return;

    const componentFiles = this.getFilesRecursive(componentsDir, ['.tsx']);

    componentFiles.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      const relativePath = path.relative(this.rootDir, file);

      const analysis: ComponentAnalysis = {
        file: relativePath,
        hasProps: content.includes('interface') || content.includes('type') || content.includes('Props'),
        hasTypes: !content.includes(': any') && content.includes(':'),
        hasAccessibility: content.includes('accessibility') || content.includes('accessible'),
        usesTheme: content.includes('useTheme') || content.includes('colors.') || content.includes('theme.'),
        issues: [],
      };

      // Detecta problemas
      if (!analysis.hasProps) {
        analysis.issues.push('Sem tipagem de props');
      }

      if (!analysis.hasTypes) {
        analysis.issues.push('Usa tipos any ou sem tipagem');
      }

      if (!analysis.hasAccessibility) {
        analysis.issues.push('Sem acessibilidade');
      }

      if (!analysis.usesTheme) {
        analysis.issues.push('Não usa sistema de tema');
      }

      if (content.includes('hardcoded') || /#[0-9A-Fa-f]{6}/.test(content)) {
        analysis.issues.push('Possui cores hardcoded');
      }

      this.components.push(analysis);
    });
  }

  private analyzeNavigation(): void {
    console.log('🧭 Analisando navegação...');

    const navFile = path.join(this.rootDir, 'src/navigation/TabNavigator.tsx');
    const appNavFile = path.join(this.rootDir, 'src/navigation/index.tsx');

    const navExists = fs.existsSync(navFile);
    const appNavExists = fs.existsSync(appNavFile);

    if (!navExists || !appNavExists) {
      this.results.push({
        feature: 'Navegação',
        status: '❌',
        details: ['Arquivos de navegação não encontrados'],
        priority: 'ALTA',
        impact: 'App não navegável',
      });
      return;
    }

    const navContent = fs.readFileSync(navFile, 'utf-8');
    const appNavContent = fs.readFileSync(appNavFile, 'utf-8');

    const details: string[] = [];
    let status: '✅' | '⚠️' | '❌' = '✅';

    // Verifica tabs
    const tabCount = (navContent.match(/Tab\.Screen/g) || []).length;
    if (tabCount < 5) {
      status = '⚠️';
      details.push(`Apenas ${tabCount} tabs encontradas (esperado: 5)`);
    }

    // Verifica lazy loading
    if (!navContent.includes('lazy') && !navContent.includes('Suspense')) {
      status = '⚠️';
      details.push('Sem lazy loading');
    }

    // Verifica deep linking
    if (!appNavContent.includes('linking')) {
      status = '⚠️';
      details.push('Deep linking não configurado');
    }

    this.results.push({
      feature: 'Navegação',
      status,
      details,
      priority: status === '❌' ? 'ALTA' : 'MEDIA',
      impact: 'Experiência de navegação',
    });
  }

  private analyzeIntegrations(): void {
    console.log('🔌 Analisando integrações...');

    // Supabase
    const supabaseFile = path.join(this.rootDir, 'src/services/supabase.ts');
    const supabaseExists = fs.existsSync(supabaseFile);

    if (supabaseExists) {
      const content = fs.readFileSync(supabaseFile, 'utf-8');
      const details: string[] = [];
      let status: '✅' | '⚠️' | '❌' = '✅';

      if (!content.includes('SUPABASE_URL') && !content.includes('supabaseUrl')) {
        status = '⚠️';
        details.push('URL do Supabase pode não estar configurada');
      }

      if (!content.includes('SUPABASE_ANON_KEY') && !content.includes('supabaseAnonKey')) {
        status = '⚠️';
        details.push('Chave anônima pode não estar configurada');
      }

      this.results.push({
        feature: 'Supabase Integration',
        status,
        details,
        priority: 'ALTA',
        impact: 'Backend não funcionará',
      });
    }

    // Notifications
    const notificationsFile = path.join(this.rootDir, 'src/services/notifications.ts');
    const notificationsExists = fs.existsSync(notificationsFile);

    this.results.push({
      feature: 'Push Notifications',
      status: notificationsExists ? '✅' : '❌',
      details: notificationsExists ? [] : ['Serviço não implementado'],
      priority: 'MEDIA',
      impact: 'Notificações não funcionarão',
    });
  }

  private analyzeUXUI(): void {
    console.log('🎨 Analisando UX/UI...');

    const themeFile = path.join(this.rootDir, 'src/theme/index.ts');
    const constantsTheme = path.join(this.rootDir, 'src/constants/theme.ts');

    const themeExists = fs.existsSync(themeFile) || fs.existsSync(constantsTheme);

    if (!themeExists) {
      this.results.push({
        feature: 'Sistema de Tema',
        status: '❌',
        details: ['Sistema de tema não encontrado'],
        priority: 'ALTA',
        impact: 'Inconsistência visual',
      });
      return;
    }

    const details: string[] = [];
    let status: '✅' | '⚠️' | '❌' = '✅';

    // Verifica cores hardcoded nos componentes
    const componentsWithHardcoded = this.components.filter((c) => c.issues.some((i) => i.includes('hardcoded'))).length;

    if (componentsWithHardcoded > 0) {
      status = '⚠️';
      details.push(`${componentsWithHardcoded} componentes com cores hardcoded`);
    }

    // Verifica acessibilidade
    const componentsWithoutA11y = this.components.filter((c) => !c.hasAccessibility).length;
    if (componentsWithoutA11y > 0) {
      status = '⚠️';
      details.push(`${componentsWithoutA11y} componentes sem acessibilidade`);
    }

    this.results.push({
      feature: 'UX/UI Consistency',
      status,
      details,
      priority: 'MEDIA',
      impact: 'Qualidade visual e acessibilidade',
    });
  }

  private analyzePerformance(): void {
    console.log('⚡ Analisando performance...');

    const details: string[] = [];
    let status: '✅' | '⚠️' | '❌' = '✅';

    // Verifica lazy loading
    const screensWithoutLazy = this.screens.filter(
      (s) => !s.file.includes('lazy') && !s.file.includes('Suspense')
    ).length;

    if (screensWithoutLazy > 0) {
      status = '⚠️';
      details.push(`${screensWithoutLazy} screens sem lazy loading`);
    }

    // Verifica memoização
    const componentsDir = path.join(this.rootDir, 'src/components');
    if (fs.existsSync(componentsDir)) {
      const componentFiles = this.getFilesRecursive(componentsDir, ['.tsx']);
      const withoutMemo = componentFiles.filter((file) => {
        const content = fs.readFileSync(file, 'utf-8');
        return !content.includes('React.memo') && !content.includes('useMemo') && !content.includes('useCallback');
      }).length;

      if (withoutMemo > 0) {
        status = '⚠️';
        details.push(`${withoutMemo} componentes sem otimizações (memo/callback)`);
      }
    }

    this.results.push({
      feature: 'Performance',
      status,
      details,
      priority: 'MEDIA',
      impact: 'Velocidade e fluidez do app',
    });
  }

  private generateReport(): void {
    console.log('\n📊 Gerando relatório...\n');

    const report = this.buildMarkdownReport();
    const reportPath = path.join(this.rootDir, 'MVP_DIAGNOSTIC_REPORT.md');

    fs.writeFileSync(reportPath, report, 'utf-8');

    console.log(`✅ Relatório gerado em: ${reportPath}\n`);
    console.log(report);
  }

  private buildMarkdownReport(): string {
    const alta = this.results.filter((r) => r.priority === 'ALTA');
    const media = this.results.filter((r) => r.priority === 'MEDIA');
    const baixa = this.results.filter((r) => r.priority === 'BAIXA');

    const ready = this.results.filter((r) => r.status === '✅').length;
    const partial = this.results.filter((r) => r.status === '⚠️').length;
    const missing = this.results.filter((r) => r.status === '❌').length;

    return `# 🔍 Diagnóstico MVP - Nossa Maternidade

**Data:** ${new Date().toLocaleDateString('pt-BR')}  
**Status Geral:** ${ready}✅ ${partial}⚠️ ${missing}❌

---

## 📊 Resumo Executivo

- **✅ Pronto:** ${ready} features
- **⚠️ Parcial:** ${partial} features  
- **❌ Faltando:** ${missing} features

---

## 🎯 Features Principais

${this.results
  .map(
    (r) => `
### ${r.status} ${r.feature}

**Prioridade:** ${r.priority}  
**Impacto:** ${r.impact}

${
  r.details.length > 0
    ? `**Detalhes:**
${r.details.map((d) => `- ${d}`).join('\n')}`
    : '✅ Sem problemas detectados'
}

${
  r.fix
    ? `**Correção sugerida:**
\`\`\`
${r.fix}
\`\`\``
    : ''
}
`
  )
  .join('\n')}

---

## 🖼️ Análise de Screens

**Total:** ${this.screens.length} screens encontradas

${this.screens
  .map(
    (s) => `
### ${s.file}

- ✅ Navegação: ${s.hasNavigation ? 'Sim' : '❌ Não'}
- ✅ Loading: ${s.hasLoading ? 'Sim' : '❌ Não'}
- ✅ Error Handling: ${s.hasError ? 'Sim' : '❌ Não'}
- ✅ Acessibilidade: ${s.hasAccessibility ? 'Sim' : '❌ Não'}

${
  s.issues.length > 0
    ? `**Problemas:**
${s.issues.map((i) => `- ⚠️ ${i}`).join('\n')}`
    : '✅ Sem problemas'
}
`
  )
  .join('\n')}

---

## 🧩 Análise de Componentes

**Total:** ${this.components.length} componentes encontrados

### Estatísticas

- **Com tipagem:** ${this.components.filter((c) => c.hasProps).length}
- **Com acessibilidade:** ${this.components.filter((c) => c.hasAccessibility).length}
- **Usando tema:** ${this.components.filter((c) => c.usesTheme).length}

### Componentes com Problemas

${
  this.components
    .filter((c) => c.issues.length > 0)
    .map(
      (c) => `
#### ${c.file}

${c.issues.map((i) => `- ⚠️ ${i}`).join('\n')}
`
    )
    .join('\n') || '✅ Nenhum problema encontrado'
}

---

## 🚀 Plano de Ação Priorizado

### 🔴 ALTA PRIORIDADE (Antes da Demo)

${alta.map((r) => `- [ ] **${r.feature}** - ${r.impact}`).join('\n') || '✅ Nenhum item de alta prioridade'}

### 🟡 MÉDIA PRIORIDADE (Pós-Demo)

${media.map((r) => `- [ ] **${r.feature}** - ${r.impact}`).join('\n') || '✅ Nenhum item de média prioridade'}

### 🟢 BAIXA PRIORIDADE (Refinamento)

${baixa.map((r) => `- [ ] **${r.feature}** - ${r.impact}`).join('\n') || '✅ Nenhum item de baixa prioridade'}

---

## 💡 Quick Wins (Melhorias Rápidas)

${this.getQuickWins()}

---

## 📝 Notas Finais

${this.getFinalNotes()}

---

**Gerado por:** MVP Diagnostic Agent  
**Versão:** 1.0.0
`;
  }

  private getQuickWins(): string {
    const wins: string[] = [];

    // Componentes sem acessibilidade
    const withoutA11y = this.components.filter((c) => !c.hasAccessibility).length;
    if (withoutA11y > 0) {
      wins.push(`- Adicionar acessibilidade em ${withoutA11y} componentes (30min)`);
    }

    // Screens sem loading
    const withoutLoading = this.screens.filter((s) => !s.hasLoading).length;
    if (withoutLoading > 0) {
      wins.push(`- Adicionar estados de loading em ${withoutLoading} screens (1h)`);
    }

    // Cores hardcoded
    const withHardcoded = this.components.filter((c) => c.issues.some((i) => i.includes('hardcoded'))).length;
    if (withHardcoded > 0) {
      wins.push(`- Substituir cores hardcoded por tema em ${withHardcoded} componentes (1h)`);
    }

    return wins.length > 0 ? wins.join('\n') : '✅ Nenhum quick win identificado';
  }

  private getFinalNotes(): string {
    const notes: string[] = [];

    const readyCount = this.results.filter((r) => r.status === '✅').length;
    const totalCount = this.results.length;
    const percentage = Math.round((readyCount / totalCount) * 100);

    notes.push(`- **Completude:** ${percentage}% das features principais estão prontas`);
    notes.push(`- **Screens:** ${this.screens.length} screens implementadas`);
    notes.push(`- **Componentes:** ${this.components.length} componentes criados`);

    if (percentage < 70) {
      notes.push(
        '\n⚠️ **ATENÇÃO:** MVP está abaixo de 70% de completude. Foque nas features de ALTA prioridade antes da demo.'
      );
    } else if (percentage < 90) {
      notes.push(
        '\n✅ **BOM:** MVP está em bom estado. Complete as features de MÉDIA prioridade para melhorar a experiência.'
      );
    } else {
      notes.push('\n🎉 **EXCELENTE:** MVP está quase completo! Foque em refinamentos e melhorias de UX.');
    }

    return notes.join('\n');
  }

  private getImpact(feature: string, status: string): string {
    const impacts: Record<string, string> = {
      Onboarding: 'Primeira impressão do usuário',
      'Login/Auth': 'Acesso ao app',
      'Feed/Comunidade': 'Engajamento e conteúdo',
      'NathIA Chat': 'Feature principal do produto',
      'Diário/Frase do dia': 'Valor diário para usuária',
      MundoNath: 'Conteúdo exclusivo',
      'Perfil/Hábitos': 'Personalização e gamificação',
      'Push Notifications': 'Retenção de usuários',
      Configurações: 'Experiência personalizada',
    };

    return impacts[feature] || 'Impacto na experiência geral';
  }

  private getFilesRecursive(dir: string, extensions: string[]): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir);

    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        files.push(...this.getFilesRecursive(fullPath, extensions));
      } else if (extensions.some((ext) => entry.endsWith(ext))) {
        files.push(fullPath);
      }
    });

    return files;
  }
}

// Executa o agente
if (require.main === module) {
  const agent = new MVPDiagnosticAgent();
  agent.run().catch(console.error);
}

export default MVPDiagnosticAgent;
