import Hero from "@/components/home/Hero";
import SubjectGrid from "@/components/home/SubjectGrid";
import HomeLeaderboard from "@/components/home/HomeLeaderboard";
import PUCETSection from "@/components/home/PUCETSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <PUCETSection />
      <SubjectGrid />
      <HomeLeaderboard />
    </main>
  );
}
