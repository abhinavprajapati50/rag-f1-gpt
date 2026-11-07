import "./globals.css";

export const metadata = {
  title: "F1GPT — Your Formula 1 Companion",
  description: "Your AI race engineer for Formula 1 stories, strategy, stats, and everything in between.",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;