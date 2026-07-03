import { prisma } from '@database/prismaClient';
import { User } from '@prisma/client';

export class AuthRepository {
  async createUser(data: {
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.passwordHash,
        name: data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : undefined,
      },
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: string;
    expiresAt: Date;
  }) {
    return prisma.refreshToken.create({
      data,
    });
  }

  async findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteRefreshToken(token: string) {
    return prisma.refreshToken.delete({
      where: { token },
    });
  }

  async updateUser(id: string, data: Partial<User>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }
}

export const authRepository = new AuthRepository();