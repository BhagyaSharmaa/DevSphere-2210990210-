import "next-auth"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      githubLogin?: string
      githubId?: string
    } & DefaultSession["user"]
  }
}

