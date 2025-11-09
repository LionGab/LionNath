#!/usr/bin/env node
/**
 * Script para extrair cores dominantes de imagens
 *
 * Uso:
 *   npm run analyze-images
 *   ou
 *   node scripts/analyze-images.js [caminho-da-imagem]
 */

const fs = require('fs');
const path = require('path');

// Função para analisar informações básicas da imagem
function analyzeImageBasic(imagePath) {
  const stats = fs.statSync(imagePath);
  const filename = path.basename(imagePath);

  console.log(`\n📸 Analisando: ${filename}`);
  console.log(`   Tamanho: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

  // Informações conhecidas das imagens
  const imageInfo = {
    nat1: { width: 1024, height: 1024, usage: 'DailyInsightCard, OnboardingScreen' },
    nat2: { width: 1024, height: 1024, usage: 'ProfileScreen' },
    nat3: { width: 1024, height: 1536, usage: 'WelcomeScreen' },
  };

  const key = filename.replace('.png', '');
  if (imageInfo[key]) {
    console.log(`   Dimensões: ${imageInfo[key].width}x${imageInfo[key].height}px`);
    console.log(`   Uso: ${imageInfo[key].usage}`);
  }
}

// Analisar todas as imagens
function analyzeAllImages() {
  const imagesDir = path.join(__dirname, '../src/assets/images');

  if (!fs.existsSync(imagesDir)) {
    console.error('❌ Diretório de imagens não encontrado!');
    process.exit(1);
  }

  const files = fs.readdirSync(imagesDir).filter((f) => f.endsWith('.png'));

  if (files.length === 0) {
    console.log('⚠️  Nenhuma imagem PNG encontrada!');
    return;
  }

  console.log('🎨 Análise de Imagens - Nossa Maternidade\n');
  console.log(`Encontradas ${files.length} imagem(ns):\n`);

  files.forEach((file) => {
    const imagePath = path.join(imagesDir, file);
    analyzeImageBasic(imagePath);
  });

  console.log('\n📋 Próximos Passos:');
  console.log('1. Use ferramentas online para extrair cores:');
  console.log('   - https://coolors.co/image-picker');
  console.log('   - https://color.adobe.com/create/image');
  console.log('2. Extraia as cores dominantes de cada imagem');
  console.log('3. Atualize src/config/stitch-references.ts com as cores');
  console.log('4. Execute npm run apply-stitch-references\n');
}

// Executar
if (require.main === module) {
  const imagePath = process.argv[2];

  if (imagePath) {
    // Analisar imagem específica
    if (fs.existsSync(imagePath)) {
      analyzeImageBasic(imagePath);
    } else {
      console.error(`❌ Imagem não encontrada: ${imagePath}`);
      process.exit(1);
    }
  } else {
    // Analisar todas as imagens
    analyzeAllImages();
  }
}
