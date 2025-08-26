'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Exam, Submission, Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Home, BarChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [savedExams] = useLocalStorage<Exam[]>('savedExams', []);
  const [submission, setSubmission] = useState<any | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [results, setResults] = useState<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unanswered: number;
    answeredQuestions: (Question & {userAnswer?: string, isCorrect?: boolean})[]
  } | null>(null);

  useEffect(() => {
    const subData = localStorage.getItem(`submission-${examId}`);
    const foundExam = savedExams.find((e) => e.id === examId);

    if (subData && foundExam) {
        const parsedSub = JSON.parse(subData);
        setSubmission(parsedSub);
        setExam(foundExam);
    }
  }, [examId, savedExams]);

  useEffect(() => {
      if(submission && exam) {
        let correctCount = 0;
        const answeredQuestions = exam.questions.map(q => {
            const userAnswer = submission.answers[q.id];
            const correctAnswer = q.options?.find(opt => opt.isCorrect)?.text;
            const isCorrect = userAnswer === correctAnswer;
            if (isCorrect) correctCount++;
            
            return {
                ...q,
                userAnswer,
                isCorrect
            }
        });
        
        const total = exam.questions.length;
        const incorrectCount = Object.keys(submission.answers).length - correctCount;
        const unansweredCount = total - Object.keys(submission.answers).length;

        setResults({
            score: (correctCount / total) * 100,
            totalQuestions: total,
            correctAnswers: correctCount,
            incorrectAnswers: incorrectCount,
            unanswered: unansweredCount,
            answeredQuestions
        });
      }
  }, [submission, exam])

  if (!results || !exam) {
    return <div className="flex items-center justify-center min-h-screen">Calculating results...</div>;
  }
  
  const chartData = [
    { name: 'Correct', value: results.correctAnswers, fill: 'var(--color-correct)' },
    { name: 'Incorrect', value: results.incorrectAnswers, fill: 'var(--color-incorrect)' },
    { name: 'Unanswered', value: results.unanswered, fill: 'var(--color-unanswered)' },
  ];
  
  const chartConfig = {
    value: {
      label: 'Questions',
    },
    Correct: {
      label: 'Correct',
      color: 'hsl(var(--chart-2))',
    },
    Incorrect: {
      label: 'Incorrect',
      color: 'hsl(var(--destructive))',
    },
    Unanswered: {
      label: 'Unanswered',
      color: 'hsl(var(--muted))',
    },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col items-center min-h-screen bg-muted/20 p-4 sm:p-6 md:p-8 font-body">
        <Card className="w-full max-w-4xl mb-8">
            <CardHeader>
                <CardTitle className="text-3xl">Exam Results: {exam.name}</CardTitle>
                <CardDescription>Here's how you performed.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="flex flex-col items-center justify-center">
                    <p className="text-lg text-muted-foreground">Your Score</p>
                    <p className="text-7xl font-bold text-primary">{results.score.toFixed(0)}%</p>
                </div>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                    <PieChart>
                        <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            strokeWidth={5}
                        >
                            <Cell key="cell-0" fill="hsl(var(--chart-2))" />
                            <Cell key="cell-1" fill="hsl(var(--destructive))" />
                            <Cell key="cell-2" fill="hsl(var(--muted))" />
                        </Pie>
                    </PieChart>
                </ChartContainer>
            </CardContent>
            <CardContent className="flex justify-around text-center">
                <div>
                    <p className="text-2xl font-bold">{results.correctAnswers}</p>
                    <p className="text-muted-foreground">Correct</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{results.incorrectAnswers}</p>
                    <p className="text-muted-foreground">Incorrect</p>
                </div>
                 <div>
                    <p className="text-2xl font-bold">{results.unanswered}</p>
                    <p className="text-muted-foreground">Unanswered</p>
                </div>
                <div>
                    <p className="text-2xl font-bold">{results.totalQuestions}</p>
                    <p className="text-muted-foreground">Total</p>
                </div>
            </CardContent>
        </Card>

        <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Detailed Review</CardTitle>
                <CardDescription>Review your answers below.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {results.answeredQuestions.map((q) => (
                <div key={q.id} className={`p-4 rounded-lg border ${q.isCorrect ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}>
                    <p className="font-semibold">{q.text}</p>
                    <div className="text-sm mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                            {q.isCorrect ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600"/>}
                            <span>Your answer: {q.userAnswer || <i className="text-muted-foreground">Not answered</i>}</span>
                        </div>
                        {!q.isCorrect && (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-slate-500" />
                                <span>Correct answer: {q.options?.find(opt => opt.isCorrect)?.text}</span>
                            </div>
                        )}
                    </div>
                </div>
                ))}
            </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
            <Button onClick={() => router.push('/')}><Home className="mr-2"/> Back to Builder</Button>
            <Button onClick={() => router.push('/exams')} variant="outline"><BarChart className="mr-2" /> View All Exams</Button>
        </div>
    </div>
  );
}
