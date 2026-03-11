import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("performance.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    frequency TEXT NOT NULL, -- 'daily' or comma-separated days '0,1,2,3,4,5,6'
    suggested_time TEXT,
    priority TEXT NOT NULL, -- 'Baixa', 'Média', 'Alta'
    description TEXT,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS habit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL, -- YYYY-MM-DD
    status INTEGER NOT NULL, -- 1 for done, 0 for not done
    check_time TEXT,
    FOREIGN KEY (habit_id) REFERENCES habits (id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    priority TEXT NOT NULL, -- 'Baixa', 'Média', 'Alta', 'Urgente'
    category TEXT NOT NULL,
    deadline TEXT, -- YYYY-MM-DD
    status TEXT NOT NULL, -- 'A Fazer', 'Em Andamento', 'Concluído', 'Arquivado'
    observations TEXT,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS daily_notes (
    date TEXT PRIMARY KEY, -- YYYY-MM-DD
    note TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    email TEXT,
    alert_time TEXT,
    alerts_enabled INTEGER DEFAULT 0,
    name TEXT,
    phrase TEXT,
    start_date TEXT,
    priorities TEXT, -- JSON string
    alarms TEXT, -- JSON string
    supreme_goal TEXT
  );

  CREATE TABLE IF NOT EXISTS generic_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    area_id TEXT NOT NULL,
    type TEXT NOT NULL,
    data TEXT NOT NULL, -- JSON string
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  INSERT OR IGNORE INTO settings (id, alerts_enabled) VALUES (1, 0);
`);

// Ensure columns exist for existing databases (outside of db.exec)
try { db.exec("ALTER TABLE settings ADD COLUMN name TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE settings ADD COLUMN phrase TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE settings ADD COLUMN start_date TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE settings ADD COLUMN priorities TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE settings ADD COLUMN alarms TEXT"); } catch (e) {}
try { db.exec("ALTER TABLE settings ADD COLUMN supreme_goal TEXT"); } catch (e) {}
  
  db.prepare(`
    UPDATE settings SET 
      name = ?,
      phrase = ?,
      start_date = ?,
      priorities = ?,
      alarms = ?,
      supreme_goal = ?
    WHERE id = 1
  `).run(
    'General Valente',
    '2026 é o ano da transformação total',
    '2024-12-20',
    JSON.stringify(["Saúde Mental", "Saúde Física", "Desenvolvimento Pessoal", "Carreira", "Vida Social", "Relacionamentos", "Finanças", "Família"]),
    JSON.stringify([
      { time: "06:00", label: "Meditação" },
      { time: "07:00", label: "Treino" },
      { time: "09:00", label: "Estudo (4h)" },
      { time: "14:00", label: "Trabalho" },
      { time: "18:00", label: "Leitura" },
      { time: "19:00", label: "Ligar pro filho" },
      { time: "21:00", label: "Oração" },
      { time: "22:00", label: "Revisão do dia" }
    ]),
    'Sair da monotonia, construir vida plena, alcançar 10k/mês, ter saúde física e mental, criar conexões reais, ser a melhor versão de mim mesmo'
  );

  db.exec(`
    -- Seed Data for Generic Records
    CREATE TABLE IF NOT EXISTS seed_check (id INTEGER PRIMARY KEY);
    INSERT OR IGNORE INTO seed_check (id) VALUES (1);
    
    -- Check if we already seeded
    SELECT COUNT(*) as count FROM generic_records;
  `);

const seeded = db.prepare("SELECT COUNT(*) as count FROM generic_records").get().count > 0;

if (!seeded) {
  const seedData = [
    // 1. Desenvolvimento Pessoal
    ...[
      { titulo: 'Quem Pensa Enriquece', autor: 'Napoleon Hill', categoria: 'Mindset', paginaAtual: 0, totalPaginas: 336, status: 'Quero Ler', dataAdicao: '2025-01-01' },
      { titulo: 'Atitude Mental Positiva', autor: 'Napoleon Hill & W. Stone', categoria: 'Mindset', paginaAtual: 0, totalPaginas: 352, status: 'Quero Ler' },
      { titulo: 'O Poder do Hábito', autor: 'Charles Duhigg', categoria: 'Produtividade', paginaAtual: 45, totalPaginas: 408, status: 'Lendo', dataInicio: '2024-12-15' },
      { titulo: 'Mindset', autor: 'Carol Dweck', categoria: 'Psicologia', paginaAtual: 0, totalPaginas: 312, status: 'Quero Ler' },
      { titulo: 'Hábitos Atômicos', autor: 'James Clear', categoria: 'Produtividade', paginaAtual: 0, totalPaginas: 320, status: 'Quero Ler' },
      { titulo: 'O Ego é Seu Inimigo', autor: 'Ryan Holiday', categoria: 'Filosofia', paginaAtual: 0, totalPaginas: 224, status: 'Quero Ler' },
      { titulo: 'Disciplina é Destino', autor: 'Ryan Holiday', categoria: 'Filosofia', paginaAtual: 0, totalPaginas: 256, status: 'Quero Ler' },
      { titulo: 'Essencialismo', autor: 'Greg McKeown', categoria: 'Produtividade', paginaAtual: 0, totalPaginas: 272, status: 'Quero Ler' },
      { titulo: 'Deep Work', autor: 'Cal Newport', categoria: 'Produtividade', paginaAtual: 0, totalPaginas: 304, status: 'Quero Ler' },
      { titulo: 'Pai Rico, Pai Pobre', autor: 'Robert Kiyosaki', categoria: 'Finanças', paginaAtual: 0, totalPaginas: 336, status: 'Quero Ler' }
    ].map(d => ({ area_id: 'desenvolvimento', type: 'livro', data: JSON.stringify(d) })),

    {
      area_id: 'desenvolvimento',
      type: 'curso',
      data: JSON.stringify({ nome: 'Geronomino THEML', plataforma: 'Curso Online', aulaAtual: 'Em andamento', status: 'Fazendo', dataInicio: '2024-12-10', categoria: 'Tecnologia' })
    },

    ...[
      { nome: 'Meditação', frequencia: 'Diária', duracaoAlvo: '60 minutos', streakAtual: 0, metaStreak: 30, horarioIdeal: '06:00', status: 'Ativo', categoria: 'Espiritualidade' },
      { nome: 'Estudo Focado', frequencia: 'Diária', duracaoAlvo: '4 horas', streakAtual: 0, metaStreak: 90, status: 'Ativo', categoria: 'Desenvolvimento' },
      { nome: 'Leitura', frequencia: 'Diária', duracaoAlvo: '30 minutos', meta: '52 livros no ano', streakAtual: 0, status: 'Ativo' },
      { nome: 'Musculação', frequencia: 'Diária', duracaoAlvo: '60 minutos', streakAtual: 0, metaStreak: 365, status: 'Ativo', categoria: 'Saúde' },
      { nome: 'Corrida', frequencia: '3x por semana', duracaoAlvo: '30 minutos', metaStreak: 90, streakAtual: 0, status: 'Ativo' },
      { nome: 'Comunicação Eficiente', frequencia: '3x por semana', descricao: 'Praticar comunicação clara e assertiva', meta: '12 semanas', status: 'Ativo' }
    ].map(d => ({ area_id: 'desenvolvimento', type: 'habito', data: JSON.stringify(d) })),

    { area_id: 'desenvolvimento', type: 'meta', data: JSON.stringify({ titulo: 'Ler 52 livros em 2026', status: 'Em Andamento' }) },

    // 2. Saúde & Fitness
    ...[
      { titulo: 'Perder 30kg', status: 'Em Andamento' },
      { titulo: 'Correr 5km sem parar', status: 'Em Andamento' },
      { titulo: 'Treinar todos os dias por 1 ano', status: 'Em Andamento' }
    ].map(d => ({ area_id: 'saude', type: 'meta', data: JSON.stringify(d) })),

    ...[
      { dia: 'Segunda', treino: 'Treino A', extra: 'Caminhada' },
      { dia: 'Terça', treino: 'Treino B', extra: 'Corrida' },
      { dia: 'Quarta', treino: 'Treino C', extra: 'Caminhada' },
      { dia: 'Quinta', treino: 'Treino A', extra: 'Corrida' },
      { dia: 'Sexta', treino: 'Treino B', extra: 'Caminhada' },
      { dia: 'Sábado', treino: 'Treino C', extra: 'Corrida' },
      { dia: 'Domingo', treino: 'Treino Leve', extra: 'Caminhada' }
    ].map(d => ({ area_id: 'saude', type: 'rotina', data: JSON.stringify(d) })),

    ...[
      { atividade: 'Musculação', duracao: 60, calorias: 350, tipo: 'Força', data: '2026-03-11', notas: 'Treino A (Peito/Tríceps)' },
      { atividade: 'Caminhada', duracao: 30, calorias: 150, tipo: 'Cardio', data: '2026-03-11' },
      { atividade: 'Musculação', duracao: 60, calorias: 400, tipo: 'Força', data: '2026-03-10', notas: 'Treino B (Costas/Bíceps)' },
      { atividade: 'Caminhada', duracao: 30, calorias: 150, tipo: 'Cardio', data: '2026-03-10' },
      { atividade: 'Musculação', duracao: 60, calorias: 380, tipo: 'Força', data: '2026-03-09', notas: 'Treino C (Pernas)' },
      { atividade: 'Caminhada', duracao: 30, calorias: 150, tipo: 'Cardio', data: '2026-03-09' }
    ].map(d => ({ area_id: 'saude', type: 'atividade', data: JSON.stringify(d) })),

    // 3. Finanças
    { area_id: 'financas', type: 'transacao', data: JSON.stringify({ descricao: 'Salário/Renda Principal', valor: 5000, tipo: 'Receita', categoria: 'Trabalho', data: '2024-12-05', status: 'Pago', recorrencia: 'Mensal' }) },
    ...[
      { descricao: 'Contas (Luz, Água, Internet)', valor: 300, tipo: 'Despesa', categoria: 'Utilidades', status: 'Pago' },
      { descricao: 'Alimentação', valor: 800, tipo: 'Despesa', categoria: 'Alimentação', status: 'Pago' },
      { descricao: 'Transporte', valor: 200, tipo: 'Despesa', categoria: 'Transporte', status: 'Pago' }
    ].map(d => ({ area_id: 'financas', type: 'transacao', data: JSON.stringify(d) })),
    { area_id: 'financas', type: 'transacao', data: JSON.stringify({ descricao: 'Investimento Mensal', valor: 200, tipo: 'Investimento', categoria: 'Poupança/CDB', data: '2024-12-10', status: 'Pago', recorrencia: 'Mensal' }) },
    { area_id: 'financas', type: 'divida', data: JSON.stringify({ descricao: 'Dívida 1', valorTotal: 0, status: 'Em Quitação' }) },
    ...[
      { titulo: 'Economizar R$ 500/mês', status: 'Pendente' },
      { titulo: 'Quitar todas as dívidas', status: 'Pendente' },
      { titulo: 'Alcançar renda de R$ 10.000/mês', status: 'Pendente' },
      { titulo: 'Construir reserva de emergência', status: 'Pendente' }
    ].map(d => ({ area_id: 'financas', type: 'meta', data: JSON.stringify(d) })),

    // 4. Carreira
    ...[
      { projeto: 'Cliente Atual - Projeto Web', cliente: 'Cliente Principal', valor: 5000, deadline: '2025-01-31', prioridade: 'Alta', status: 'Em Andamento', descricao: 'Desenvolvimento de site + identidade visual' },
      { projeto: 'Estruturação Agência IA', cliente: 'Próprio Negócio', deadline: '2025-02-28', prioridade: 'Alta', status: 'Planejando', descricao: 'Estruturar oferta e processos da agência' }
    ].map(d => ({ area_id: 'carreira', type: 'projeto', data: JSON.stringify(d) })),
    ...[
      { nome: 'Inglês', tipo: 'Idioma', status: 'Iniciando', prioridade: 'Alta', meta: 'Fluência em 12 meses' },
      { nome: 'Automação com IA', tipo: 'Técnica', status: 'Estudando', prioridade: 'Alta', meta: 'Dominar em 6 meses' },
      { nome: 'Comunicação', tipo: 'Soft Skill', status: 'Praticando', prioridade: 'Alta', meta: 'Comunicador eficiente em 6 meses' },
      { nome: 'Vendas', tipo: 'Soft Skill', status: 'Iniciando', prioridade: 'Alta', meta: 'Fechar 5 clientes/mês em 6 meses' }
    ].map(d => ({ area_id: 'carreira', type: 'habilidade', data: JSON.stringify(d) })),
    ...[
      { titulo: 'Alcançar R$ 10.000/mês' },
      { titulo: 'Ter 5 clientes fixos' },
      { titulo: 'Dominar automação com IA' },
      { titulo: 'Falar inglês fluente' },
      { titulo: 'Ser comunicador eficiente' },
      { titulo: 'Desenvolver habilidades de vendas' }
    ].map(d => ({ area_id: 'carreira', type: 'meta', data: JSON.stringify(d) })),

    // 5. Relacionamentos
    { area_id: 'relacionamentos', type: 'interacao', data: JSON.stringify({ pessoa: 'Status Atual', proximaAcao: 'Solteiro, buscando relacionamento' }) },
    ...[
      { titulo: 'Conhecer pessoas novas' },
      { titulo: 'Ter encontros regulares' },
      { titulo: 'Construir relacionamento saudável' },
      { titulo: 'Desenvolver habilidades sociais' }
    ].map(d => ({ area_id: 'relacionamentos', type: 'meta', data: JSON.stringify(d) })),
    ...[
      { titulo: 'Melhorar Comunicação', tipo: 'Desenvolvimento Pessoal', frequencia: '3x por semana', prazo: '90 dias', status: 'Ativo' },
      { titulo: 'Expandir Círculo Social', tipo: 'Networking', meta: 'Conhecer 10 pessoas novas/mês', status: 'Planejado' },
      { titulo: 'Trabalhar Autoestima', tipo: 'Desenvolvimento Pessoal', descricao: 'Terapia + Hábitos saudáveis', status: 'Ativo' }
    ].map(d => ({ area_id: 'relacionamentos', type: 'acao', data: JSON.stringify(d) })),

    // 6. Família
    ...[
      { titulo: 'Ligar para o Filho', frequencia: 'Semanal (aumentar para diária)', objetivo: 'Fortalecer vínculo', status: 'Ativo' },
      { titulo: 'Tempo com os Pais', frequencia: 'Diária (mora junto)', objetivo: 'Conversas de qualidade', status: 'Ativo' },
      { titulo: 'Contato com Irmãos', frequencia: 'Semanal', objetivo: 'Manter vínculos fortes', status: 'Ativo' }
    ].map(d => ({ area_id: 'familia', type: 'meta', data: JSON.stringify(d) })),
    { area_id: 'familia', type: 'tarefa', data: JSON.stringify({ titulo: 'Ligar pro filho', prioridade: 'Urgente', status: 'A Fazer' }) },

    // 7. Lazer & Diversão
    { area_id: 'lazer', type: 'atividade', data: JSON.stringify({ nome: 'Assistir Filmes', frequencia: 'Eventual', categoria: 'Entretenimento Passivo' }) },
    ...[
      { titulo: 'Assistir 1 Filme por Semana', tipo: 'Entretenimento', categoria: 'Cinema', status: 'Ativo' },
      { titulo: 'Explorar Novo Hobby', categoria: 'Música, arte, esportes', status: 'Planejado' },
      { titulo: 'Sair de Casa 1x por Semana', tipo: 'Social', status: 'Planejado' }
    ].map(d => ({ area_id: 'lazer', type: 'meta', data: JSON.stringify(d) })),

    // 8. Espiritualidade
    ...[
      { nome: 'Meditação', duracao: 60, horario: '06:00', streak: 0, meta: 365, status: 'Ativo' },
      { nome: 'Oração', duracao: 60, horario: '21:00', streak: 0, meta: 365, status: 'Ativo' }
    ].map(d => ({ area_id: 'espiritualidade', type: 'pratica', data: JSON.stringify(d) })),
    ...[
      { titulo: 'Manter prática diária de 2h' },
      { titulo: 'Desenvolver paz interior' },
      { titulo: 'Fortalecer fé e propósito' },
      { titulo: 'Usar espiritualidade como base para transformação' }
    ].map(d => ({ area_id: 'espiritualidade', type: 'meta', data: JSON.stringify(d) })),

    // 9. Ambiente Físico
    ...[
      { titulo: 'Organizar Quarto', prazo: 'Esta semana', prioridade: 'Alta', status: 'A Fazer' },
      { titulo: 'Organizar Espaço de Trabalho', prazo: 'Esta semana', prioridade: 'Alta', status: 'A Fazer' },
      { titulo: 'Criar Rotina de Limpeza', prazo: 'Diária (15min)', prioridade: 'Média', status: 'A Fazer' }
    ].map(d => ({ area_id: 'ambiente', type: 'tarefa', data: JSON.stringify(d) })),
    { area_id: 'ambiente', type: 'meta', data: JSON.stringify({ titulo: 'Ambiente organizado = mente organizada', status: 'Em Andamento' }) },

    // 10. Vida Social
    ...[
      { titulo: 'Fazer 1 Amigo Novo', prazo: '30 dias', status: 'Prioritário' },
      { titulo: 'Sair 1x por Semana', status: 'A Começar' },
      { titulo: 'Participar de Comunidade Online', status: 'A Pesquisar' },
      { titulo: 'Curso/Workshop Presencial', status: 'A Planejar' }
    ].map(d => ({ area_id: 'social', type: 'meta', data: JSON.stringify(d) })),
    ...[
      { titulo: 'Buscar grupos de interesse' },
      { titulo: 'Aceitar convites sociais' },
      { titulo: 'Começar pequeno' },
      { titulo: 'Considerar terapia' }
    ].map(d => ({ area_id: 'social', type: 'acao', data: JSON.stringify(d) })),

    // 11. Contribuição
    ...[
      { titulo: 'Trabalho Voluntário', tempo: '10h/mês', status: 'A Começar' },
      { titulo: 'Doação Mensal', status: 'Planejado' }
    ].map(d => ({ area_id: 'contribuicao', type: 'meta', data: JSON.stringify(d) })),
    ...[
      { causa: 'Pesquisar ONGs Locais', data: '2025-01-01' },
      { causa: 'Primeira Visita Voluntária', data: '2025-01-15' }
    ].map(d => ({ area_id: 'contribuicao', type: 'acao', data: JSON.stringify(d) })),

    // 12. Hobbies & Criatividade
    ...[
      { titulo: 'Começar Violão', status: 'A Começar' },
      { titulo: 'Comprar Primeiro Instrumento', status: 'Planejado' },
      { titulo: 'Praticar Regularmente', status: 'A Começar' }
    ].map(d => ({ area_id: 'hobbies', type: 'meta', data: JSON.stringify(d) })),
    { area_id: 'hobbies', type: 'projeto', data: JSON.stringify({ titulo: 'Aprender Música', beneficio: 'Expressão, relaxamento, social', prazo: '3 meses' }) }
  ];

  const insert = db.prepare("INSERT INTO generic_records (area_id, type, data) VALUES (?, ?, ?)");
  seedData.forEach(item => {
    insert.run(item.area_id, item.type, item.data);
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // --- API Routes ---

  // Generic Records
  app.get("/api/records/:areaId", (req, res) => {
    const records = db.prepare("SELECT * FROM generic_records WHERE area_id = ? ORDER BY created_at DESC").all(req.params.areaId);
    res.json(records.map(r => ({ ...r, data: JSON.parse(r.data) })));
  });

  app.post("/api/records", (req, res) => {
    const { area_id, type, data } = req.body;
    const info = db.prepare(`
      INSERT INTO generic_records (area_id, type, data)
      VALUES (?, ?, ?)
    `).run(area_id, type, JSON.stringify(data));
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/records/:id", (req, res) => {
    const { data, type } = req.body;
    db.prepare(`
      UPDATE generic_records SET data = ?, type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(JSON.stringify(data), type, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/records/:id", (req, res) => {
    db.prepare("DELETE FROM generic_records WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/records-all", (req, res) => {
    const records = db.prepare("SELECT * FROM generic_records").all();
    res.json(records.map(r => ({ ...r, data: JSON.parse(r.data) })));
  });

  // Habits
  app.get("/api/habits", (req, res) => {
    const habits = db.prepare("SELECT * FROM habits").all();
    res.json(habits);
  });

  app.post("/api/habits", (req, res) => {
    const { name, category, frequency, suggested_time, priority, description } = req.body;
    const info = db.prepare(`
      INSERT INTO habits (name, category, frequency, suggested_time, priority, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, category, frequency, suggested_time, priority, description);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/habits/:id", (req, res) => {
    const { name, category, frequency, suggested_time, priority, description, active } = req.body;
    db.prepare(`
      UPDATE habits SET name = ?, category = ?, frequency = ?, suggested_time = ?, priority = ?, description = ?, active = ?
      WHERE id = ?
    `).run(name, category, frequency, suggested_time, priority, description, active, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/habits/:id", (req, res) => {
    db.prepare("DELETE FROM habits WHERE id = ?").run(req.params.id);
    db.prepare("DELETE FROM habit_logs WHERE habit_id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Habit Logs
  app.get("/api/habit-logs", (req, res) => {
    const { date } = req.query;
    const logs = db.prepare("SELECT * FROM habit_logs WHERE date = ?").all(date);
    res.json(logs);
  });

  app.post("/api/habit-logs", (req, res) => {
    const { habit_id, date, status, check_time } = req.body;
    // Upsert log
    const existing = db.prepare("SELECT id FROM habit_logs WHERE habit_id = ? AND date = ?").get(habit_id, date);
    if (existing) {
      db.prepare("UPDATE habit_logs SET status = ?, check_time = ? WHERE id = ?")
        .run(status, check_time, existing.id);
    } else {
      db.prepare("INSERT INTO habit_logs (habit_id, date, status, check_time) VALUES (?, ?, ?, ?)")
        .run(habit_id, date, status, check_time);
    }
    res.json({ success: true });
  });

  // Tasks (DDD)
  app.get("/api/tasks", (req, res) => {
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY deadline ASC, priority DESC").all();
    res.json(tasks);
  });

  app.post("/api/tasks", (req, res) => {
    const { title, priority, category, deadline, status, observations, habit_id } = req.body;
    const info = db.prepare(`
      INSERT INTO tasks (title, priority, category, deadline, status, observations, habit_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(title, priority, category, deadline, status, observations, habit_id);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/tasks/:id", (req, res) => {
    const { title, priority, category, deadline, status, observations, completed_at, habit_id, fail_reason } = req.body;
    db.prepare(`
      UPDATE tasks SET title = ?, priority = ?, category = ?, deadline = ?, status = ?, observations = ?, completed_at = ?, habit_id = ?, fail_reason = ?
      WHERE id = ?
    `).run(title, priority, category, deadline, status, observations, completed_at, habit_id, fail_reason, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/tasks/:id", (req, res) => {
    db.prepare("DELETE FROM tasks WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Daily Notes
  app.get("/api/notes/:date", (req, res) => {
    const note = db.prepare("SELECT note FROM daily_notes WHERE date = ?").get(req.params.date);
    res.json(note || { note: "" });
  });

  app.post("/api/notes", (req, res) => {
    const { date, note } = req.body;
    db.prepare("INSERT OR REPLACE INTO daily_notes (date, note) VALUES (?, ?)").run(date, note);
    res.json({ success: true });
  });

  // Settings
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings WHERE id = 1").get();
    res.json(settings);
  });

  app.post("/api/settings", (req, res) => {
    const { email, alert_time, alerts_enabled, name, phrase, start_date, priorities, alarms, supreme_goal } = req.body;
    db.prepare(`
      UPDATE settings SET 
        email = ?, 
        alert_time = ?, 
        alerts_enabled = ?,
        name = ?,
        phrase = ?,
        start_date = ?,
        priorities = ?,
        alarms = ?,
        supreme_goal = ?
      WHERE id = 1
    `).run(
      email, 
      alert_time, 
      alerts_enabled ? 1 : 0,
      name,
      phrase,
      start_date,
      typeof priorities === 'string' ? priorities : JSON.stringify(priorities),
      typeof alarms === 'string' ? alarms : JSON.stringify(alarms),
      supreme_goal
    );
    res.json({ success: true });
  });

  // Metrics
  app.get("/api/metrics", (req, res) => {
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last30Days.push(d.toISOString().split('T')[0]);
    }

    const habitStats = db.prepare(`
      SELECT date, COUNT(*) as total, SUM(status) as completed
      FROM habit_logs
      WHERE date >= ?
      GROUP BY date
    `).all(last30Days[0]);

    const taskStats = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM tasks
      WHERE status = 'Concluído'
      GROUP BY category
    `).all();

    const perHabitStats = db.prepare(`
      SELECT h.name, COUNT(l.id) as total_logs, SUM(l.status) as completed_logs
      FROM habits h
      LEFT JOIN habit_logs l ON h.id = l.habit_id
      GROUP BY h.id
    `).all();

    const performanceHistory = last30Days.map(date => {
      const h = habitStats.find(s => s.date === date) || { total: 0, completed: 0 };
      const t = db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status = 'Concluído' AND completed_at = ? THEN 1 ELSE 0 END) as completed FROM tasks WHERE deadline = ? OR completed_at = ?").get(date, date, date);
      
      const habitScore = h.total > 0 ? (h.completed / h.total) * 100 : 0;
      const taskScore = t.total > 0 ? (t.completed / t.total) * 100 : 0;
      
      let overall = 0;
      if (h.total > 0 && t.total > 0) overall = (habitScore + taskScore) / 2;
      else if (h.total > 0) overall = habitScore;
      else if (t.total > 0) overall = taskScore;

      return { date, habitScore, taskScore, overall };
    });

    const avgPerformance = performanceHistory.reduce((acc, curr) => acc + curr.overall, 0) / performanceHistory.length;
    let summaryPhrase = "Sua performance está em desenvolvimento. Mantenha o foco!";
    if (avgPerformance > 80) summaryPhrase = "Excelente! Você está operando em nível de elite. Continue assim!";
    else if (avgPerformance > 50) summaryPhrase = "Bom progresso, mas há espaço para mais disciplina. Ajuste sua rota.";
    else if (avgPerformance > 0) summaryPhrase = "Atenção: sua performance está abaixo do esperado. Recupere o controle hoje.";

    res.json({
      performanceHistory,
      taskDistribution: taskStats,
      perHabitStats,
      summaryPhrase
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
