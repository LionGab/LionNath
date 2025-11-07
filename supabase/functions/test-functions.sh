#!/bin/bash

# Script de teste para Edge Functions NAT-IA
# Usage: ./test-functions.sh [function-name]

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Config
SUPABASE_URL="${SUPABASE_URL:-http://localhost:54321}"
ANON_KEY="${SUPABASE_ANON_KEY:-your-anon-key}"

echo -e "${YELLOW}=== NAT-IA Edge Functions Test Suite ===${NC}\n"

# Test 1: nathia-chat
test_chat() {
  echo -e "${YELLOW}Testing nathia-chat...${NC}"

  response=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/nathia-chat" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "user_id": "test-user-123",
      "message": "Estou com muito enjoo, é normal?",
      "context": {
        "stage": "gestante",
        "mood": "preocupada"
      }
    }')

  if echo "$response" | grep -q '"reply"'; then
    echo -e "${GREEN}✓ nathia-chat: SUCCESS${NC}"
    echo "Response: $(echo $response | jq -r '.reply' | head -c 100)..."
  else
    echo -e "${RED}✗ nathia-chat: FAILED${NC}"
    echo "Error: $response"
    return 1
  fi
  echo ""
}

# Test 2: nathia-curadoria
test_curadoria() {
  echo -e "${YELLOW}Testing nathia-curadoria...${NC}"

  response=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/nathia-curadoria" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "user_id": "test-user-123",
      "content_id": "test-content-1",
      "texto": "Durante a gravidez, é importante manter uma alimentação equilibrada rica em nutrientes essenciais como ácido fólico, ferro e cálcio. Evite alimentos crus ou mal cozidos.",
      "tipo": "resumo"
    }')

  if echo "$response" | grep -q '"titulo"'; then
    echo -e "${GREEN}✓ nathia-curadoria: SUCCESS${NC}"
    echo "Título: $(echo $response | jq -r '.titulo')"
  else
    echo -e "${RED}✗ nathia-curadoria: FAILED${NC}"
    echo "Error: $response"
    return 1
  fi
  echo ""
}

# Test 3: nathia-moderacao
test_moderacao() {
  echo -e "${YELLOW}Testing nathia-moderacao...${NC}"

  response=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/nathia-moderacao" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "texto": "Que legal! Também estou grávida e sentindo muita ansiedade. Como vocês estão lidando?"
    }')

  if echo "$response" | grep -q '"labels"'; then
    echo -e "${GREEN}✓ nathia-moderacao: SUCCESS${NC}"
    echo "Labels: $(echo $response | jq -r '.labels[]' | tr '\n' ' ')"
    echo "Auto-approve: $(echo $response | jq -r '.auto_approve')"
  else
    echo -e "${RED}✗ nathia-moderacao: FAILED${NC}"
    echo "Error: $response"
    return 1
  fi
  echo ""
}

# Test 4: nathia-onboarding
test_onboarding() {
  echo -e "${YELLOW}Testing nathia-onboarding...${NC}"

  response=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/nathia-onboarding" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "user_id": "test-user-123",
      "respostas": [
        {
          "question": "Em que momento você está?",
          "answer": "Estou grávida de 20 semanas"
        },
        {
          "question": "Quais são suas principais preocupações?",
          "answer": "Tenho medo do parto e preocupação com o desenvolvimento do bebê"
        }
      ]
    }')

  if echo "$response" | grep -q '"stage"'; then
    echo -e "${GREEN}✓ nathia-onboarding: SUCCESS${NC}"
    echo "Stage: $(echo $response | jq -r '.stage')"
    echo "Concerns: $(echo $response | jq -r '.concerns[]' | tr '\n' ' ')"
  else
    echo -e "${RED}✗ nathia-onboarding: FAILED${NC}"
    echo "Error: $response"
    return 1
  fi
  echo ""
}

# Test 5: nathia-recs
test_recs() {
  echo -e "${YELLOW}Testing nathia-recs...${NC}"

  response=$(curl -s -X POST "${SUPABASE_URL}/functions/v1/nathia-recs" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${ANON_KEY}" \
    -d '{
      "user_id": "test-user-123",
      "context": {
        "stage": "mae",
        "baby_age_months": 3
      }
    }')

  if echo "$response" | grep -q '"conteudo"'; then
    echo -e "${GREEN}✓ nathia-recs: SUCCESS${NC}"
    echo "Recomendações: $(echo $response | jq -r '.conteudo[0].titulo')"
  else
    echo -e "${RED}✗ nathia-recs: FAILED${NC}"
    echo "Error: $response"
    return 1
  fi
  echo ""
}

# Run tests
if [ -z "$1" ]; then
  # Run all tests
  test_chat
  test_curadoria
  test_moderacao
  test_onboarding
  test_recs

  echo -e "${GREEN}=== All tests completed ===${NC}"
else
  # Run specific test
  case "$1" in
    chat)
      test_chat
      ;;
    curadoria)
      test_curadoria
      ;;
    moderacao)
      test_moderacao
      ;;
    onboarding)
      test_onboarding
      ;;
    recs)
      test_recs
      ;;
    *)
      echo -e "${RED}Unknown function: $1${NC}"
      echo "Available: chat, curadoria, moderacao, onboarding, recs"
      exit 1
      ;;
  esac
fi
