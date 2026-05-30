import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getAuthUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (dbUser) return dbUser

  // Cria o registro na primeira vez que o usuário acessa qualquer API
  return prisma.user.create({
    data: {
      supabaseId: user.id,
      email: user.email!,
      nome: user.user_metadata?.nome ?? user.user_metadata?.full_name ?? user.email!.split('@')[0],
    },
  })
}
