import Hero from "@/components/home/Hero";
import SubjectGrid from "@/components/home/SubjectGrid";
import HomeLeaderboard from "@/components/home/HomeLeaderboard";
import PUCETSection from "@/components/home/PUCETSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CountdownSection from "@/components/home/CountdownSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturesSection />
      <PUCETSection />
      <CountdownSection />
      <SubjectGrid />
      <HomeLeaderboard />
    </main>
  );
}
