import QuizInterface from "@/components/quiz/QuizInterface";

export default async function SubjectQuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <main>
      <QuizInterface subjectSlug={slug} />
    </main>
  );
}
