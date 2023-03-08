import { hash, verify } from "argon2";
import { nanoid } from "nanoid";
import { loginSchema, mapZodErrorsToInvalidInput, registerSchema } from "../common/validations";
import { DatabaseClient, LoginResult, RegisterResult, Response } from "../types";

const SESSION_ID_COOKIE_KEY = "sessionId";

export const generateAuthModel = ({
  db,
  res,
  userId,
}: {
  db: DatabaseClient;
  res: Response;
  userId: string | null;
}) => ({
  async currentUser() {
    if (!userId) {
      throw new Error("Unauthenticated");
    }
    return await db.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, email: true, avatarUrl: true },
    });
  },

  async login(args: { email: string; password: string }): Promise<LoginResult> {
    const result = loginSchema.safeParse(args);
    if (!result.success) {
      return mapZodErrorsToInvalidInput(result.error);
    }

    const { email, password } = args;
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return {
        title: "Invalid email or password",
        invalidInputs: [{ field: "password", message: "Invalid email or password" }],
      };
    }
    const isPasswordValid = await verify(user.password, password);
    if (!isPasswordValid) {
      return {
        title: "Invalid email or password",
        invalidInputs: [{ field: "password", message: "Invalid email or password" }],
      };
    }

    const sessionId = nanoid();
    const updatedUser = await db.user.update({
      where: { email },
      data: { sessionId },
    });
    res.cookie(SESSION_ID_COOKIE_KEY, sessionId, {
      httpOnly: true,
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      sameSite: "none",
      secure: true,
    });
    return { session: { userId: updatedUser.id } };
  },

  async logout() {
    try {
      if (userId) {
        await db.user.update({
          where: { id: userId },
          data: { sessionId: null },
        });
      }
      res.clearCookie(SESSION_ID_COOKIE_KEY);
    } catch (error) {
      throw new Error("Could not log off");
    }
    return true;
  },

  async register(args: { email: string; password: string }): Promise<RegisterResult> {
    const result = registerSchema.safeParse(args);
    if (!result.success) {
      return mapZodErrorsToInvalidInput(result.error);
    }

    const { email, password } = args;

    const existingUser = await db.user.findFirst({ where: { email } });
    if (existingUser) {
      return {
        title: "User already exists",
        invalidInputs: [{ field: "email", message: "Email already used" }],
      };
    }

    const newUser = await db.user.create({
      select: { id: true, email: true },
      data: {
        email,
        password: await hash(password),
        avatarUrl: `https://api.dicebear.com/5.x/pixel-art/svg?seed=${email}`,
      },
    });
    return { id: newUser.id, email: newUser.email };
  },
});
