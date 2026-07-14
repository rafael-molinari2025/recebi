/**
 * Promove o plano de um usuário para PRO ou CLINICA.
 *
 * Uso:
 *   node scripts/promover-plano.mjs <email> <PRO|CLINICA|STARTER>
 *
 * Exemplos:
 *   node scripts/promover-plano.mjs teste-pro@primetitec.com.br PRO
 *   node scripts/promover-plano.mjs teste-clinica@primetitec.com.br CLINICA
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ─── Carregar .env.local manualmente (Prisma usa .env, Supabase está em .env.local) ───
const __dir = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dir, '..')

function loadEnv(file) {
  try {
    const lines = readFileSync(resolve(root, file), 'utf-8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx === -1) continue
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  } catch { /* arquivo não existe */ }
}

loadEnv('.env')
loadEnv('.env.local')

// ─── Validar argumentos ──────────────────────────────────────────────────────
const [,, email, plano] = process.argv
const planosValidos = ['STARTER', 'PRO', 'CLINICA']

if (!email || !plano) {
  console.error('\n❌  Argumentos faltando.')
  console.error('    Uso: node scripts/promover-plano.mjs <email> <PRO|CLINICA|STARTER>\n')
  process.exit(1)
}

if (!planosValidos.includes(plano.toUpperCase())) {
  console.error(`\n❌  Plano inválido: "${plano}". Use: STARTER, PRO ou CLINICA\n`)
  process.exit(1)
}

const planoFinal = plano.toUpperCase()

// ─── Imports dinâmicos após env carregado ────────────────────────────────────
const { PrismaClient } = await import('@prisma/client')
const { createClient } = await import('@supabase/supabase-js')

const prisma = new PrismaClient()

async function main() {
  console.log(`\n🔍  Procurando usuário: ${email}`)

  // 1. Tentar encontrar pelo email direto no banco (usuário já fez login antes)
  const existente = await prisma.user.findUnique({ where: { email } })

  if (existente) {
    await prisma.user.update({
      where: { email },
      data: { plano: planoFinal },
    })
    console.log(`✅  Plano atualizado: ${email} → ${planoFinal}`)
    console.log(`    (ID: ${existente.id})\n`)
    return
  }

  // 2. Usuário não tem registro no banco ainda — buscar no Supabase Auth
  console.log('    Não encontrado no banco. Buscando no Supabase Auth...')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('\n❌  NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env.local\n')
    process.exit(1)
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Listar todos os usuários e filtrar por email (Supabase não tem busca direta por email)
  let supabaseUser = null
  let page = 1
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    supabaseUser = data.users.find(u => u.email === email)
    if (supabaseUser || data.users.length < 1000) break
    page++
  }

  if (!supabaseUser) {
    console.error(`\n❌  Usuário "${email}" não encontrado no Supabase Auth.`)
    console.error('    Crie-o primeiro em: Supabase Dashboard → Authentication → Users → Add user\n')
    process.exit(1)
  }

  console.log(`    Encontrado no Supabase Auth (id: ${supabaseUser.id})`)
  console.log('    Criando registro no banco...')

  // 3. Criar registro no banco com o supabaseId e o plano desejado
  const novo = await prisma.user.upsert({
    where: { supabaseId: supabaseUser.id },
    update: { plano: planoFinal },
    create: {
      supabaseId: supabaseUser.id,
      email,
      nome: supabaseUser.user_metadata?.nome || email.split('@')[0],
      plano: planoFinal,
    },
  })

  console.log(`✅  Usuário criado no banco e plano definido: ${email} → ${planoFinal}`)
  console.log(`    (ID: ${novo.id})\n`)
}

main()
  .catch(e => {
    console.error('\n❌  Erro:', e.message ?? e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
