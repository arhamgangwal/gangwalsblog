
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import dbConnect from "./mongoose";

type AuthInstance = Awaited<ReturnType<typeof createAuth>>;

async function createAuth() {
  const mongooseInstance = await dbConnect();
  const client = mongooseInstance.connection.getClient();

  return betterAuth({
    database: mongodbAdapter(client.db()),
    emailAndPassword: {
      enabled: true,
    },
  });
}

let authInstance: AuthInstance | null = null;
let authPromise: Promise<AuthInstance> | null = null;

export async function initAuth() {
  if (authInstance) {
    return authInstance;
  }

  if (!authPromise) {
    authPromise = createAuth();
  }

  try {
    authInstance = await authPromise;
    return authInstance;
  } catch (error) {
    authPromise = null;
    throw error;
  }
}
