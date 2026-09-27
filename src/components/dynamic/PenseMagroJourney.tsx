import React, { useEffect, useMemo, useState } from 'react';
import { Brain, Check, ChevronLeft, ChevronRight, Circle, Save, Sparkles, Trophy } from 'lucide-react';
import { GenericRecord } from '../../types';

type JourneyDay = {
  day: number;
  title: string;
  focus: string;
  tasks: string[];
  reflection: string;
};

const DAYS: JourneyDay[] = [
  { day: 1, title: 'Vantagens de emagrecer', focus: 'Construa uma motivação que possa ser relida todos os dias.', tasks: ['Escrever minhas principais razões para emagrecer', 'Criar meu cartão de vantagens', 'Definir dois horários para reler o cartão'], reflection: 'Quais mudanças farão maior diferença na minha vida?' },
  { day: 2, title: 'Escolha uma alimentação razoável', focus: 'Adote um plano saudável que seja possível manter.', tasks: ['Definir meu plano alimentar principal', 'Definir uma alternativa para imprevistos', 'Anotar dúvidas para um profissional de saúde'], reflection: 'O que torna esse plano realista para mim?' },
  { day: 3, title: 'Sente-se para comer', focus: 'Transforme toda refeição em uma decisão consciente.', tasks: ['Comer apenas sentado', 'Criar um lembrete visível', 'Registrar quando foi difícil cumprir'], reflection: 'Em quais situações costumo comer sem perceber?' },
  { day: 4, title: 'Elogie-se', focus: 'Reconheça cada escolha positiva, mesmo as pequenas.', tasks: ['Elogiar três boas escolhas do dia', 'Anotar uma vitória', 'Evitar diminuir meu próprio esforço'], reflection: 'O que fiz hoje que merece reconhecimento?' },
  { day: 5, title: 'Coma devagar e com atenção', focus: 'Dê tempo ao corpo para perceber a refeição.', tasks: ['Reduzir o ritmo das refeições', 'Observar sabor, textura e porções', 'Fazer pausas enquanto como'], reflection: 'O que mudou quando prestei atenção à refeição?' },
  { day: 6, title: 'Encontre apoio', focus: 'Escolha alguém que ajude a manter responsabilidade e perspectiva.', tasks: ['Escolher meu apoiador ou técnico', 'Combinar como será o acompanhamento', 'Compartilhar uma dificuldade real'], reflection: 'Que tipo de apoio funciona melhor para mim?' },
  { day: 7, title: 'Organize o ambiente', focus: 'Faça o ambiente trabalhar a favor das suas decisões.', tasks: ['Retirar tentações visíveis', 'Deixar opções saudáveis acessíveis', 'Planejar como agir fora de casa'], reflection: 'Qual mudança no ambiente terá maior impacto?' },
  { day: 8, title: 'Arrume tempo e energia', focus: 'Inclua o cuidado com a saúde na agenda real.', tasks: ['Reservar horário para planejar refeições', 'Reservar tempo para atividade física', 'Eliminar ou adiar uma tarefa menos importante'], reflection: 'Onde posso proteger tempo para cuidar de mim?' },
  { day: 9, title: 'Escolha um plano de exercícios', focus: 'Comece com movimento possível e consistente.', tasks: ['Escolher as atividades da semana', 'Definir dias e horários', 'Preparar roupa ou equipamento'], reflection: 'Qual exercício consigo manter mesmo em semanas difíceis?' },
  { day: 10, title: 'Estabeleça metas realistas', focus: 'Troque pressa por progresso sustentável.', tasks: ['Definir uma meta de curto prazo', 'Criar uma medida além do peso', 'Celebrar o progresso já feito'], reflection: 'Minha meta depende de ações que estão sob meu controle?' },
  { day: 11, title: 'Diferencie fome e vontade', focus: 'Aprenda a reconhecer os sinais do corpo e os gatilhos.', tasks: ['Classificar fome antes de comer', 'Registrar um desejo sem fome', 'Esperar alguns minutos antes de decidir'], reflection: 'Como a fome física aparece no meu corpo?' },
  { day: 12, title: 'Pratique tolerar a fome', focus: 'Descubra que a fome leve é desconfortável, mas administrável.', tasks: ['Observar a fome sem reagir imediatamente', 'Dar uma nota de intensidade', 'Registrar quanto tempo ela durou'], reflection: 'O que aprendi ao esperar com segurança?' },
  { day: 13, title: 'Supere desejos intensos', focus: 'Use estratégias curtas até a vontade diminuir.', tasks: ['Identificar o gatilho', 'Aplicar uma técnica de distração', 'Reler um cartão de enfrentamento'], reflection: 'Qual técnica reduziu melhor a vontade de comer?' },
  { day: 14, title: 'Planeje o dia de amanhã', focus: 'Decida com antecedência para depender menos do impulso.', tasks: ['Planejar refeições e lanches', 'Antecipar um obstáculo', 'Preparar o que for possível hoje'], reflection: 'Qual decisão antecipada tornou amanhã mais fácil?' },
  { day: 15, title: 'Monitore sua alimentação', focus: 'Registre com honestidade e sem julgamento.', tasks: ['Anotar tudo o que comi', 'Comparar com o planejado', 'Registrar contexto e horário'], reflection: 'Que padrão apareceu no meu registro?' },
  { day: 16, title: 'Evite comer sem planejamento', focus: 'Crie uma pausa entre vontade e ação.', tasks: ['Consultar o plano antes de comer', 'Registrar qualquer mudança', 'Usar uma resposta para o impulso'], reflection: 'Qual pensamento tentou justificar uma exceção?' },
  { day: 17, title: 'Encerre os excessos', focus: 'Reconheça que cada porção extra também conta.', tasks: ['Servir a porção planejada', 'Guardar as sobras antes de comer', 'Evitar beliscar durante o preparo'], reflection: 'Onde os pequenos excessos aparecem no meu dia?' },
  { day: 18, title: 'Redefina saciedade', focus: 'Busque conforto suficiente, não sensação de estar cheio.', tasks: ['Parar antes de ficar pesado', 'Avaliar saciedade no meio da refeição', 'Aguardar antes de repetir'], reflection: 'Como é estar satisfeito sem estar cheio?' },
  { day: 19, title: 'Pare de se enganar', focus: 'Questione permissões que parecem inofensivas.', tasks: ['Identificar uma justificativa alimentar', 'Responder com uma frase realista', 'Cumprir o que estava planejado'], reflection: 'Que desculpa aparece com mais frequência?' },
  { day: 20, title: 'Volte aos trilhos', focus: 'Uma escolha fora do plano não precisa dominar o dia.', tasks: ['Interromper o desvio na próxima decisão', 'Evitar culpa e compensações extremas', 'Anotar o aprendizado'], reflection: 'Como posso retornar ao plano mais rapidamente?' },
  { day: 21, title: 'Prepare-se para se pesar', focus: 'Use a balança como informação, não como julgamento.', tasks: ['Escolher dia e condições da pesagem', 'Prever pensamentos sabotadores', 'Preparar uma resposta equilibrada'], reflection: 'O que o número mede e o que ele não mede?' },
  { day: 22, title: 'Aceite a decepção', focus: 'Pratique paciência quando o resultado não acompanha o esforço.', tasks: ['Nomear minha decepção', 'Reler minhas vantagens', 'Reconhecer comportamentos que melhoraram'], reflection: 'Como posso continuar mesmo sem recompensa imediata?' },
  { day: 23, title: 'Contrarie a injustiça', focus: 'Aceite as regras da realidade sem abandonar seu objetivo.', tasks: ['Identificar um pensamento de injustiça', 'Responder com aceitação', 'Escolher a ação que favorece minha meta'], reflection: 'O que ganho ao aceitar o que não posso mudar hoje?' },
  { day: 24, title: 'Saiba lidar com o desânimo', focus: 'A motivação oscila; o compromisso pode continuar.', tasks: ['Identificar a origem do desânimo', 'Fazer uma ação pequena mesmo assim', 'Pedir apoio se necessário'], reflection: 'Qual é o menor próximo passo útil?' },
  { day: 25, title: 'Identifique pensamentos sabotadores', focus: 'Dê nome às ideias que afastam você do plano.', tasks: ['Registrar a situação', 'Escrever o pensamento automático', 'Observar a consequência'], reflection: 'Qual pensamento mais influencia minhas escolhas?' },
  { day: 26, title: 'Reconheça erros de pensamento', focus: 'Perceba exageros, tudo-ou-nada e conclusões precipitadas.', tasks: ['Classificar um erro de pensamento', 'Buscar evidências reais', 'Criar uma visão mais equilibrada'], reflection: 'Como eu falaria com alguém querido nessa situação?' },
  { day: 27, title: 'Use as sete perguntas', focus: 'Transforme pensamentos sabotadores em respostas úteis.', tasks: ['Questionar a evidência do pensamento', 'Avaliar outra explicação', 'Escrever uma resposta de enfrentamento'], reflection: 'Qual nova resposta quero lembrar da próxima vez?' },
  { day: 28, title: 'Revise a pesagem', focus: 'Observe tendências e valorize o processo completo.', tasks: ['Registrar a medida sem julgamento', 'Comparar comportamentos, não apenas peso', 'Ajustar uma ação da semana'], reflection: 'Qual comportamento merece continuar?' },
  { day: 29, title: 'Resista à pressão para comer', focus: 'Prepare respostas firmes e gentis para outras pessoas.', tasks: ['Ensaiar uma frase de recusa', 'Evitar explicações longas', 'Manter minha decisão diante de insistência'], reflection: 'Que resposta combina com meu jeito de falar?' },
  { day: 30, title: 'Coma fora com controle', focus: 'Planeje restaurantes, festas e encontros antes de chegar.', tasks: ['Decidir antecipadamente o que comer', 'Escolher porções conscientemente', 'Focar também nas pessoas e na experiência'], reflection: 'O que posso planejar antes do próximo evento?' },
  { day: 31, title: 'Decida sobre bebidas alcoólicas', focus: 'Defina limites antes que o contexto decida por você.', tasks: ['Escolher se e quanto vou beber', 'Considerar efeitos sobre fome e decisões', 'Preparar uma alternativa sem álcool'], reflection: 'Qual limite protege melhor meu objetivo?' },
  { day: 32, title: 'Prepare-se para viajar', focus: 'Leve o plano para ambientes diferentes.', tasks: ['Planejar refeições possíveis', 'Separar opções de emergência', 'Definir como manter movimento e registros'], reflection: 'Qual parte da viagem exige mais preparação?' },
  { day: 33, title: 'Enfrente a alimentação emocional', focus: 'Cuide da emoção diretamente, sem usar comida como única resposta.', tasks: ['Nomear a emoção', 'Testar uma ação alternativa', 'Registrar o que realmente precisava'], reflection: 'De que eu precisava quando quis comer sem fome?' },
  { day: 34, title: 'Resolva problemas', focus: 'Transforme dificuldades vagas em ações específicas.', tasks: ['Definir claramente um problema', 'Listar possíveis soluções', 'Executar o primeiro passo'], reflection: 'Qual solução é boa o suficiente para testar?' },
  { day: 35, title: 'Nova revisão de pesagem', focus: 'Use dados para aprender e continuar.', tasks: ['Registrar a medida', 'Revisar o plano da última semana', 'Escolher um ajuste pequeno'], reflection: 'Que tendência consigo observar sem tirar conclusões apressadas?' },
  { day: 36, title: 'Acredite em você', focus: 'Use as próprias evidências para fortalecer confiança.', tasks: ['Listar três conquistas do programa', 'Reler cartões importantes', 'Lembrar uma dificuldade já superada'], reflection: 'Que prova tenho de que consigo continuar?' },
  { day: 37, title: 'Reduza o estresse', focus: 'Diminua gatilhos e aumente recuperação.', tasks: ['Identificar uma fonte de estresse', 'Praticar uma técnica de relaxamento', 'Proteger um período de descanso'], reflection: 'Qual ação reduz meu estresse sem envolver comida?' },
  { day: 38, title: 'Aprenda a lidar com o platô', focus: 'Mantenha consistência quando o peso estabilizar.', tasks: ['Revisar registros com honestidade', 'Conferir expectativas', 'Escolher ajustes sustentáveis'], reflection: 'Como medir progresso enquanto a balança não muda?' },
  { day: 39, title: 'Mantenha os exercícios', focus: 'Trate movimento como parte permanente da vida.', tasks: ['Revisar meu plano semanal', 'Resolver uma barreira prática', 'Reconhecer benefícios além do peso'], reflection: 'O que torna o exercício mais agradável e repetível?' },
  { day: 40, title: 'Enriqueça sua vida', focus: 'Construa prazer, sentido e conexão além da alimentação.', tasks: ['Escolher uma atividade prazerosa', 'Retomar um interesse', 'Programar um momento de conexão'], reflection: 'O que quero ter mais na vida, além de emagrecer?' },
  { day: 41, title: 'Crie uma nova lista de tarefas', focus: 'Escolha as habilidades que precisam continuar ativas.', tasks: ['Revisar todas as técnicas', 'Selecionar práticas diárias e semanais', 'Criar meu plano de manutenção'], reflection: 'Quais hábitos são indispensáveis para mim?' },
  { day: 42, title: 'Pratique e continue', focus: 'Consolide o aprendizado como um sistema para a vida.', tasks: ['Revisar minha evolução nos 42 dias', 'Escolher cartões para continuar lendo', 'Definir a próxima revisão da jornada'], reflection: 'Quem me tornei durante esse processo?' },
];

type JourneyData = {
  completedDays?: number[];
  completedTasks?: Record<string, number[]>;
  notes?: Record<string, string>;
  startedAt?: string;
};

interface Props {
  records: GenericRecord[];
  addRecord: (record: Omit<GenericRecord, 'id' | 'uid' | 'created_at' | 'updated_at'>) => Promise<unknown>;
  updateRecord: (id: string, record: Partial<GenericRecord>) => Promise<unknown>;
}

export default function PenseMagroJourney({ records, addRecord, updateRecord }: Props) {
  const journeyRecord = records.find(record => record.type === 'pense_magro');
  const remote = (journeyRecord?.data || {}) as JourneyData;
  const completedDays = remote.completedDays || [];
  const firstPending = DAYS.find(day => !completedDays.includes(day.day))?.day || 42;
  const [selectedDay, setSelectedDay] = useState(firstPending);
  const [draftTasks, setDraftTasks] = useState<number[]>([]);
  const [draftNote, setDraftNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const current = DAYS[selectedDay - 1];
  const percent = Math.round((completedDays.length / DAYS.length) * 100);
  const taskKey = String(selectedDay);

  useEffect(() => {
    setDraftTasks(remote.completedTasks?.[taskKey] || []);
    setDraftNote(remote.notes?.[taskKey] || '');
    setSaved(false);
  }, [journeyRecord?.id, selectedDay, taskKey]);

  const completedSet = useMemo(() => new Set(completedDays), [completedDays]);

  const save = async (markDayComplete = false) => {
    if (saving) return;
    setSaving(true);
    const nextCompleted = markDayComplete
      ? Array.from(new Set([...completedDays, selectedDay])).sort((a, b) => a - b)
      : completedDays;
    const data: JourneyData = {
      ...remote,
      startedAt: remote.startedAt || new Date().toISOString(),
      completedDays: nextCompleted,
      completedTasks: { ...(remote.completedTasks || {}), [taskKey]: draftTasks },
      notes: { ...(remote.notes || {}), [taskKey]: draftNote },
    };
    if (journeyRecord) {
      await updateRecord(String(journeyRecord.id), { data });
    } else {
      await addRecord({ area_id: 'saude', type: 'pense_magro', data });
    }
    setSaving(false);
    setSaved(true);
  };

  const toggleTask = (index: number) => {
    setDraftTasks(value => value.includes(index) ? value.filter(item => item !== index) : [...value, index]);
    setSaved(false);
  };

  const changeDay = (day: number) => {
    setSelectedDay(Math.min(42, Math.max(1, day)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800 text-white shadow-xl">
        <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.25em]">
              <Brain size={15} /> Jornada de mentalidade
            </div>
            <h3 className="text-3xl font-black tracking-tight sm:text-4xl">Pense Magro</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-emerald-50/80">42 dias para treinar decisões conscientes, compreender seus gatilhos e construir uma relação mais consistente com a alimentação.</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/15 p-4 text-center backdrop-blur-sm">
            <div className="text-4xl font-black">{completedDays.length}<span className="text-lg text-white/50">/42</span></div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald-100/70">dias concluídos</div>
          </div>
        </div>
        <div className="h-3 bg-black/20"><div className="h-full bg-gradient-to-r from-lime-300 to-emerald-300 transition-all duration-700" style={{ width: `${percent}%` }} /></div>
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-emerald-700">Dia {current.day} de 42</p>
            <h3 className="mt-2 text-2xl font-black tracking-tight text-[#14120d]">{current.title}</h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600">{current.focus}</p>
          </div>
          {completedSet.has(selectedDay) && <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-xs font-black uppercase tracking-wider text-emerald-800"><Check size={15} /> Concluído</span>}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h4 className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-gray-500">Tarefas do dia</h4>
            <div className="space-y-3">
              {current.tasks.map((task, index) => {
                const checked = draftTasks.includes(index);
                return (
                  <button key={task} onClick={() => toggleTask(index)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-all ${checked ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-black/10 bg-[#faf9f6] text-gray-700 hover:border-emerald-300'}`}>
                    {checked ? <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"><Check size={15} /></span> : <Circle size={24} className="shrink-0 text-gray-300" />}
                    <span className={`text-sm font-semibold leading-relaxed ${checked ? 'line-through opacity-65' : ''}`}>{task}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="mb-3 flex items-center gap-2 text-amber-800"><Sparkles size={18} /><h4 className="text-xs font-black uppercase tracking-[0.2em]">Reflexão</h4></div>
            <p className="mb-4 text-sm font-bold leading-relaxed text-amber-950">{current.reflection}</p>
            <textarea value={draftNote} onChange={event => { setDraftNote(event.target.value); setSaved(false); }} rows={7} placeholder="Escreva aqui com sinceridade. Suas respostas ficarão guardadas no seu histórico..." className="w-full resize-none rounded-xl border border-amber-200 bg-white p-4 text-sm leading-relaxed text-gray-800 outline-none transition focus:border-amber-500 focus:ring-4 focus:ring-amber-100" />
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-black/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => changeDay(selectedDay - 1)} disabled={selectedDay === 1} className="flex items-center gap-1 rounded-xl border border-black/10 px-4 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-30"><ChevronLeft size={16} /> Anterior</button>
            <button onClick={() => changeDay(selectedDay + 1)} disabled={selectedDay === 42} className="flex items-center gap-1 rounded-xl border border-black/10 px-4 py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-30">Próximo <ChevronRight size={16} /></button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => save(false)} disabled={saving} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-xs font-black uppercase tracking-wider text-emerald-800 disabled:opacity-50 sm:flex-none"><Save size={16} /> {saved ? 'Salvo' : 'Salvar'}</button>
            <button onClick={() => save(true)} disabled={saving || draftTasks.length < current.tasks.length} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-35 sm:flex-none"><Trophy size={16} /> Concluir dia</button>
          </div>
        </div>
        {draftTasks.length < current.tasks.length && !completedSet.has(selectedDay) && <p className="mt-3 text-right text-[11px] font-semibold text-gray-400">Marque as três tarefas para concluir este dia.</p>}
      </section>

      <section className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center justify-between"><div><h3 className="text-lg font-black">Mapa da jornada</h3><p className="mt-1 text-xs text-gray-500">Escolha qualquer etapa para revisar ou continuar.</p></div><span className="text-sm font-black text-emerald-700">{percent}%</span></div>
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-7 lg:grid-cols-14">
          {DAYS.map(day => {
            const done = completedSet.has(day.day);
            const active = selectedDay === day.day;
            return <button key={day.day} title={`Dia ${day.day}: ${day.title}`} onClick={() => changeDay(day.day)} className={`aspect-square rounded-xl border text-xs font-black transition-all ${active ? 'scale-105 border-emerald-700 bg-emerald-700 text-white shadow-md' : done ? 'border-emerald-200 bg-emerald-100 text-emerald-800' : 'border-black/10 bg-[#faf9f6] text-gray-500 hover:border-emerald-300'}`}>{done && !active ? <Check size={15} className="mx-auto" /> : day.day}</button>;
          })}
        </div>
      </section>
    </div>
  );
}
