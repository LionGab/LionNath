#!/usr/bin/env node
/**
 * Validates that required environment variables are set
 * Run before starting dev server or building
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_VARS = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
];

const OPTIONAL_VARS = [
  'EXPO_PUBLIC_SENTRY_DSN',
  'EXPO_PUBLIC_PROJECT_ID',
  'EXPO_PUBLIC_ENABLE_AI_FEATURES',
  'EXPO_PUBLIC_ENABLE_GAMIFICATION',
  'EXPO_PUBLIC_ENABLE_ANALYTICS',
];

// Insecure variables (should NOT be EXPO_PUBLIC_)
const INSECURE_VARS = [
  'EXPO_PUBLIC_GEMINI_API_KEY',
  'EXPO_PUBLIC_CLAUDE_API_KEY',
  'EXPO_PUBLIC_OPENAI_API_KEY',
  'EXPO_PUBLIC_PERPLEXITY_API_KEY',
  'EXPO_PUBLIC_SERVICE_ROLE_KEY',
];

// Load .env file
require('dotenv').config();

console.log('🔍 Validating environment variables...\n');

let hasErrors = false;
let hasWarnings = false;
let hasSecurityIssues = false;

// Check required vars
console.log('📋 Required variables:');
for (const varName of REQUIRED_VARS) {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`  ❌ ${varName} - MISSING`);
    hasErrors = true;
  } else {
    // Mask sensitive values
    const maskedValue = value.substring(0, 20) + '...';
    console.log(`  ✓ ${varName} - ${maskedValue}`);
  }
}

// Check optional vars
console.log('\n🔧 Optional variables:');
for (const varName of OPTIONAL_VARS) {
  const value = process.env[varName];
  if (!value || value.trim() === '') {
    console.log(`  ⚠️  ${varName} - NOT SET (optional)`);
    hasWarnings = true;
  } else {
    console.log(`  ✓ ${varName} - ${value}`);
  }
}

// Check for insecure API keys
console.log('\n🔐 Security check:');
for (const varName of INSECURE_VARS) {
  if (process.env[varName]) {
    console.log(`  ⛔ ${varName} - INSECURE! API keys should not be EXPO_PUBLIC_`);
    console.log(`     Move to Edge Functions (supabase/functions/.env)`);
    hasSecurityIssues = true;
  }
}

if (!hasSecurityIssues) {
  console.log('  ✓ No insecure API keys found');
}

// Summary
console.log('\n' + '='.repeat(60));
if (hasErrors) {
  console.log('❌ VALIDATION FAILED - Missing required variables');
  console.log('   Copy .env.example to .env and fill in the values');
  process.exit(1);
}

if (hasSecurityIssues) {
  console.log('⛔ SECURITY ISSUE - API keys exposed as EXPO_PUBLIC_');
  console.log('   Move API keys to Edge Functions (supabase/functions/.env)');
  process.exit(1);
}

if (hasWarnings) {
  console.log('⚠️  VALIDATION PASSED (with warnings)');
  console.log('   Some optional features may not work');
} else {
  console.log('✅ VALIDATION PASSED - All variables configured');
}

console.log('='.repeat(60) + '\n');
process.exit(0);
