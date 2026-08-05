import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

type ClientStatus = "LEAD" | "ACTIVE" | "PAUSED" | "CHURNED";

const TOTAL_CLIENTS = 40;

// Quotas exatas, não amostragem probabilística — garante a proporção pedida
// (40% ACTIVE, 25% LEAD, 20% PAUSED, 15% CHURNED) independente de acaso.
const STATUS_QUOTAS: Record<ClientStatus, number> = {
  ACTIVE: 16,
  LEAD: 10,
  PAUSED: 8,
  CHURNED: 6,
};

// Tamanho de cada balde mensal, do mais antigo (5 meses atrás) para o mais
// recente (mês atual). Soma = TOTAL_CLIENTS. Deliberadamente crescente para
// que o card de "crescimento no mês" no dashboard mostre um número real e
// positivo em vez de ruído aleatório — é dado de demonstração, não dado real.
const MONTHLY_BUCKETS = [4, 5, 6, 7, 8, 10];

const COMPANY_SUFFIXES = [
  "Tecnologia",
  "Consultoria",
  "Comércio",
  "Serviços",
  "Digital",
  "Logística",
  "Engenharia",
  "Educação",
];

function randomValueForStatus(status: ClientStatus): number {
  // A maioria dos clientes tem valor modesto, poucos são contas grandes —
  // evita o padrão sequencial óbvio (100, 200, 300...) e fica plausível.
  const tier = faker.helpers.weightedArrayElement([
    { value: "small", weight: 65 },
    { value: "mid", weight: 30 },
    { value: "large", weight: 5 },
  ]);
  const ranges: Record<string, [number, number]> = {
    small: [600, 6000],
    mid: [6000, 22000],
    large: [22000, 58000],
  };
  const [min, max] = ranges[tier];
  const amount = Number(faker.finance.amount({ min, max, dec: 2 }));
  // Contas pausadas/perdidas tendem a ter valor menor — não cresceram.
  return status === "CHURNED" || status === "PAUSED"
    ? Math.round(amount * 0.7 * 100) / 100
    : amount;
}

function randomName(): string {
  const isCompany = faker.datatype.boolean({ probability: 0.75 });
  if (isCompany) {
    return `${faker.company.name()} ${faker.helpers.arrayElement(COMPANY_SUFFIXES)}`;
  }
  return faker.person.fullName();
}

function dateWithinMonthOffset(monthsAgo: number): Date {
  const now = new Date();
  const bucketStart = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const bucketEnd =
    monthsAgo === 0
      ? now // não gera data futura para o mês corrente, ainda em andamento
      : new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0, 23, 59, 59);
  return faker.date.between({ from: bucketStart, to: bucketEnd });
}

async function main() {
  console.log("Limpando dados existentes...");
  await prisma.refreshToken.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log("Criando usuário demo...");
  const passwordHash = await bcrypt.hash("Demo@1234", 10);
  const demoUser = await prisma.user.create({
    data: { name: "Ana Ribeiro", email: "demo@saasadmin.dev", passwordHash },
  });

  console.log("Gerando registros de clientes...");

  const statusPool: ClientStatus[] = Object.entries(STATUS_QUOTAS).flatMap(([status, count]) =>
    Array(count).fill(status as ClientStatus)
  );
  const shuffledStatuses = faker.helpers.shuffle(statusPool);

  const datePool = MONTHLY_BUCKETS.flatMap((count, idx) => {
    const monthsAgo = MONTHLY_BUCKETS.length - 1 - idx;
    return Array.from({ length: count }, () => dateWithinMonthOffset(monthsAgo));
  });
  const shuffledDates = faker.helpers.shuffle(datePool);

  const usedNames = new Set<string>();
  const clientsData = Array.from({ length: TOTAL_CLIENTS }).map((_, i) => {
    let name = randomName();
    while (usedNames.has(name)) name = randomName();
    usedNames.add(name);

    const status = shuffledStatuses[i];
    return {
      name,
      status,
      value: randomValueForStatus(status),
      createdAt: shuffledDates[i],
      createdById: demoUser.id,
    };
  });

  for (const data of clientsData) {
    await prisma.client.create({ data });
  }

  const counts = clientsData.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Seed concluído: 1 usuário e ${clientsData.length} clientes criados.`);
  console.log(`Distribuição de status: ${JSON.stringify(counts)}`);
  console.log("Login demo -> email: demo@saasadmin.dev | senha: Demo@1234");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });