'use client';

import React, { useState } from 'react';
import Hero from "@/components/home/Hero";
import SubjectGrid from "@/components/home/SubjectGrid";
import HomeLeaderboard from "@/components/home/HomeLeaderboard";
import PUCETSection from "@/components/home/PUCETSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CountdownSection from "@/components/home/CountdownSection";
import StreamSelector from "@/components/home/StreamSelector";

export default function Home() {
  const [selectedStream, setSelectedStream] = useState<'medical' | 'non-medical' | null>(null);

  return (
    <main>
      <Hero />
      <FeaturesSection />
      <PUCETSection />
      <CountdownSection />
      {selectedStream ? (
        <SubjectGrid 
          selectedStream={selectedStream} 
          onBack={() => setSelectedStream(null)} 
        />
      ) : (
        <StreamSelector onSelect={setSelectedStream} />
      )}
      <HomeLeaderboard />
    </main>
  );
}
