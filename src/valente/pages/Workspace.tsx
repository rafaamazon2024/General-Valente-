import { useState, type FormEvent } from 'react';
import { BookOpen, Download, FileText, Plus, Sparkles } from 'lucide-react';
import { useAuth } from '../../components/AuthContext';
import { AREAS, AREA_POR_ID, type AreaId } from '../areas';
import { useValente } from '../store';
import { useWorkspace, titleOf, dueToday, validateFile, type Entry } from '../workspace';
import { Botao, Titulo, Vazio } from '../ui/kit';
import type { Ir } from '../nav';

const kinds: Record<string, string> = { gv_task: 'Tarefa', gv_plan: 'Plano / rotina', gv_note: 'Anotação', gv_diary: 'Diário', gv_study: 'Estudo / curso', gv_memory: 'Cartão de memória', gv_file: 'Arquivo', gv_link: 'Link' };
const legacyAreas: Record<AreaId, string[]> = {
  esporte: ['saude'], alimentacao: ['saude'], mindfulness: ['saude_mental', 'desenvolvimento'],
  carreira: ['carreira', 'desenvolvimento', 'financeiro'], espiritual: ['espiritualidade'],
  leitura: ['desenvolvimento'], comunicacao: ['desenvolvimento', 'relacionamento'], memorizacao: ['desenvolvimento'],
};
function matches(entry: Entry, area?: AreaId) {
  return !area || entry.area_id === area || (!entry.type.startsWith('gv_') && legacyAreas[area].includes(entry.area_id));
}
function ErrorText({ text }: { text: string }) { return text ? <p role="alert" className="text-bad text-sm py-2">{text}</p> : null; }

export function EntryEditor({ area, kind = 'gv_note', entry, onClose }: { area?: AreaId; kind?: string; entry?: Entry; onClose: () => void }) {
  const { save } = useWorkspace();
  const { hoje } = useValente();
  const [type, setType] = useState(entry?.type || kind);
  const [module, setModule] = useState(entry?.area_id || area || 'geral');
  const [title, setTitle] = useState(entry ? titleOf(entry) : '');
  const [body, setBody] = useState(entry?.data.texto || '');
  const [date, setDate] = useState(entry?.data.date || hoje);
  const [repeat, setRepeat] = useState(entry?.data.repeat || 'once');
  const [days, setDays] = useState<number[]>(entry?.data.days || []);
  const [confirmed, setConfirmed] = useState(entry?.data.confirmed || false);
  const [total, setTotal] = useState(String(entry?.data.total || ''));
  const [current, setCurrent] = useState(String(entry?.data.current || ''));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); if (!title.trim() || busy) return;
    setBusy(true); setError('');
    try {
      if (type === 'gv_plan' && repeat === 'weekly' && !days.length) throw new Error('Escolha pelo menos um dia da semana.');
      await save({ area_id: module, type, data: { ...entry?.data, titulo: title.trim(), texto: body.trim(), date, repeat, days, total: Number(total) || 0, current: Number(current) || 0, confirmed: type === 'gv_plan' ? confirmed : false, status: entry?.data.status || 'Pendente', source: 'Cadastro explícito pelo usuário' } }, entry?.id);
      onClose();
    } catch { setError('Não foi possível salvar. Seu texto continua aqui; tente novamente.'); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="painel-destaque p-4 space-y-3">
    <Titulo>{entry ? 'Editar registro' : 'Novo registro'}</Titulo>
    <div className="grid sm:grid-cols-2 gap-3">
      <label>Tipo<select value={type} onChange={e => setType(e.target.value)}>{Object.entries(kinds).filter(([k]) => !['gv_file', 'gv_link'].includes(k)).map(([k, label]) => <option key={k} value={k}>{label}</option>)}</select></label>
      <label>Área<select value={module} onChange={e => setModule(e.target.value)}><option value="geral">Geral</option>{AREAS.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></label>
    </div>
    <label className="block">Título<input autoFocus required maxLength={180} value={title} onChange={e => setTitle(e.target.value)} /></label>
    <label className="block">{type === 'gv_memory' ? 'Resposta e explicação' : 'Conteúdo, instruções ou detalhes'}<textarea required={type === 'gv_plan'} rows={5} maxLength={20000} value={body} onChange={e => setBody(e.target.value)} placeholder={type === 'gv_plan' ? 'Cole aqui seu plano confirmado. Dieta: refeições e quantidades. Treino: exercícios, séries, repetições e carga.' : 'Registre o que você quer guardar e colocar em prática.'} /></label>
    <div className="grid sm:grid-cols-2 gap-3"><label>Data<input required type="date" value={date} onChange={e => setDate(e.target.value)} /></label>
      {type === 'gv_plan' && <label>Repetição<select value={repeat} onChange={e => setRepeat(e.target.value)}><option value="once">Somente nesta data</option><option value="daily">Todos os dias</option><option value="weekdays">Segunda a sexta</option><option value="weekly">Escolher dias da semana</option></select></label>}
    </div>
    {type === 'gv_plan' && repeat === 'weekly' && <fieldset><legend className="text-sm mb-2">Dias da semana</legend><div className="flex flex-wrap gap-3">{['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => <label key={day} className="flex gap-1 items-center"><input type="checkbox" checked={days.includes(index)} onChange={e => setDays(e.target.checked ? [...days, index] : days.filter(d => d !== index))} />{day}</label>)}</div></fieldset>}
    {type === 'gv_study' && <div className="grid grid-cols-2 gap-3"><label>Aulas / etapas concluídas<input type="number" min="0" step="1" value={current} onChange={e => setCurrent(e.target.value)} /></label><label>Total de aulas / etapas<input type="number" min="0" step="1" value={total} onChange={e => setTotal(e.target.value)} /></label></div>}
    {type === 'gv_plan' && <label className="flex gap-2 items-start text-sm"><input type="checkbox" required checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Confirmo que este é o plano que quero seguir. Ele aparecerá no Hoje a partir da data escolhida.</label>}
    <ErrorText text={error} />
    <div className="flex gap-2"><button disabled={busy} className="gv-primary">{busy ? 'Salvando…' : 'Salvar registro'}</button><Botao disabled={busy} onClick={onClose}>Cancelar</Botao></div>
  </form>;
}

export function TodayEntries() {
  const { entries, error, loading } = useWorkspace();
  const { hoje } = useValente();
  const [adding, setAdding] = useState(false);
  const list = entries.filter(e => dueToday(e, hoje));
  const { logs } = useValente();
  const completed = list.filter(e => e.data.status === 'Concluído' || logs[hoje]?.feitos.includes(`record:${e.id}`)).length;
  return <section className="painel p-4 space-y-3"><Titulo extra={<Botao onClick={() => setAdding(!adding)}>+ Tarefa</Botao>}>Seu plano de hoje</Titulo>
    <p className="text-sm text-mute">Tarefas e planos que você cadastrou. Abra um item para ver as instruções e dar check.</p>
    {list.length > 0 && <p className="text-sm text-cyan num">{completed} de {list.length} concluídos · {list.length - completed} pendentes</p>}
    <ErrorText text={error} />
    {adding && <EntryEditor kind="gv_task" onClose={() => setAdding(false)} />}
    {loading ? <Vazio>Carregando registros…</Vazio> : !list.length && <Vazio>Seu próximo passo começa aqui. Cadastre uma tarefa ou um plano em uma área.</Vazio>}
    {list.map(entry => <EntryCard key={entry.id} entry={entry} check />)}
  </section>;
}

function download(entry: Entry) {
  const raw = atob(String(entry.data.base64 || ''));
  const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
  const link = document.createElement('a'); link.href = url; link.download = String(entry.data.filename || titleOf(entry)); link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function EntryCard({ entry, check = false }: { entry: Entry; check?: boolean }) {
  const { save } = useWorkspace();
  const { estadoMissao, mudarMissao, hoje } = useValente();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [editing, setEditing] = useState(false);
  const isTask = entry.type === 'gv_task' || entry.type === 'tarefa';
  const done = isTask ? entry.data.status === 'Concluído' : estadoMissao(`record:${entry.id}`) === 'feita';
  async function toggle() {
    setBusy(true); setError('');
    try {
      if (isTask) await save({ area_id: entry.area_id, type: entry.type, data: { ...entry.data, status: done ? 'Pendente' : 'Concluído', completedDate: done ? '' : hoje } }, entry.id);
      else await mudarMissao(`record:${entry.id}`, done ? 'reabrir' : 'concluir');
    }
    catch { setError('Não foi possível registrar o check. Tente novamente.'); }
    finally { setBusy(false); }
  }
  async function archive() {
    setBusy(true); setError('');
    try { await save({ area_id: entry.area_id, type: entry.type, data: { ...entry.data, archived: !entry.data.archived } }, entry.id); }
    catch { setError('Não foi possível atualizar o registro.'); }
    finally { setBusy(false); }
  }
  const detail = entry.data.texto || entry.data.notas || entry.data.descricao || entry.data.objetivo || entry.data.conteudo;
  return <article className="rounded-lg border border-line p-3 space-y-2">
    <div className="flex gap-3 items-start">
      {check && <button role="checkbox" aria-checked={done} aria-label={`${done ? 'Reabrir' : 'Concluir'} ${titleOf(entry)}`} disabled={busy} onClick={toggle} className={`gv-check ${done ? 'text-ok border-ok' : ''}`}>{done ? '✓' : ''}</button>}
      <div className="min-w-0 flex-1"><h3 className={`font-medium break-words ${check && done ? 'line-through text-mute' : ''}`}>{titleOf(entry)}</h3><p className="text-xs text-mute mt-1">{kinds[entry.type] || `Registro existente · ${entry.type}`} · {entry.data.date || entry.data.prazo || entry.created_at?.slice(0, 10) || 'Sem data'}{entry.data.confirmed && ' · Confirmado por você'}</p></div>
    </div>
    {entry.type === 'gv_study' && entry.data.total > 0 && <div className="text-sm text-cyan num">{entry.data.current || 0} de {entry.data.total} aulas / etapas concluídas<progress className="block w-full mt-2 accent-cyan" value={entry.data.current || 0} max={entry.data.total} aria-label={`Progresso de ${titleOf(entry)}`} /></div>}
    <details><summary className="cursor-pointer text-sm text-cyan">{entry.type === 'gv_memory' ? 'Revisar cartão' : 'Ver conteúdo e opções'}</summary>
      <div className="pt-3 space-y-3">
        {entry.type === 'gv_memory' ? <><Botao onClick={() => setRevealed(!revealed)}>{revealed ? 'Ocultar resposta' : 'Mostrar resposta'}</Botao>{revealed && <p className="whitespace-pre-wrap">{detail}</p>}</> : <p className="whitespace-pre-wrap text-sm break-words">{detail || 'Nenhum texto adicional.'}</p>}
        {entry.type === 'gv_file' && <Botao onClick={() => download(entry)}><Download size={14} className="inline mr-2" />Baixar {entry.data.filename}</Botao>}
        {entry.type === 'gv_link' && /^https?:\/\//i.test(entry.data.url || '') && <a className="text-cyan underline break-all" target="_blank" rel="noopener noreferrer" href={entry.data.url}>Abrir material</a>}
        {!entry.type.startsWith('gv_') && <details><summary className="text-sm cursor-pointer">Todos os campos originais</summary><pre className="text-xs whitespace-pre-wrap break-all mt-2">{JSON.stringify(entry.data, null, 2)}</pre></details>}
        <div className="flex flex-wrap gap-2">{entry.type.startsWith('gv_') && !['gv_file', 'gv_link'].includes(entry.type) && <Botao onClick={() => setEditing(!editing)}>Editar</Botao>}<Botao disabled={busy} onClick={archive}>{entry.data.archived ? 'Restaurar registro' : 'Arquivar registro'}</Botao></div>
        {editing && <EntryEditor entry={entry} onClose={() => setEditing(false)} />}
      </div>
    </details><ErrorText text={error} />
  </article>;
}

export function AreaRecords({ area }: { area: AreaId }) {
  const { entries, loading, error } = useWorkspace();
  const [adding, setAdding] = useState(false);
  const list = entries.filter(e => matches(e, area) && !e.data.archived);
  return <section className="painel p-4 space-y-3"><Titulo extra={<Botao onClick={() => setAdding(!adding)}>+ Registrar</Botao>}>Planos, materiais e anotações</Titulo>
    <p className="text-sm text-mute">Guarde seu plano, instruções, estudos e registros desta área. Planos confirmados aparecem no Hoje.</p>
    <ErrorText text={error} />
    {adding && <EntryEditor area={area} kind="gv_plan" onClose={() => setAdding(false)} />}
    {loading ? <Vazio>Carregando…</Vazio> : !list.length && <Vazio>Nenhum plano confirmado disponível nesta área. Adicione seu material para começar.</Vazio>}
    {list.map(e => <EntryCard entry={e} key={e.id} />)}
  </section>;
}

export function LibraryPage() {
  const { entries, loading, error } = useWorkspace();
  const [query, setQuery] = useState('');
  const [module, setModule] = useState('');
  const [kind, setKind] = useState('');
  const [archived, setArchived] = useState(false);
  const [adding, setAdding] = useState(false);
  const list = entries.filter(e => Boolean(e.data.archived) === archived && (!module || matches(e, module as AreaId)) && (!kind || e.type === kind) && `${titleOf(e)} ${e.data.texto || e.data.notas || ''}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="gv-page space-y-5"><header className="gv-page-header"><div><p className="text-cyan text-sm">Tudo em um lugar</p><h1>Diário e arquivos</h1><p>Escreva, organize materiais e encontre seus registros anteriores.</p></div><Botao variante="primario" onClick={() => setAdding(!adding)}><Plus size={14} className="inline mr-2" />Novo registro</Botao></header>
    {adding && <EntryEditor kind="gv_diary" onClose={() => setAdding(false)} />}
    <UploadPanel />
    <section className="painel p-4 space-y-4"><Titulo>Biblioteca pessoal · {list.length} registros</Titulo>
      <div className="grid sm:grid-cols-3 gap-3"><label>Buscar<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Título ou texto" /></label><label>Área<select value={module} onChange={e => setModule(e.target.value)}><option value="">Todas as áreas</option>{AREAS.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></label><label>Tipo<select value={kind} onChange={e => setKind(e.target.value)}><option value="">Todos, incluindo registros anteriores</option>{Object.entries(kinds).map(([k, label]) => <option key={k} value={k}>{label}</option>)}</select></label></div>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={archived} onChange={e => setArchived(e.target.checked)} />Mostrar arquivados</label>
      <ErrorText text={error} />{loading ? <Vazio>Carregando…</Vazio> : !list.length && <Vazio>Nenhum registro encontrado.</Vazio>}
      {list.sort((a, b) => (b.updated_at || '').localeCompare(a.updated_at || '')).map(e => <EntryCard key={e.id} entry={e} />)}
    </section><ExportPanel />
  </div>;
}

function UploadPanel() {
  const { save } = useWorkspace();
  const [area, setArea] = useState('geral');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  async function upload(e: FormEvent) {
    e.preventDefault(); if (!file || busy) return;
    setBusy(true); setError(''); setMessage('');
    try {
      validateFile(file);
      const base64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('Falha ao ler o arquivo.')); reader.onload = () => resolve(String(reader.result).split(',')[1]); reader.readAsDataURL(file); });
      await save({ area_id: area, type: 'gv_file', data: { titulo: file.name, filename: file.name, mime: file.type, size: file.size, base64 } });
      setMessage('Arquivo salvo na sua conta. Ele está disponível na biblioteca abaixo.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha no upload. Tente novamente.'); }
    finally { setBusy(false); }
  }
  async function saveLink(e: FormEvent) {
    e.preventDefault(); setError('');
    try {
      const parsed = new URL(url); if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Use um link HTTP ou HTTPS.');
      setBusy(true); await save({ area_id: area, type: 'gv_link', data: { titulo: parsed.hostname, url: parsed.href } }); setUrl(''); setMessage('Link salvo na biblioteca.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível salvar o link.'); }
    finally { setBusy(false); }
  }
  return <section className="painel p-4 space-y-3"><Titulo><FileText size={16} className="inline mr-2" />Adicionar material</Titulo><p className="text-sm text-mute">Arquivos de até 500 KB ficam salvos na sua conta. Para vídeos, áudios e documentos maiores, salve um link privado do seu Drive ou serviço de preferência.</p>
    <label className="block">Área do material<select value={area} onChange={e => setArea(e.target.value)}><option value="geral">Geral</option>{AREAS.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}</select></label>
    <form onSubmit={upload} className="flex flex-wrap gap-3 items-end"><label className="flex-1 min-w-0">Selecionar arquivo<input type="file" required onChange={e => { setFile(e.target.files?.[0] || null); setMessage(''); }} /></label><button className="gv-primary" disabled={busy || !file}>{busy ? 'Salvando…' : 'Enviar arquivo'}</button></form>
    <form onSubmit={saveLink} className="flex gap-3 items-end"><label className="flex-1 min-w-0">Ou salvar um link<input type="url" required value={url} onChange={e => setUrl(e.target.value)} placeholder="https://" /></label><button className="gv-primary" disabled={busy}>Salvar link</button></form>
    <ErrorText text={error} /><p role="status" className="text-sm text-ok">{message}</p>
  </section>;
}

function ExportPanel() {
  const { entries, loading, error } = useWorkspace();
  const { logs, config, metricas } = useValente();
  function exportData() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records: entries, logs, config, metricas }, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'general-valente-registros.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <section className="painel p-4"><Titulo>Seus dados</Titulo><p className="text-sm text-mute mb-3">Exporte os registros desta biblioteca, as metas, os indicadores e os checks da rotina. Exercícios e logs de treino antigos têm armazenamento separado e não estão incluídos neste arquivo.</p><Botao disabled={loading || Boolean(error)} onClick={exportData}>Exportar registros em JSON</Botao></section>;
}

export function AssistantPage({ ir }: { ir: Ir }) {
  const { user } = useAuth();
  const { entries, error: recordsError } = useWorkspace();
  const { hoje, logs, config } = useValente();
  const [prompt, setPrompt] = useState('');
  const [share, setShare] = useState(false);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const today = entries.filter(e => dueToday(e, hoje));
  const done = logs[hoje]?.feitos || [];
  async function ask(e: FormEvent) {
    e.preventDefault(); if (!user || busy) return;
    setBusy(true); setError('');
    try {
      const token = await user.getIdToken();
      const context = share ? { hoje, planos: today.map(x => ({ titulo: titleOf(x), feito: x.data.status === 'Concluído' || done.includes(`record:${x.id}`) })), metas: config.metas, checksRotina: done.length, materiais: entries.filter(x => selected.includes(x.id)).map(x => ({ titulo: titleOf(x), texto: String(x.data.texto || x.data.notas || '').slice(0, 6000) })) } : undefined;
      const res = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ prompt, context }), signal: AbortSignal.timeout(45000) });
      const result = await res.json(); if (!res.ok) throw new Error(result.error || 'Assistente indisponível.');
      setAnswer(result.answer);
    } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível consultar a IA agora.'); }
    finally { setBusy(false); }
  }
  return <div className="gv-page space-y-5"><header className="gv-page-header"><div><p className="text-cyan text-sm">Acompanhamento com contexto</p><h1>Assistente General</h1><p>Entenda seu dia e escolha o próximo passo.</p></div><Sparkles className="text-cyan" /></header>
    <section className="painel p-5 space-y-3"><Titulo>Seu acompanhamento agora</Titulo><ErrorText text={recordsError} /><p>{today.length} tarefas e planos cadastrados para hoje · {today.filter(x => x.data.status === 'Concluído' || done.includes(`record:${x.id}`)).length} concluídos.</p><p className="text-sm text-mute">Este resumo é calculado com seus registros. A análise por IA funciona quando o serviço está configurado; ela acompanha os dados enviados durante a consulta, sem monitoramento em segundo plano.</p><Botao onClick={() => ir({ t: 'inicio' })}>Voltar ao Hoje</Botao></section>
    <form onSubmit={ask} className="painel p-5 space-y-4"><Titulo>Conversar com a IA</Titulo>
      <label className="block">Sua pergunta<textarea required maxLength={3000} rows={4} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Como posso organizar minhas prioridades de hoje?" /></label>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={share} onChange={e => setShare(e.target.checked)} />Compartilhar com a IA do Google os títulos dos planos de hoje, seus checks, metas e os textos que eu selecionar abaixo. Arquivos e diário não são enviados automaticamente.</label>
      {share && <fieldset className="space-y-2"><legend className="text-sm mb-2">Textos adicionais (opcional, até 5)</legend>{entries.filter(x => !x.data.archived && ['gv_note', 'gv_study', 'gv_plan', 'gv_diary'].includes(x.type)).map(x => <label key={x.id} className="flex gap-2 text-sm"><input type="checkbox" checked={selected.includes(x.id)} disabled={!selected.includes(x.id) && selected.length >= 5} onChange={e => setSelected(e.target.checked ? [...selected, x.id] : selected.filter(id => id !== x.id))} />{titleOf(x)}</label>)}</fieldset>}
      <ErrorText text={error} /><button className="gv-primary" disabled={busy}>{busy ? 'Analisando…' : 'Consultar assistente'}</button>
    </form>
    {answer && <section className="painel-destaque p-5" aria-live="polite"><Titulo>Resposta do General</Titulo><p className="whitespace-pre-wrap leading-relaxed">{answer}</p></section>}
    <section className="painel p-5 text-sm space-y-2"><Titulo>Integrações</Titulo><p>Firebase: autenticação e dados da sua conta.</p><p>Google Gemini: consulta pelo servidor, sujeita à configuração e disponibilidade.</p><p>Drive, agenda e dispositivos de saúde: links de materiais disponíveis; sincronização automática ainda não configurada.</p></section>
  </div>;
}
