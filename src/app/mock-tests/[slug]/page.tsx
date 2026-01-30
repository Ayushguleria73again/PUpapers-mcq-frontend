'use client';

import React, { useState } from 'react';
import QuizInterface from "@/components/quiz/QuizInterface";
import ChapterSelector from "@/components/quiz/ChapterSelector";
import { useParams, useRouter } from 'next/navigation';

export default function SubjectQuizPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [selectedChapter, setSelectedChapter] = useState<string | null | undefined>(undefined);
  const [difficulty, setDifficulty] = useState('all');

  // undefined: Still need to choose
  // null: Full subject mastery chosen
  // string: Chapter ID chosen

  const handleSelect = (chapterId: string | null, diff: string) => {
    setDifficulty(diff);
    setSelectedChapter(chapterId);
  };

  if (selectedChapter === undefined) {
    return (
      <ChapterSelector 
        subjectSlug={slug} 
        onSelect={handleSelect} 
        onBack={() => router.push('/mock-tests')} 
      />
    );
  }

  return (
    <main>
      <QuizInterface 
        subjectSlug={slug} 
        chapterId={selectedChapter} 
        difficulty={difficulty} 
      />
    </main>
  );
}
