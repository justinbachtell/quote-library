import "~/styles/globals.css";

import { Inter } from "next/font/google";
import { cookies } from "next/headers";

import { ThemeProvider } from "~/app/_components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

import { getServerAuthSession } from "~/server/auth";
// import { api } from "~/trpc/server";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "~/app/_components/navbar";
import Footer from "~/app/_components/footer";
import { env } from "~/env";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "Quote Library | JustinBachtell.com",
  description: "A quote library for Justin Bachtell.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  const isSession = session ? true : false;

  // check if user is admin or if node env is development
  const authUser = session?.user.email === env.ADMIN_EMAIL ? true : false;

  return (
    <html lang="en">
      <body
        className={`light:text-stone-800 font-sans dark:text-white ${inter.variable}`}
      >
        <TRPCReactProvider cookies={cookies().toString()}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar authenticated={authUser} user={isSession} />
            {children}
            <Toaster />
            <Footer />
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
