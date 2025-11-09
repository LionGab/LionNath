# 🧪 Como Testar o App - Guia Completo

## 📱 Testando no Mobile (Expo Go)

### Pré-requisitos

1. **Instalar Expo Go no celular:**
   - **Android**: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - **iOS**: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Garantir que celular e computador estão na mesma rede Wi-Fi**

### Passos

#### 1. Iniciar o servidor de desenvolvimento

```bash
# Na raiz do projeto
pnpm dev

# Ou diretamente no diretório mobile
cd apps/mobile
pnpm dev
```

#### 2. Escanear o QR Code

Após iniciar, você verá no terminal:

```
Metro waiting on exp://192.168.x.x:8081
Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press w │ open web
› Press a │ open Android
› Press i │ open iOS simulator
```

**Android:**
- Abra o app **Expo Go**
- Toque em **"Scan QR Code"**
- Escaneie o QR code do terminal

**iOS:**
- Abra o app **Câmera** nativo
- Aponte para o QR code
- Toque na notificação que aparecer

#### 3. Conectar via Tunnel (se Wi-Fi não funcionar)

Se o QR code não conectar (celular e PC em redes diferentes):

```bash
# Iniciar com tunnel
pnpm dev:tunnel

# Ou
cd apps/mobile
pnpm dev:tunnel
```

O tunnel cria uma conexão pública via Expo, permitindo conectar de qualquer lugar.

---

## 🌐 Testando na Web

### Opção 1: Iniciar direto na web

```bash
# Na raiz do projeto
pnpm dev:web

# Ou diretamente
cd apps/mobile
pnpm dev:web
```

Isso abre automaticamente no navegador em `http://localhost:8081`

### Opção 2: Iniciar e pressionar 'w'

```bash
# Iniciar normalmente
pnpm dev

# Depois pressionar 'w' no terminal
```

### Opção 3: Acessar manualmente

1. Inicie o servidor: `pnpm dev`
2. Abra o navegador em: `http://localhost:8081`

---

## 🎯 Comandos Disponíveis

### Desenvolvimento

```bash
# Iniciar servidor (padrão)
pnpm dev

# Iniciar apenas web
pnpm dev:web

# Iniciar com cache limpo (resolve problemas)
pnpm dev:clear

# Iniciar via tunnel (para conectar de qualquer lugar)
pnpm dev:tunnel

# Iniciar apenas localhost (não acessível na rede)
pnpm dev:localhost

# Iniciar via LAN (rede local)
pnpm dev:lan
```

### Limpeza

```bash
# Limpar cache do Expo
cd apps/mobile
pnpm clean

# Limpar tudo e reinstalar
pnpm clean:all
```

### Build

```bash
# Build para produção
cd apps/mobile
pnpm build

# Build apenas web
pnpm build:web
```

---

## 🔧 Troubleshooting

### Problema: QR Code não conecta

**Solução 1: Verificar rede Wi-Fi**
- Celular e PC devem estar na mesma rede Wi-Fi
- Desative VPN se estiver usando

**Solução 2: Usar Tunnel**
```bash
pnpm dev:tunnel
```

**Solução 3: Verificar firewall**
- Windows: Permitir Node.js e Expo nas regras de firewall
- Mac: Permitir conexões de entrada para Node.js

### Problema: "Metro bundler error"

**Solução:**
```bash
cd apps/mobile
pnpm clean
pnpm dev
```

### Problema: "Port 8081 already in use"

**Solução Windows:**
```powershell
# Encontrar processo
netstat -ano | findstr ":8081"

# Matar processo (substitua PID)
taskkill /PID <PID> /F
```

**Solução Mac/Linux:**
```bash
# Encontrar processo
lsof -ti:8081

# Matar processo
kill -9 $(lsof -ti:8081)
```

### Problema: App não atualiza após mudanças

**Solução:**
1. Agite o celular (shake gesture)
2. Toque em **"Reload"** no menu do Expo Go
3. Ou pressione `r` no terminal para reload

### Problema: Erros de módulos não encontrados

**Solução:**
```bash
# Limpar e reinstalar
cd apps/mobile
pnpm clean:all

# Reiniciar servidor
pnpm dev
```

---

## ✅ Checklist de Testes

### Mobile (Expo Go)

- [ ] App abre corretamente
- [ ] Tela de Welcome aparece
- [ ] Navegação entre telas funciona
- [ ] Dark mode funciona
- [ ] Chat com NathIA funciona
- [ ] Onboarding funciona
- [ ] Hábitos funcionam
- [ ] Feed de conteúdo carrega

### Web

- [ ] App abre em `http://localhost:8081`
- [ ] Layout responsivo funciona
- [ ] Navegação funciona
- [ ] Dark mode funciona
- [ ] Hot reload funciona (mudanças aparecem automaticamente)
- [ ] Console não mostra erros críticos

---

## 🚀 Workflow Recomendado

### Para desenvolvimento mobile:

1. Inicie o servidor: `pnpm dev`
2. Escaneie QR code com Expo Go
3. Mantenha o app aberto no celular
4. Faça mudanças no código
5. Salve o arquivo
6. O app atualiza automaticamente (Fast Refresh)

### Para desenvolvimento web:

1. Inicie o servidor: `pnpm dev:web`
2. Mantenha o navegador aberto
3. Faça mudanças no código
4. Salve o arquivo
5. A página atualiza automaticamente

---

## 📝 Notas Importantes

- **Fast Refresh** está habilitado por padrão - mudanças aparecem automaticamente
- **Hot Reload** preserva o estado do componente
- **Full Reload** acontece apenas quando necessário (mudanças em configurações)
- O servidor Metro precisa estar rodando para o app funcionar
- Para testar em produção, use `pnpm build` e depois `npx serve dist`

---

## 🎉 Pronto!

Agora você pode testar o app tanto no mobile quanto na web. Use `pnpm dev` para mobile e `pnpm dev:web` para web!

