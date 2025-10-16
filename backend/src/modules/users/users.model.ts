import prisma from '../../../prisma/client';

export const createUser = async (data: { name: string; email: string; password: string }) => {
  return await prisma.user.create({
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
};

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findUnique({ where: { email } });
};

export const findUserById = async (id: number ) => {
  return await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
};

export const updateUser = async (id: number , data: { name?: string }) => {
  return await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
};