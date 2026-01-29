import Hero from "@/components/home/Hero";
import SubjectGrid from "@/components/home/SubjectGrid";
import HomeLeaderboard from "@/components/home/HomeLeaderboard";

export default function Home() {
  return (
    <main>
      <Hero />
      <SubjectGrid />
      
      <HomeLeaderboard />
    </main>
  );
}
