"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminDataTable } from "@/components/admin-data-table"

const META_SQL = `create table public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  nota_corte numeric not null default 70,
  materia text,
  created_at timestamptz not null default now()
);`

const SIMULADO_SQL = `create table public.simulados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id),
  titulo text not null,
  total_questoes int not null default 0,
  created_at timestamptz not null default now()
);`

export function AdminDadosContent() {
  return (
    <Tabs defaultValue="question" className="gap-6">
      <TabsList>
        <TabsTrigger value="attempt">Attempt</TabsTrigger>
        <TabsTrigger value="meta">Meta</TabsTrigger>
        <TabsTrigger value="question">Question</TabsTrigger>
        <TabsTrigger value="simulado">Simulado</TabsTrigger>
        <TabsTrigger value="feedback">Feedback</TabsTrigger>
      </TabsList>

      <TabsContent value="attempt">
        <AdminDataTable table="simulado_attempts" title="Attempt" />
      </TabsContent>

      <TabsContent value="feedback">
        <AdminDataTable table="question_feedback" title="Feedback de Questões" />
      </TabsContent>

      <TabsContent value="meta">
        <AdminDataTable table="metas" title="Meta" createSql={META_SQL} />
      </TabsContent>

      <TabsContent value="question">
        <AdminDataTable table="questoes" title="Question" />
      </TabsContent>

      <TabsContent value="simulado">
        <AdminDataTable table="simulados" title="Simulado" createSql={SIMULADO_SQL} />
      </TabsContent>
    </Tabs>
  )
}
