import { Header } from "@/components/Header";
import { ContentBrowser } from "@/components/ContentBrowser";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <Header />
      <main className="pt-6">
        <ContentBrowser />
      </main>
    </div>
  );
}
