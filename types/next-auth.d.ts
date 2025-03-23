import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name?: string
      email?: string
      image?: string
      enabled?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: number;
    name?: string
    email?: string
    image?: string
    enabled?: boolean;
  }

  interface Message {
    id: number;
    conversationId: number;
    userId: number;
    content: string | null | undefined | number;
    fileType?: string
    createdAt: Date;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    name?: string
    email?: string
    image?: string
    enabled?: boolean;
  }
}