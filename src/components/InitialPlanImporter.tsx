import { useMemo, useState } from 'react';
import { CheckCircle2, Database, Loader2, Sparkles } from 'lucide-react';
import { useRecords } from '../hooks/useRecords';
import { INITIAL_PLAN_RECORDS, INITIAL_SUPREME_GOAL } from '../config/initialPlanSeed';
import { useAuth } from './AuthContext';
import { db, doc, setDoc } from '../firebase';

export default function InitialPlanImporter() {
  const { user } = useAuth();
  const { records, loading, addRecord } = useRecords();
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const existing = useMemo(() => new Set(records.map(record => record.data?.seedKey).filter(Boolean)), [records]);
  const missing = INITIAL_PLAN_RECORDS.filter(record => !existing.has(record.data.seedKey));

  const run = async () => {
    if (!user || importing) return;
    setImporting(true);
    setResult(null);
    let created = 0;
    for (const record of missing) {
      await addRecord(record);
      created++;
    }
    await setDoc(doc(db, 'users', user.uid), {
      supreme_goal: INITIAL_SUPREME_GOAL,
      life_plan_seeded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { merge: true });
    setResult(`${created} registros organizados com sucesso.`);
    setImporting(false);
  };

  return (
    <section className="col-span-full overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 flex items-center gap-2 text-emerald-700"><Sparkles size={20} /><h3 className="font-mono text-xs font-black uppercase tracking-[0.2em]">Plano de vida confirmado</h3></div>
          <p className="text-lg font-black text-[#14120d]">Metas, marcos, cursos e práticas espirituais</p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">Importa somente informações já confirmadas nas nossas conversas. A operação pode ser repetida sem criar duplicidades.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-gray-600"><span className="rounded-full bg-white px-3 py-1.5 border border-black/5">{INITIAL_PLAN_RECORDS.length} itens mapeados</span><span className="rounded-full bg-white px-3 py-1.5 border border-black/5">{existing.size} já cadastrados</span><span className="rounded-full bg-white px-3 py-1.5 border border-black/5">{missing.length} pendentes</span></div>
        </div>
        <button onClick={run} disabled={loading || importing || missing.length === 0} className="flex min-w-[220px] items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-6 py-4 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-emerald-900/15 disabled:bg-emerald-200 disabled:shadow-none">
          {importing ? <Loader2 size={18} className="animate-spin" /> : missing.length === 0 ? <CheckCircle2 size={18} /> : <Database size={18} />}
          {importing ? 'Organizando...' : missing.length === 0 ? 'Tudo cadastrado' : 'Cadastrar tudo'}
        </button>
      </div>
      {result && <p className="mt-5 rounded-xl border border-emerald-200 bg-emerald-100 px-4 py-3 text-sm font-bold text-emerald-900">{result}</p>}
    </section>
  );
}
