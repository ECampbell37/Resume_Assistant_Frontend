import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabaseServer } from '@/lib/supabaseClient';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const { data: user, error } = await supabaseServer
          .from('users')
          .select('id, email, hashed_password')
          .eq('email', credentials.email)
          .single();

        if (error || !user || !user.hashed_password) return null;

        const isValid = await bcrypt.compare(credentials.password, user.hashed_password);
        if (!isValid) return null;

        return { id: user.id, email: user.email };
      },
    }),

    // Google OAuth provider (can add GitHub, etc. too)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }

      // Handle OAuth: look up/create user in Supabase if necessary
      if (account?.provider === 'google' && token?.email) {
        const { data, error } = await supabaseServer
          .from('users')
          .select('id')
          .eq('email', token.email)
          .single();

        if (data) {
          token.id = data.id;
        } else {
          const userId = crypto.randomUUID();
          await supabaseServer.from('users').insert({
            id: userId,
            email: token.email,
            hashed_password: null,
          });
          token.id = userId;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  pages: {
    signIn: '/signin',
  },
});

export { handler as GET, handler as POST };
