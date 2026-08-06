import { Prisma } from "@prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import {
  CreateClientInput,
  ListClientsQuery,
  UpdateClientInput,
} from "./clients.schema";

export async function listClients(query: ListClientsQuery, userId: string) {
  const { page, pageSize, search, sortBy, sortDir, status } = query;

  const where: Prisma.ClientWhereInput = {
    createdById: userId,
    ...(search ? { name: { contains: search } } : {}),
    ...(status ? { status } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.client.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.client.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

export async function getClientMetrics(userId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [total, active, createdThisMonth, createdLastMonth] = await Promise.all(
    [
      prisma.client.count({ where: { createdById: userId } }),
      prisma.client.count({ where: { createdById: userId, status: "ACTIVE" } }),
      prisma.client.count({
        where: { createdById: userId, createdAt: { gte: startOfMonth } },
      }),
      prisma.client.count({
        where: {
          createdById: userId,
          createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        },
      }),
    ],
  );

  const growthPct =
    createdLastMonth === 0
      ? createdThisMonth > 0
        ? 100
        : 0
      : Math.round(
          ((createdThisMonth - createdLastMonth) / createdLastMonth) * 100,
        );

  return { total, active, createdThisMonth, growthPct };
}

export async function getClientById(id: string, userId: string) {
  const client = await prisma.client.findUnique({ where: { id } });
  // Same 404 whether the record doesn't exist or belongs to someone else —
  // never leak that a given id exists in another account.
  if (!client || client.createdById !== userId) {
    throw ApiError.notFound("Record not found");
  }
  return client;
}

export async function createClient(input: CreateClientInput, userId: string) {
  return prisma.client.create({
    data: { ...input, createdById: userId },
  });
}

export async function updateClient(
  id: string,
  input: UpdateClientInput,
  userId: string,
) {
  await getClientById(id, userId);
  return prisma.client.update({ where: { id }, data: input });
}

export async function deleteClient(id: string, userId: string) {
  await getClientById(id, userId);
  await prisma.client.delete({ where: { id } });
}
