import React, { useState } from 'react';
import SubjectGrid from "@/components/home/SubjectGrid";
import StreamSelector from "@/components/home/StreamSelector";

export default function MockTests() {
  const [selectedStream, setSelectedStream] = useState<'medical' | 'non-medical' | null>(null);

  return (
    <main style={{ paddingTop: '80px' }}>
      {!selectedStream ? (
        <StreamSelector onSelect={(stream) => setSelectedStream(stream)} />
      ) : (
        <SubjectGrid
          selectedStream={selectedStream} 
          onBack={() => setSelectedStream(null)} 
        />
      )}
    </main>
  );
}
