const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst() // Get the first user
  if (!user) {
    console.log("No user found")
    return
  }
  console.log("User:", user.nome)

  const clientes = await prisma.cliente.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { atendimentos: true, cobrancas: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  console.log("Found", clientes.length, "clientes")

  try {
    const clientesSerializados = clientes.map((c) => ({
      id: c.id,
      userId: c.userId,
      nome: c.nome,
      cpfCnpj: c.cpfCnpj ?? undefined,
      telefone: c.telefone,
      email: c.email ?? undefined,
      tipoAtendimento: c.tipoAtendimento,
      valorHonorario: isNaN(Number(c.valorHonorario)) ? 0 : Number(c.valorHonorario),
      diaVencimento: c.diaVencimento,
      ativo: c.ativo,
      observacoes: c.observacoes ?? undefined,
      createdAt: c.createdAt ? new Date(c.createdAt).toISOString() : new Date().toISOString(),
      _count: c._count,
    }))
    console.log("Serialization successful")
    console.log(clientesSerializados[0])
  } catch (err) {
    console.error("Serialization error:", err)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
