import { supabase } from '@/lib/supabase';

export default async function QuestoesPage() {
  // Tenta buscar as questões do banco
  const { data: questoes, error } = await supabase.from('questoes').select('*');

  return (
    <div className="p-10 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-5">Banco de Questões</h1>
      {error && <p className="text-red-500">Erro: {error.message}</p>}
      {!questoes || questoes.length === 0 ? (
        <p>Nenhuma questão encontrada. Vá ao seu painel do Supabase e adicione dados na tabela!</p>
      ) : (
        <ul className="space-y-4">
          {questoes.map((q) => (
            <li key={q.id} className="p-4 border border-[#c6ff3a] rounded-lg">
              <h2 className="font-bold">{q.enunciado}</h2>
              <p className="text-sm text-gray-400">Matéria: {q.materia}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}