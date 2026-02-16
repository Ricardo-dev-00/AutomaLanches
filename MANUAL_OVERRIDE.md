# Controle Manual de Abertura/Fechamento da Loja

## Como funciona

O sistema possui 3 modos de operação:

### 1️⃣ Forçar Aberto (FORCE_OPEN)
- **Quando usar:** Promoções especiais, eventos, abrir fora do horário
- **O que faz:** Mantém a loja ABERTA independente do horário
- **Como ativar:** Adicionar variável `FORCE_OPEN=true` no Railway

### 2️⃣ Forçar Fechado (FORCE_CLOSED)
- **Quando usar:** Feriados, manutenção, emergências
- **O que faz:** Mantém a loja FECHADA independente do horário
- **Como ativar:** Adicionar variável `FORCE_CLOSED=true` no Railway

### 3️⃣ Automático (padrão)
- **Quando usar:** Operação normal do dia a dia
- **O que faz:** Abre/fecha conforme horário configurado
- **Como ativar:** Não definir nenhuma das variáveis acima

---

## Passo a passo no Railway

### Para FORÇAR ABERTO:
1. Acesse seu projeto no Railway
2. Vá em **Variables**
3. Clique em **+ New Variable**
4. Nome: `FORCE_OPEN`
5. Valor: `true`
6. Salve (Railway reinicia automaticamente)

### Para FORÇAR FECHADO:
1. Acesse seu projeto no Railway
2. Vá em **Variables**
3. Clique em **+ New Variable**
4. Nome: `FORCE_CLOSED`
5. Valor: `true`
6. Salve (Railway reinicia automaticamente)

### Para VOLTAR AO NORMAL:
1. Acesse seu projeto no Railway
2. Vá em **Variables**
3. **Delete** a variável `FORCE_OPEN` ou `FORCE_CLOSED`
4. Salve (Railway reinicia automaticamente)

---

## ⚠️ Importante

- **Não defina as duas ao mesmo tempo** (`FORCE_OPEN` e `FORCE_CLOSED`)
- Se ambas estiverem definidas, `FORCE_OPEN` tem prioridade
- O restart do Railway leva 1-2 minutos
- O horário automático é:
  - **Segunda a Sexta:** 18h às 23h
  - **Sábado e Domingo:** 18h às 00h

---

## Exemplos práticos

**Cenário 1:** Feriado (segunda-feira, 20h)
- Horário automático diria: ABERTO
- Você quer: FECHADO
- **Ação:** `FORCE_CLOSED=true`

**Cenário 2:** Promoção especial (terça-feira, 15h)
- Horário automático diria: FECHADO
- Você quer: ABERTO
- **Ação:** `FORCE_OPEN=true`

**Cenário 3:** Voltando ao normal
- Você quer: Seguir horário automático
- **Ação:** Deletar `FORCE_OPEN` ou `FORCE_CLOSED`
