# Política de Privacidade e Proteção de Dados - Nossa Maternidade

**Última atualização:** Janeiro 2025

## 1. Introdução

A Nossa Maternidade ("nós", "nosso", "aplicativo") está comprometida em proteger a privacidade e os dados pessoais de nossas usuárias. Esta política descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

## 2. Dados Coletados

### 2.1 Dados Fornecidos por Você

- **Informações de Conta**: Nome, email, senha (criptografada)
- **Perfil**: Tipo de usuária (gestante, mãe, tentante, puerpério), semana de gestação, nome do bebê
- **Conteúdo Gerado**: Mensagens no chat com NathIA, entradas de diário, respostas de onboarding
- **Preferências**: Configurações do app, preferências de notificação

### 2.2 Dados Coletados Automaticamente

- **Dados de Uso**: Interações com o app, funcionalidades utilizadas, frequência de uso
- **Dados Técnicos**: Tipo de dispositivo, sistema operacional, versão do app, identificadores únicos
- **Dados de Localização**: Apenas se você habilitar (opcional, para recursos de localização)

### 2.3 Dados Sensíveis

- **Dados de Saúde**: Informações sobre gestação, sentimentos, desafios pessoais
- **Dados Emocionais**: Conteúdo de conversas com IA, entradas de diário

⚠️ **Importante**: Dados sensíveis são tratados com máxima segurança e nunca compartilhados com terceiros sem seu consentimento explícito.

## 3. Base Legal e Finalidade do Tratamento

### 3.1 Base Legal (LGPD Art. 7)

Tratamos seus dados pessoais com base em:

- **Consentimento**: Você consente explicitamente ao criar uma conta e usar o app
- **Execução de Contrato**: Necessário para fornecer os serviços do aplicativo
- **Legítimo Interesse**: Para melhorar nossos serviços e segurança

### 3.2 Finalidades do Tratamento

- **Prestação de Serviços**: Fornecer funcionalidades do app (chat com IA, diário, hábitos, feed)
- **Personalização**: Adaptar conteúdo e recomendações ao seu perfil
- **Melhoria do Serviço**: Analisar uso para melhorar funcionalidades
- **Segurança**: Detectar e prevenir fraudes, abusos e riscos à sua segurança
- **Comunicação**: Enviar notificações importantes sobre o serviço

## 4. Uso de Inteligência Artificial

### 4.1 NathIA (Chat com IA)

- **Provedor**: Google Gemini 2.0 Flash
- **Dados Enviados**: Apenas o texto das suas mensagens (anônimas)
- **Armazenamento**: Conversas são armazenadas no Supabase (criptografadas)
- **Anonimização**: Identificadores pessoais são removidos antes de enviar para a IA

### 4.2 Curadoria de Conteúdo (MãeValente)

- **Provedores**: Perplexity AI + Claude (Anthropic)
- **Dados Enviados**: Apenas contexto anônimo (tipo de usuária, semana de gestação)
- **Finalidade**: Buscar e curar artigos relevantes sobre maternidade

### 4.3 Privacidade e Segurança da IA

- ✅ Chaves de API nunca expostas no app mobile
- ✅ Todas as chamadas de IA via Edge Functions (servidor seguro)
- ✅ Dados anonimizados antes de enviar para provedores de IA
- ✅ Histórico de conversas criptografado e protegido por RLS (Row Level Security)

## 5. Compartilhamento de Dados

### 5.1 Prestadores de Serviço

Compartilhamos dados apenas com:

- **Supabase**: Hospedagem de banco de dados e autenticação (conforme política de privacidade do Supabase)
- **Google (Gemini)**: Processamento de IA para chat (dados anonimizados)
- **Anthropic (Claude)**: Análise de conteúdo (dados anonimizados)
- **Perplexity AI**: Curadoria de artigos (dados anonimizados)
- **Sentry**: Monitoramento de erros (apenas dados técnicos, não conteúdo)

### 5.2 Não Compartilhamos

- ❌ Dados pessoais com anunciantes
- ❌ Dados de saúde com terceiros não autorizados
- ❌ Conteúdo de conversas com outras usuárias
- ❌ Dados para fins comerciais não relacionados ao serviço

### 5.3 Requisições Legais

Podemos divulgar dados se exigido por lei ou ordem judicial, sempre respeitando o devido processo legal.

## 6. Direitos do Titular (LGPD Art. 18)

Você tem direito a:

### 6.1 Acesso aos Dados
- Solicitar cópia de todos os seus dados pessoais
- Verificar como seus dados estão sendo tratados

### 6.2 Correção
- Corrigir dados incompletos, inexatos ou desatualizados
- Atualizar seu perfil a qualquer momento no app

### 6.3 Exclusão
- Solicitar exclusão de seus dados pessoais
- Excluir sua conta e todos os dados associados
- **Como solicitar**: Envie email para `privacidade@nossamaternidade.com.br` ou use a função "Excluir Conta" no app

### 6.4 Portabilidade
- Receber seus dados em formato estruturado e interoperável
- Transferir dados para outro serviço

### 6.5 Revogação de Consentimento
- Revogar consentimento a qualquer momento
- Continuar usando o app com funcionalidades básicas (sem personalização)

### 6.6 Oposição
- Opor-se ao tratamento de dados para finalidades específicas

**Para exercer seus direitos**, entre em contato:
- **Email**: `privacidade@nossamaternidade.com.br`
- **App**: Configurações > Privacidade > Solicitar Dados

## 7. Segurança dos Dados

### 7.1 Medidas Técnicas

- ✅ **Criptografia**: Dados em trânsito (HTTPS/TLS) e em repouso (AES-256)
- ✅ **Autenticação**: JWT tokens seguros via Supabase Auth
- ✅ **Row Level Security (RLS)**: Políticas de acesso no banco de dados
- ✅ **Edge Functions**: Lógica sensível executada no servidor (não no app)
- ✅ **Monitoramento**: Sentry para detecção de vulnerabilidades

### 7.2 Medidas Organizacionais

- ✅ Acesso restrito a dados pessoais apenas para equipe autorizada
- ✅ Treinamento da equipe em proteção de dados
- ✅ Auditorias regulares de segurança
- ✅ Política de retenção de dados

### 7.3 Retenção de Dados

- **Dados de Conta**: Mantidos enquanto sua conta estiver ativa
- **Dados de Conversas**: Mantidos por 2 anos após última interação
- **Dados de Uso**: Mantidos por 1 ano (agregados e anonimizados)
- **Após Exclusão**: Dados são excluídos permanentemente em até 30 dias

## 8. Cookies e Tecnologias Similares

O app não utiliza cookies tradicionais, mas pode usar:

- **Local Storage**: Para armazenar preferências localmente no dispositivo
- **Tokens de Autenticação**: Armazenados de forma segura no dispositivo

## 9. Menores de Idade

O app é destinado a pessoas com 18 anos ou mais. Não coletamos intencionalmente dados de menores de idade. Se descobrirmos que coletamos dados de menor, excluiremos imediatamente.

## 10. Transferência Internacional de Dados

Seus dados podem ser processados e armazenados em servidores fora do Brasil (ex: Supabase nos EUA). Garantimos que:

- ✅ Transferências seguem padrões internacionais de proteção de dados
- ✅ Provedores são certificados (ex: Supabase SOC 2 Type II)
- ✅ Dados são protegidos por cláusulas contratuais adequadas

## 11. Encarregado de Proteção de Dados (DPO)

**Nome**: [A definir]  
**Email**: `privacidade@nossamaternidade.com.br`  
**Telefone**: [A definir]

Para questões sobre privacidade e proteção de dados, entre em contato com nosso DPO.

## 12. Alterações nesta Política

Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas:

- **Notificação no App**: Banner ou push notification
- **Email**: Para mudanças importantes
- **Data de Atualização**: Sempre indicada no topo desta página

## 13. Consentimento

Ao usar o aplicativo Nossa Maternidade, você consente com esta Política de Privacidade e com o tratamento de seus dados conforme descrito aqui.

## 14. Contato

Para questões sobre privacidade:

- **Email**: `privacidade@nossamaternidade.com.br`
- **App**: Configurações > Privacidade > Contato
- **Site**: [nossamaternidade.com.br/privacidade](https://nossamaternidade.com.br/privacidade)

---

**Nossa Maternidade**  
Comprometidos com sua privacidade e bem-estar 💕
