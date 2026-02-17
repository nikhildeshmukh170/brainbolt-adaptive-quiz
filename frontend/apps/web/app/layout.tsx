import "@/app/globals.css";
import AppProvider from "@/providers/app-provider";
import Header from "@/components/ui/header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppProvider>
          <Header />
          <main className="container py-8">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}
