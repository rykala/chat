import { offsetPaginationSchema } from "../common/validations";
import { DatabaseClient } from "../types";

export const generateUserModel = ({ db }: { db: DatabaseClient }) => ({
  async getById(id: string) {
    return await db.user.findUnique({ where: { id }, select: { id: true, email: true, avatarUrl: true } });
  },

  async getAllContacts({
    userId,
    limit,
    offset,
    search,
  }: {
    userId: string;
    limit: number;
    offset: number;
    search?: string;
  }) {
    offsetPaginationSchema.parse({ offset, limit, search });

    const [users, totalCount] = await db.$transaction([
      db.user.findMany({
        select: { id: true, email: true, avatarUrl: true },
        where: { AND: { id: { not: userId }, email: { contains: search, mode: "insensitive" } } },
        take: limit,
        skip: offset,
        orderBy: { email: "asc" },
      }),
      db.user.count({ where: { AND: { id: { not: userId }, email: { contains: search, mode: "insensitive" } } } }),
    ]);
    return { items: users.map((user) => ({ user })), hasMore: users.length + offset < totalCount };
  },
});
