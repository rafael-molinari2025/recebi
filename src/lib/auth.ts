import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

// Cached per-request: layout + page share one Supabase auth call.
export const getSupabaseUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
})

// Cached per-request: multiple server components share one DB lookup.
export const getPrismaUser = cache(async (supabaseId: string) => {
  return prisma.user.findUnique({ where: { supabaseId } })
})

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Usa upsert atômico para evitar Race Conditions no primeiro acesso
  return prisma.user.upsert({
    where: { supabaseId: user.id },
    update: {}, // Não atualiza nada se já existir
    create: {
      supabaseId: user.id,
      email: user.email!,
      nome: user.user_metadata?.nome ?? user.user_metadata?.full_name ?? user.email!.split('@')[0],
    },
  })
}
