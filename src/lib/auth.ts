import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

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
