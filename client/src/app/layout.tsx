import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { IssueDetailPanel } from "@/components/issue-detail/issue-detail-panel";
import { NewIssueModal } from "@/components/new-issue/new-issue-modal";
import { NewProjectModal } from "@/components/projects/new-project-modal";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { GlobalShortcuts } from "@/components/global-shortcuts";
import { ConfirmDialogHost } from "@/components/ui/confirm-dialog";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BuildFlow",
  description: "Plan, track, and ship work — issues, projects, cycles, and goals in one place.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-bg text-fg font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Suspense fallback={null}>
            <AuthGuard>{children}</AuthGuard>
          </Suspense>
          <IssueDetailPanel />
          <NewIssueModal />
          <NewProjectModal />
          <CommandPalette />
          <GlobalShortcuts />
          <ConfirmDialogHost />
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
