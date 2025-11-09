-- Migration: onboarding_answers table
-- Data: 2025-01-08
-- Descrição: Cria tabela para armazenar respostas do onboarding

-- Criar tabela onboarding_answers
create table if not exists onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  question_id text not null,
  answer jsonb not null,
  created_at timestamptz default now()
);

-- Criar índice para buscas por usuário
create index if not exists idx_onboarding_answers_user_id 
  on onboarding_answers(user_id);

-- Criar índice para buscas por question_id
create index if not exists idx_onboarding_answers_question_id 
  on onboarding_answers(question_id);

-- Habilitar RLS (Row Level Security)
alter table onboarding_answers enable row level security;

-- Política temporária para demo: permitir inserts anônimos
-- ATENÇÃO: Esta política é temporária para demo. Em produção, ajustar conforme necessário.
create policy "Allow anonymous inserts for demo"
  on onboarding_answers
  for insert
  to anon
  with check (true);

-- Política para usuários autenticados: podem inserir suas próprias respostas
create policy "Users can insert their own answers"
  on onboarding_answers
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Política para usuários autenticados: podem ler suas próprias respostas
create policy "Users can read their own answers"
  on onboarding_answers
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Política para usuários autenticados: podem atualizar suas próprias respostas
create policy "Users can update their own answers"
  on onboarding_answers
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Comentários para documentação
comment on table onboarding_answers is 'Armazena respostas do onboarding dos usuários';
comment on column onboarding_answers.user_id is 'ID do usuário (pode ser null para modo mock/anônimo)';
comment on column onboarding_answers.question_id is 'ID da pergunta respondida';
comment on column onboarding_answers.answer is 'Resposta em formato JSON (string para single_choice, array para multi_choice)';
comment on column onboarding_answers.created_at is 'Data e hora da resposta';

