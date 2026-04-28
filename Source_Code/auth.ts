import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { ensureGithubAuthorProfile } from "./lib/github/ensureGithubAuthorProfile"

// Scopes we request from GitHub:
//   read:user, user:email — default profile data (login, id, name, email)
//   read:org              — needed so /user/repos can return org repos the user collaborates on
//   public_repo           — read access to public repos (needed for collaborator filter to include public repos beyond the user's own)
//   codespace             — read the user's Codespaces so we can surface "Open in Codespace" links
const GITHUB_SCOPES = "read:user user:email read:org public_repo codespace"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      authorization: {
        params: { scope: GITHUB_SCOPES },
      },
    }),
  ],
  events: {
    async signIn({ profile, account }) {
      const p = profile as unknown as {
        login?: string
        id?: number
        name?: string
        avatar_url?: string
      }

      const githubLogin = p?.login
      if (!githubLogin) return

      // NextAuth exposes provider tokens on `account` for OAuth flows.
      const accessToken = account?.access_token

      try {
        await ensureGithubAuthorProfile({
          githubLogin,
          githubId: p?.id,
          name: p?.name ?? githubLogin,
          avatarUrl: p?.avatar_url,
          accessToken,
        })
      } catch (err) {
        // Avoid breaking sign-in UX if the sync fails.
        console.error("Failed to sync GitHub repos into Sanity:", err)
      }
    },
  },
  callbacks: {
    async jwt({ token, profile, trigger }) {
      // On OAuth sign-in/sign-up, NextAuth provides the OAuth profile.
      if (trigger === "signIn" || trigger === "signUp") {
        const p = profile as unknown as {
          login?: string
          id?: number | string
        }

        if (p?.login) token.githubLogin = p.login
        if (p?.id !== undefined) token.githubId = String(p.id)
      }

      return token
    },
    async session({ session, token }) {
      // Expose GitHub identity to the frontend.
      if (session.user) {
        session.user.githubLogin = token.githubLogin as string | undefined
        session.user.githubId = token.githubId as string | undefined
      }

      return session
    },
  },
})
