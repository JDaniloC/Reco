import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { serverURL } from "@/config";

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "nome@email.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (process.env.VERCEL_ENV === "preview") {
          return {
            name: "Tester",
            email: "teste@email.com",
          }
        }

        const response = await fetch(`${serverURL}/api/auth`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(credentials),
        });

        const user = await response.json()
        if (response.ok && user) {
          return user;
        }
          
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token, user }) {
      const response = await fetch(
        `${serverURL}/api/auth?email=${token.email}`, {
        method: "GET", headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      session.user = data;
      if (session.user) {
        session.user.name = data.nome;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signIn",
    // signOut: "/auth/signout",
    // error: "/auth/error",
    // verifyRequest: "/auth/verify-request",
    // newUser: "/auth/new-user",
  },
};

export default options;
