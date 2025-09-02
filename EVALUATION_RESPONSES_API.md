# 📋 API de Respostas de Avaliação - Documentação Completa

## 🎯 Visão Geral

Sistema completo de gerenciamento de respostas de avaliações desenvolvido no N8N com padrão CRUD, incluindo funcionalidades de rascunho e finalização de avaliações.

---

## 📊 Estrutura do Banco de Dados

### Tabela: `evaluation_responses`

```sql
- id (PK, AUTO_INCREMENT)
- avaliador_id (VARCHAR(255), NOT NULL)
- form_id (VARCHAR(255), NOT NULL)
- question_id (VARCHAR(255), NOT NULL)
- response_value (TEXT)
- status (ENUM: 'draft', 'submitted', NOT NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)
```

### Tabela: `evaluation_progress`

```sql
- id (PK, AUTO_INCREMENT)
- avaliador_id (VARCHAR(255), NOT NULL)
- avaliacao_id (VARCHAR(255), NOT NULL) -- CAMPO ADICIONADO
- total_questions (INT, DEFAULT 0)
- answered_questions (INT, DEFAULT 0)
- progress_percentage (DECIMAL(5,2), DEFAULT 0.00)
- status (ENUM: 'not_started', 'in_progress', 'completed')
- started_at (TIMESTAMP, NULL)
- last_activity (TIMESTAMP, NULL)
- completed_at (TIMESTAMP, NULL)
- submitted_at (TIMESTAMP, NULL)
- created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE)

-- Chave única adicionada:
UNIQUE KEY unique_progress (avaliador_id, avaliacao_id)
```

### ⚠️ Alterações Necessárias no Banco

```sql
-- Adicionar campo avaliacao_id na tabela evaluation_progress
ALTER TABLE evaluation_progress
ADD COLUMN avaliacao_id VARCHAR(255) NOT NULL;

-- Criar chave única composta
ALTER TABLE evaluation_progress
ADD UNIQUE KEY unique_progress (avaliador_id, avaliacao_id);
```

---

## 🔧 Configuração do N8N

### Webhook Principal

```
URL: https://integra.cellarvinhos.com/webhook/7f1f8f3b-38ce-43d5-9e6f-ce475e3eaf19
Método: POST
```

### Switch - Routing Rules

```javascript
1. create     → {{ $json.operation === "create" }}
2. update     → {{ $json.operation === "update" }}
3. read       → {{ $json.operation === "read" }}
4. readAll    → {{ $json.operation === "readAll" }}
5. saveDraft  → {{ $json.operation === "saveDraft" }}
6. submitEval → {{ $json.operation === "submitEval" }}
7. getProgress → {{ $json.operation === "getProgress" }}
```

---

## 🚀 Fluxos Implementados

## 1️⃣ CREATE - Criar Nova Resposta

### Fluxo:

```
Switch (create) → Code → MySQL Insert → Respond to Webhook
```

### Code Node:

```javascript
// Validar dados obrigatórios
const { data } = $input.first().json;

if (!data) {
  throw new Error("Dados não fornecidos");
}

const requiredFields = [
  "avaliador_id",
  "form_id",
  "question_id",
  "response_value",
];
const missingFields = requiredFields.filter((field) => !data[field]);

if (missingFields.length > 0) {
  throw new Error(`Campos obrigatórios faltando: ${missingFields.join(", ")}`);
}

// Preparar dados para inserção
const insertData = {
  avaliador_id: data.avaliador_id,
  form_id: data.form_id,
  question_id: data.question_id,
  response_value: data.response_value,
  status: data.status || "draft",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

return { insertData };
```

### MySQL Node:

```
Operation: Insert rows in a table
Table: evaluation_responses

Columns:
- avaliador_id: {{ $json.insertData.avaliador_id }}
- form_id: {{ $json.insertData.form_id }}
- question_id: {{ $json.insertData.question_id }}
- response_value: {{ $json.insertData.response_value }}
- status: {{ $json.insertData.status }}
- created_at: {{ $json.insertData.created_at }}
- updated_at: {{ $json.insertData.updated_at }}
```

### Payload Frontend:

```json
{
  "operation": "create",
  "data": {
    "avaliador_id": "uuid_do_avaliador",
    "form_id": "uuid_do_formulario",
    "question_id": "uuid_da_questao",
    "response_value": "texto_da_resposta",
    "status": "draft"
  }
}
```

---

## 2️⃣ UPDATE - Atualizar Resposta

### Fluxo:

```
Switch (update) → Code → MySQL Update → Respond to Webhook
```

### Code Node:

```javascript
// Validar dados obrigatórios para update
const { data, id } = $input.first().json;

if (!data) {
  throw new Error("Dados não fornecidos");
}

if (!id) {
  throw new Error("ID da resposta é obrigatório para atualização");
}

// Preparar dados para atualização
const updateData = {
  id: id,
  response_value: data.response_value,
  status: data.status || "draft",
  updated_at: new Date().toISOString(),
};

return { updateData };
```

### MySQL Node:

```
Operation: Update rows in a table
Table: evaluation_responses
Data Mode: Map Each Column Below

Column to Match On: id
Value: {{ $json.updateData.id }}

Values to Send:
- response_value: {{ $json.updateData.response_value }}
- status: {{ $json.updateData.status }}
- updated_at: {{ $json.updateData.updated_at }}
```

### Payload Frontend:

```json
{
  "operation": "update",
  "id": "uuid_da_resposta",
  "data": {
    "response_value": "Nova resposta",
    "status": "draft"
  }
}
```

---

## 3️⃣ READ - Buscar Resposta Específica

### Fluxo:

```
Switch (read) → Code → MySQL Select → Edit Fields → Respond to Webhook
```

### Code Node:

```javascript
// Validar ID obrigatório para leitura
const { id } = $input.first().json;

if (!id) {
  throw new Error("ID da resposta é obrigatório");
}

return {
  searchId: id,
};
```

### MySQL Node:

```
Operation: Select rows from a table
Table: evaluation_responses
Limit: 1

Select Rows:
- Column: id
- Operator: Equal
- Value: {{ $json.searchId }}
```

### Edit Fields:

```javascript
success: {
  {
    $json.length > 0;
  }
}
message: {
  {
    $json.length > 0 ? "Resposta encontrada" : "Resposta não encontrada";
  }
}
data: {
  {
    $json.length > 0 ? $json[0] : null;
  }
}
timestamp: {
  {
    new Date().toISOString();
  }
}
```

---

## 4️⃣ READALL - Buscar Todas as Respostas

### Fluxo:

```
Switch (readAll) → Code → MySQL Select → Edit Fields → Respond to Webhook
```

### Code Node:

```javascript
// Validar parâmetros para buscar todas as respostas
const { avaliacao_id, form_id } = $input.first().json;

if (!avaliacao_id) {
  throw new Error("ID da avaliação é obrigatório");
}

return {
  avaliacao_id: avaliacao_id,
  form_id: form_id,
};
```

### MySQL Node:

```
Operation: Select rows from a table
Table: evaluation_responses
Limit: 50

Select Rows:
Condition 1:
- Column: avaliador_id
- Operator: Equal
- Value: {{ $json.avaliacao_id }}

Condition 2:
- Column: form_id
- Operator: Equal
- Value: {{ $json.form_id }}

Combine Conditions: AND

Sort:
- Column: created_at
- Direction: DESC
```

### Edit Fields:

```javascript
success: true;
message: "Respostas encontradas";
data: {
  {
    $json;
  }
}
count: {
  {
    $json.length;
  }
}
timestamp: {
  {
    new Date().toISOString();
  }
}
```

---

## 5️⃣ SAVEDRAFT - Salvar Progresso

### Fluxo:

```
Switch (saveDraft) → Code → MySQL Insert/Update → Respond to Webhook
```

### Code Node:

```javascript
// Validar dados obrigatórios para salvar progresso
const { data } = $input.first().json;

if (!data) {
  throw new Error("Dados não fornecidos");
}

const requiredFields = ["avaliador_id", "avaliacao_id"];
const missingFields = requiredFields.filter((field) => !data[field]);

if (missingFields.length > 0) {
  throw new Error(`Campos obrigatórios faltando: ${missingFields.join(", ")}`);
}

// Preparar dados para salvar progresso
const progressData = {
  avaliador_id: data.avaliador_id,
  avaliacao_id: data.avaliacao_id,
  total_questions: data.total_questions || 0,
  answered_questions: data.answered_questions || 0,
  progress_percentage: data.progress_percentage || 0.0,
  status: data.status || "in_progress",
  started_at: data.started_at || new Date().toISOString(),
  last_activity: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

return { progressData };
```

### MySQL Node:

```
Operation: Insert or update rows in a table
Table: evaluation_progress
Data Mode: Map Each Column Below

Column to Match On: avaliador_id
Value: {{ $json.progressData.avaliador_id }}

Values to Send:
- avaliacao_id: {{ $json.progressData.avaliacao_id }}
- total_questions: {{ $json.progressData.total_questions }}
- answered_questions: {{ $json.progressData.answered_questions }}
- progress_percentage: {{ $json.progressData.progress_percentage }}
- status: {{ $json.progressData.status }}
- started_at: {{ $json.progressData.started_at }}
- last_activity: {{ $json.progressData.last_activity }}
- updated_at: {{ $json.progressData.updated_at }}
```

### Payload Frontend:

```json
{
  "operation": "saveDraft",
  "data": {
    "avaliador_id": "user123",
    "avaliacao_id": "eval456",
    "total_questions": 10,
    "answered_questions": 3,
    "progress_percentage": 30.0,
    "status": "in_progress"
  }
}
```

---

## 6️⃣ SUBMITEVAL - Finalizar Avaliação

### Fluxo:

```
Switch (submitEval) → Code → MySQL Execute SQL → Respond to Webhook
```

### Code Node:

```javascript
// Validar dados obrigatórios para finalizar avaliação
const { data } = $input.first().json;

if (!data) {
  throw new Error("Dados não fornecidos");
}

const requiredFields = ["avaliador_id", "avaliacao_id"];
const missingFields = requiredFields.filter((field) => !data[field]);

if (missingFields.length > 0) {
  throw new Error(`Campos obrigatórios faltando: ${missingFields.join(", ")}`);
}

// Preparar dados para finalizar
const submitData = {
  avaliador_id: data.avaliador_id,
  avaliacao_id: data.avaliacao_id,
  status: "completed",
  progress_percentage: 100.0,
  completed_at: new Date().toISOString(),
  submitted_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

return { submitData };
```

### MySQL Node:

```
Operation: Execute a SQL query

Query:
UPDATE evaluation_progress
SET
  status = ?,
  progress_percentage = ?,
  completed_at = ?,
  submitted_at = ?,
  updated_at = ?
WHERE avaliador_id = ? AND avaliacao_id = ?

Parameters:
[
  "{{ $json.submitData.status }}",
  "{{ $json.submitData.progress_percentage }}",
  "{{ $json.submitData.completed_at }}",
  "{{ $json.submitData.submitted_at }}",
  "{{ $json.submitData.updated_at }}",
  "{{ $json.submitData.avaliador_id }}",
  "{{ $json.submitData.avaliacao_id }}"
]
```

### Payload Frontend:

```json
{
  "operation": "submitEvaluation",
  "data": {
    "avaliador_id": "user123",
    "avaliacao_id": "eval456"
  }
}
```

---

## 7️⃣ GETPROGRESS - Recuperar Progresso

### Fluxo:

```
Switch (getProgress) → Code → MySQL Select → Edit Fields → Respond to Webhook
```

### Code Node:

```javascript
// Validar dados obrigatórios para buscar progresso
const { avaliador_id, avaliacao_id } = $input.first().json;

if (!avaliador_id) {
  throw new Error("ID do avaliador é obrigatório");
}

if (!avaliacao_id) {
  throw new Error("ID da avaliação é obrigatório");
}

return {
  avaliador_id: avaliador_id,
  avaliacao_id: avaliacao_id,
};
```

### MySQL Node:

```
Operation: Select rows from a table
Table: evaluation_progress
Limit: 1

Select Rows:
Condition 1:
- Column: avaliador_id
- Operator: Equal
- Value: {{ $json.avaliador_id }}

Condition 2:
- Column: avaliacao_id
- Operator: Equal
- Value: {{ $json.avaliacao_id }}

Combine Conditions: AND
```

### Edit Fields:

```javascript
success: {
  {
    $json.length > 0;
  }
}
message: {
  {
    $json.length > 0 ? "Progresso encontrado" : "Nenhum progresso encontrado";
  }
}
data: {
  {
    $json.length > 0 ? $json[0] : null;
  }
}
timestamp: {
  {
    new Date().toISOString();
  }
}
```

### Payload Frontend:

```json
{
  "operation": "getProgress",
  "avaliador_id": "user123",
  "avaliacao_id": "eval456"
}
```

---

## 📋 Padrões de Resposta

### Sucesso:

```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {
    /* dados retornados */
  },
  "timestamp": "2025-09-02T10:30:00Z"
}
```

### Erro:

```json
{
  "success": false,
  "error": "Tipo do erro",
  "message": "Descrição detalhada do erro",
  "timestamp": "2025-09-02T10:30:00Z"
}
```

---

## 🔧 Configurações Frontend

### Endpoint no constants.ts:

```typescript
EVALUATION_RESPONSES: "/webhook/7f1f8f3b-38ce-43d5-9e6f-ce475e3eaf19";
```

### Exemplo de uso no React:

```typescript
const saveResponse = async (
  questionId: string,
  personId: string,
  response: any
) => {
  const payload = {
    operation: "create",
    data: {
      avaliador_id: userId,
      form_id: formId,
      question_id: questionId,
      response_value: response,
      status: "draft",
    },
  };

  const result = await authenticatedFetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EVALUATION_RESPONSES}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );
};
```

---

## ✅ Checklist de Implementação

- [x] Switch com 7 routing rules
- [x] CREATE - Inserir novas respostas
- [x] UPDATE - Atualizar respostas existentes
- [x] READ - Buscar resposta específica
- [x] READALL - Buscar todas as respostas
- [x] SAVEDRAFT - Salvar progresso
- [x] SUBMITEVAL - Finalizar avaliação
- [x] GETPROGRESS - Recuperar progresso
- [x] Tratamento de erros em todos os fluxos
- [x] Validação de campos obrigatórios
- [x] Estrutura do banco atualizada
- [x] Padrões de resposta consistentes

---

## 🚀 Próximos Passos

1. **Testes**: Testar cada endpoint individualmente
2. **Frontend**: Implementar hooks para consumir a API
3. **Validações**: Adicionar validações de negócio específicas
4. **Performance**: Otimizar queries para grandes volumes
5. **Logs**: Implementar sistema de auditoria

---

## 📝 Notas de Desenvolvimento

### Arquitetura

- Webhook único com Switch para roteamento
- Padrão CRUD completo
- Validações em Code Nodes
- Tratamento de erro padronizado
- Responses consistentes

### Decisões Técnicas

- MySQL com operações específicas para cada caso
- Edit Fields para formatação de respostas
- SQL personalizado apenas quando necessário
- Chave única composta para evitar duplicatas

---

**📅 Documentação criada em:** 02/09/2025  
**🔖 Versão:** 1.0  
**👨‍💻 Desenvolvedor:** Pedro  
**🏢 Projeto:** RH Cellar - Sistema de Avaliações
