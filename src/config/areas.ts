import { AreaConfig } from '../types';

export const CONFIG_AREAS: AreaConfig[] = [
  {
    id: 'desenvolvimento',
    nome: 'Desenvolvimento Pessoal',
    icon: '📚',
    cor: '#3b82f6',
    tiposItem: ['livro', 'curso', 'habito', 'meta'],
    campos: {
      livro: [
        { nome: 'titulo', label: 'Nome do Livro', tipo: 'text', required: true },
        { nome: 'autor', label: 'Autor', tipo: 'text', required: true },
        { nome: 'categoria', label: 'Categoria', tipo: 'select', options: ['Mindset', 'Produtividade', 'Psicologia', 'Filosofia', 'Finanças', 'Ficção', 'Não-ficção', 'Autoajuda', 'Técnico', 'Biografia'] },
        { nome: 'paginaAtual', label: 'Página Atual', tipo: 'number' },
        { nome: 'totalPaginas', label: 'Total de Páginas', tipo: 'number' },
        { nome: 'dataInicio', label: 'Data de Início', tipo: 'date' },
        { nome: 'dataFim', label: 'Data de Conclusão', tipo: 'date' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Quero Ler', 'Lendo', 'Lido', 'Pausado'] },
        { nome: 'rating', label: 'Rating', tipo: 'select', options: ['1 Estrela', '2 Estrelas', '3 Estrelas', '4 Estrelas', '5 Estrelas'] },
        { nome: 'notas', label: 'Notas/Resumo', tipo: 'textarea' }
      ],
      curso: [
        { nome: 'nome', label: 'Nome do Curso', tipo: 'text', required: true },
        { nome: 'plataforma', label: 'Plataforma', tipo: 'select', options: ['Udemy', 'Coursera', 'Alura', 'YouTube', 'Curso Online', 'Outro'] },
        { nome: 'instrutor', label: 'Instrutor', tipo: 'text' },
        { nome: 'aulaAtual', label: 'Aula Atual', tipo: 'text' },
        { nome: 'totalAulas', label: 'Total de Aulas', tipo: 'number' },
        { nome: 'horasTotais', label: 'Horas Totais', tipo: 'number' },
        { nome: 'certificado', label: 'Certificado Obtido', tipo: 'checkbox' },
        { nome: 'linkCurso', label: 'Link do Curso', tipo: 'url' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Não Iniciado', 'Fazendo', 'Em Andamento', 'Concluído'] },
        { nome: 'dataInicio', label: 'Data de Início', tipo: 'date' },
        { nome: 'previsaoConclusao', label: 'Previsão de Conclusão', tipo: 'date' },
        { nome: 'categoria', label: 'Categoria', tipo: 'select', options: ['Tecnologia', 'Negócios', 'Design', 'Outros'] },
        { nome: 'notas', label: 'Notas', tipo: 'textarea' }
      ],
      habito: [
        { nome: 'nome', label: 'Nome do Hábito', tipo: 'text', required: true },
        { nome: 'descricao', label: 'Descrição', tipo: 'textarea' },
        { nome: 'frequencia', label: 'Frequência', tipo: 'select', options: ['Diária', '3x por semana', 'Semanal', 'Mensal'] },
        { nome: 'duracaoAlvo', label: 'Duração Alvo', tipo: 'text' },
        { nome: 'meta', label: 'Meta', tipo: 'text' },
        { nome: 'metaStreak', label: 'Meta de Dias (Streak)', tipo: 'number' },
        { nome: 'streakAtual', label: 'Streak Atual', tipo: 'number' },
        { nome: 'melhorSequencia', label: 'Melhor Sequência', tipo: 'number' },
        { nome: 'horarioIdeal', label: 'Horário Ideal', tipo: 'time' },
        { nome: 'lembrete', label: 'Lembrete', tipo: 'checkbox' },
        { nome: 'categoria', label: 'Categoria', tipo: 'select', options: ['Espiritualidade', 'Desenvolvimento', 'Saúde', 'Outros'] },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Ativo', 'Pausado', 'Concluído'] }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'prazo', label: 'Prazo', tipo: 'date' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Em Andamento', 'Concluído'] }
      ]
    },
    colunasKanban: ['Quero Ler', 'Lendo', 'Lido'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['pizza', 'linha', 'barras']
  },
  {
    id: 'saude',
    nome: 'Saúde & Fitness',
    icon: '💪',
    cor: '#10b981',
    tiposItem: ['atividade', 'medicao', 'meta', 'rotina'],
    campos: {
      atividade: [
        { nome: 'atividade', label: 'Atividade', tipo: 'text', required: true },
        { nome: 'duracao', label: 'Duração (min)', tipo: 'number' },
        { nome: 'calorias', label: 'Calorias', tipo: 'number' },
        { nome: 'tipo', label: 'Tipo', tipo: 'select', options: ['Cardio', 'Força', 'Flexibilidade', 'Outro'] },
        { nome: 'data', label: 'Data', tipo: 'date' },
        { nome: 'notas', label: 'Notas', tipo: 'text' }
      ],
      medicao: [
        { nome: 'tipo', label: 'Tipo', tipo: 'select', options: ['Peso', 'Gordura %', 'Sono (h)'] },
        { nome: 'valor', label: 'Valor', tipo: 'number' },
        { nome: 'data', label: 'Data', tipo: 'date' }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Em Andamento', 'Concluído'] }
      ],
      rotina: [
        { nome: 'dia', label: 'Dia da Semana', tipo: 'select', options: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'] },
        { nome: 'treino', label: 'Treino', tipo: 'text' },
        { nome: 'extra', label: 'Extra (Caminhada/Corrida)', tipo: 'text' }
      ]
    },
    colunasKanban: ['Planejado', 'Em Execução', 'Concluído'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['linha', 'barras']
  },
  {
    id: 'financas',
    nome: 'Finanças',
    icon: '💰',
    cor: '#f59e0b',
    tiposItem: ['transacao', 'divida', 'meta'],
    campos: {
      transacao: [
        { nome: 'descricao', label: 'Descrição', tipo: 'text', required: true },
        { nome: 'valor', label: 'Valor (R$)', tipo: 'number' },
        { nome: 'tipo', label: 'Tipo', tipo: 'select', options: ['Receita', 'Despesa', 'Investimento'] },
        { nome: 'categoria', label: 'Categoria', tipo: 'select', options: ['Trabalho', 'Utilidades', 'Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Investimentos', 'Poupança/CDB', 'Outros'] },
        { nome: 'data', label: 'Data', tipo: 'date' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Pago', 'Agendado'] },
        { nome: 'recorrencia', label: 'Recorrência', tipo: 'select', options: ['Nenhuma', 'Mensal', 'Semanal', 'Anual'] }
      ],
      divida: [
        { nome: 'descricao', label: 'Descrição', tipo: 'text', required: true },
        { nome: 'valorTotal', label: 'Valor Total', tipo: 'number' },
        { nome: 'parcelas', label: 'Parcelas', tipo: 'text' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Em Quitação', 'Pago'] }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'valorAlvo', label: 'Valor Alvo', tipo: 'number' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Em Andamento', 'Concluído'] }
      ]
    },
    colunasKanban: ['Pendente', 'Pago', 'Agendado'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['pizza', 'linha']
  },
  {
    id: 'carreira',
    nome: 'Carreira',
    icon: '💼',
    cor: '#8b5cf6',
    tiposItem: ['projeto', 'habilidade', 'meta'],
    campos: {
      projeto: [
        { nome: 'projeto', label: 'Projeto', tipo: 'text', required: true },
        { nome: 'cliente', label: 'Cliente', tipo: 'text' },
        { nome: 'valor', label: 'Valor (R$)', tipo: 'number' },
        { nome: 'deadline', label: 'Deadline', tipo: 'date' },
        { nome: 'prioridade', label: 'Prioridade', tipo: 'select', options: ['Baixa', 'Média', 'Alta', 'Urgente'] },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Prospecção', 'Planejando', 'Em Andamento', 'Concluído', 'Pausado'] },
        { nome: 'descricao', label: 'Descrição', tipo: 'textarea' }
      ],
      habilidade: [
        { nome: 'nome', label: 'Habilidade', tipo: 'text', required: true },
        { nome: 'tipo', label: 'Tipo', tipo: 'select', options: ['Técnica', 'Soft Skill', 'Idioma'] },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Iniciando', 'Estudando', 'Praticando', 'Dominado'] },
        { nome: 'prioridade', label: 'Prioridade', tipo: 'select', options: ['Baixa', 'Média', 'Alta'] },
        { nome: 'meta', label: 'Meta', tipo: 'text' }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'prazo', label: 'Prazo', tipo: 'date' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Em Andamento', 'Concluído'] }
      ]
    },
    colunasKanban: ['A Fazer', 'Fazendo', 'Feito'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['barras', 'pizza']
  },
  {
    id: 'relacionamentos',
    nome: 'Relacionamentos',
    icon: '❤️',
    cor: '#ef4444',
    tiposItem: ['interacao', 'meta', 'acao'],
    campos: {
      interacao: [
        { nome: 'pessoa', label: 'Pessoa', tipo: 'text', required: true },
        { nome: 'ultimoEncontro', label: 'Último Encontro', tipo: 'date' },
        { nome: 'proximaAcao', label: 'Próxima Ação', tipo: 'text' }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Em Andamento', 'Concluído'] }
      ],
      acao: [
        { nome: 'titulo', label: 'Ação', tipo: 'text', required: true },
        { nome: 'tipo', label: 'Tipo', tipo: 'text' },
        { nome: 'frequencia', label: 'Frequência', tipo: 'text' },
        { nome: 'prazo', label: 'Prazo', tipo: 'text' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Ativo', 'Planejado', 'Concluído'] }
      ]
    },
    colunasKanban: ['Planejado', 'Agendado', 'Realizado'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['barras']
  },
  {
    id: 'familia',
    nome: 'Família',
    icon: '👨👩👧',
    cor: '#ec4899',
    tiposItem: ['evento', 'meta', 'tarefa'],
    campos: {
      evento: [
        { nome: 'titulo', label: 'Evento', tipo: 'text', required: true },
        { nome: 'data', label: 'Data', tipo: 'date' },
        { nome: 'descricao', label: 'Descrição', tipo: 'text' }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'frequencia', label: 'Frequência', tipo: 'text' },
        { nome: 'objetivo', label: 'Objetivo', tipo: 'text' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Ativo', 'Pendente', 'Concluído'] }
      ],
      tarefa: [
        { nome: 'titulo', label: 'Tarefa', tipo: 'text', required: true },
        { nome: 'prioridade', label: 'Prioridade', tipo: 'select', options: ['Baixa', 'Média', 'Alta', 'Urgente'] },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['A Fazer', 'Em Andamento', 'Concluído'] }
      ]
    },
    colunasKanban: ['Ideia', 'Confirmado', 'Realizado'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['barras']
  },
  {
    id: 'lazer',
    nome: 'Lazer',
    icon: '🎮',
    cor: '#06b6d4',
    tiposItem: ['atividade', 'meta'],
    campos: {
      atividade: [
        { nome: 'nome', label: 'Atividade', tipo: 'text', required: true },
        { nome: 'data', label: 'Data', tipo: 'date' },
        { nome: 'categoria', label: 'Categoria', tipo: 'text' },
        { nome: 'frequencia', label: 'Frequência', tipo: 'text' }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'tipo', label: 'Tipo', tipo: 'text' },
        { nome: 'categoria', label: 'Categoria', tipo: 'text' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Ativo', 'Planejado', 'Concluído'] }
      ]
    },
    colunasKanban: ['Desejo', 'Planejado', 'Feito'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['barras']
  },
  {
    id: 'espiritualidade',
    nome: 'Espiritualidade',
    icon: '🧘',
    cor: '#6366f1',
    tiposItem: ['pratica', 'meta'],
    campos: {
      pratica: [
        { nome: 'nome', label: 'Prática', tipo: 'text', required: true },
        { nome: 'duracao', label: 'Duração (min)', tipo: 'number' },
        { nome: 'horario', label: 'Horário', tipo: 'time' },
        { nome: 'streak', label: 'Streak', tipo: 'number' },
        { nome: 'meta', label: 'Meta (dias)', tipo: 'number' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Ativo', 'Pausado'] }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Em Andamento', 'Concluído'] }
      ]
    },
    colunasKanban: ['Pendente', 'Concluído'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['linha']
  },
  {
    id: 'ambiente',
    nome: 'Ambiente',
    icon: '🏡',
    cor: '#4ade80',
    tiposItem: ['melhoria', 'tarefa', 'meta'],
    campos: {
      melhoria: [
        { nome: 'item', label: 'Item/Cômodo', tipo: 'text', required: true },
        { nome: 'acao', label: 'Ação', tipo: 'text' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Em Progresso', 'Finalizado'] }
      ],
      tarefa: [
        { nome: 'titulo', label: 'Tarefa', tipo: 'text', required: true },
        { nome: 'prazo', label: 'Prazo', tipo: 'text' },
        { nome: 'prioridade', label: 'Prioridade', tipo: 'select', options: ['Baixa', 'Média', 'Alta'] },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['A Fazer', 'Em Andamento', 'Concluído'] }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Em Andamento', 'Concluído'] }
      ]
    },
    colunasKanban: ['Pendente', 'Em Progresso', 'Finalizado'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['pizza']
  },
  {
    id: 'social',
    nome: 'Social',
    icon: '🤝',
    cor: '#f472b6',
    tiposItem: ['evento', 'meta', 'acao'],
    campos: {
      evento: [
        { nome: 'nome', label: 'Evento/Encontro', tipo: 'text', required: true },
        { nome: 'data', label: 'Data', tipo: 'date' },
        { nome: 'local', label: 'Local', tipo: 'text' }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'prazo', label: 'Prazo', tipo: 'text' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['Pendente', 'Prioritário', 'A Começar', 'Concluído'] }
      ],
      acao: [
        { nome: 'titulo', label: 'Ação', tipo: 'text', required: true },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['A Fazer', 'Em Andamento', 'Concluído'] }
      ]
    },
    colunasKanban: ['Convite', 'Confirmado', 'Fui'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['barras']
  },
  {
    id: 'contribuicao',
    nome: 'Contribuição',
    icon: '🌍',
    cor: '#fbbf24',
    tiposItem: ['acao', 'meta'],
    campos: {
      acao: [
        { nome: 'causa', label: 'Causa/Projeto', tipo: 'text', required: true },
        { nome: 'valor', label: 'Valor/Tempo', tipo: 'text' },
        { nome: 'data', label: 'Data', tipo: 'date' }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'tempo', label: 'Tempo/Mês', tipo: 'text' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['A Começar', 'Planejado', 'Ativo'] }
      ]
    },
    colunasKanban: ['Ideia', 'Planejado', 'Realizado'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['barras']
  },
  {
    id: 'hobbies',
    nome: 'Hobbies',
    icon: '🎨',
    cor: '#a78bfa',
    tiposItem: ['atividade', 'meta', 'projeto'],
    campos: {
      atividade: [
        { nome: 'hobby', label: 'Hobby', tipo: 'text', required: true },
        { nome: 'tempoGasto', label: 'Tempo Gasto (min)', tipo: 'number' },
        { nome: 'data', label: 'Data', tipo: 'date' }
      ],
      meta: [
        { nome: 'titulo', label: 'Meta', tipo: 'text', required: true },
        { nome: 'prazo', label: 'Prazo', tipo: 'text' },
        { nome: 'status', label: 'Status', tipo: 'select', options: ['A Começar', 'Planejado', 'Ativo'] }
      ],
      projeto: [
        { nome: 'titulo', label: 'Projeto Criativo', tipo: 'text', required: true },
        { nome: 'beneficio', label: 'Benefício', tipo: 'text' },
        { nome: 'prazo', label: 'Prazo', tipo: 'text' }
      ]
    },
    colunasKanban: ['Ideia', 'Praticando', 'Mestre'],
    views: ['Dashboard', 'Tabela', 'Calendário', 'Kanban', 'Metas'],
    graficos: ['linha', 'barras']
  }
];
