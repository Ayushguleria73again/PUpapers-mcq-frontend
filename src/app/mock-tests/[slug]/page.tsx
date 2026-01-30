'use client';

import React, { useState } from 'react';
import QuizInterface from "@/components/quiz/QuizInterface";
import ChapterSelector from "@/components/quiz/ChapterSelector";
import { useParams } from 'next/navigation';

export default function SubjectQuizPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [selectedChapter, setSelectedChapter] = useState<string | null | undefined>(undefined);

  // undefined: Still need to choose
  // null: Full subject mastery chosen
  // string: Chapter ID chosen

  if (selectedChapter === undefined) {
    return <ChapterSelector subjectSlug={slug} onSelect={setSelectedChapter} />;
  }

  return (
    <main>
      <QuizInterface subjectSlug={slug} chapterId={selectedChapter} />
    </main>
  );
}
