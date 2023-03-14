import { faker } from "@faker-js/faker";
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

async function main() {
  let user = await prisma.user.create({
    data: {
      email: "user@m.com",
      password: await hash("pass"),
    },
  });

  for (let i = 0; i < 10; i++) {
    const email = faker.internet.email();
    const newUser = await prisma.user.create({
      data: {
        email,
        password: await hash("pass"),
        contacts: {
          connect: {
            email: user.email,
          },
        },
        avatarUrl: `https://api.dicebear.com/5.x/pixel-art/svg?seed=${email}`,
      },
    });
    await prisma.user.update({
      where: {
        email: user.email,
      },
      data: {
        contacts: {
          connect: [
            {
              id: newUser.id,
            },
          ],
        },
      },
    });
  }

  const users = await prisma.user.findMany({ where: { NOT: { id: user.id } } });
  for (const { id: buddyId } of users.slice(0, 5)) {
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          connect: [{ id: user.id }, { id: buddyId }],
        },
      },
    });
    for (let i = 0; i < 200; i++) {
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          messages: {
            create: {
              sender: { connect: { id: i % 2 ? user.id : buddyId } },
              body: faker.lorem.sentences(),
              timestamp: faker.date.recent(),
            },
          },
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
