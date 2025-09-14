
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useLocalStorage from '@/hooks/useLocalStorage';
import type { Exam, Question } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Timer, Clock, Home } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { format } from 'date-fns';

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [savedExams] = useLocalStorage<Exam[]>('savedExams', []);
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [timeUntilStart, setTimeUntilStart] = useState('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const foundExam = savedExams.find((e) => e.id === examId);
    if (foundExam) {
      setExam(foundExam);
    }
  }, [examId, savedExams, isClient]);

  useEffect(() => {
    if (!exam || !isClient) return;

    const checkStartTime = () => {
      const now = new Date().getTime();
      const examStartTime = new Date(exam.windowStart).getTime();
      
      if (now >= examStartTime) {
        setExamStarted(true);
        setTimeLeft(exam.duration * 60);
        setStartTime(Date.now());
        return true;
      } else {
        const diff = examStartTime - now;
        const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
        const s = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');
        setTimeUntilStart(`${h}:${m}:${s}`);
        return false;
      }
    };

    if (!checkStartTime()) {
      const interval = setInterval(() => {
        if (checkStartTime()) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [exam, isClient]);

  useEffect(() => {
    if (!startTime || !examStarted || !isClient) return;

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = (exam?.duration || 0) * 60 - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
      if (remaining <= 0) {
        clearInterval(timer);
        handleSubmit();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, exam?.duration, examStarted, isClient]);
  
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (exam && currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    const timeTaken = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    const submission = {
        examId,
        answers,
        timeTaken,
        submittedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`submission-${examId}`, JSON.stringify(submission));
    router.push(`/exam/${examId}/results`);
  };

  if (!isClient) {
    return <div className="flex items-center justify-center min-h-screen">Loading exam...</div>;
  }

  if (!exam) {
    return <div className="flex items-center justify-center min-h-screen">Loading exam...</div>;
  }

  if (!examStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 p-4 font-body">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>{exam.name}</CardTitle>
            <p className="text-muted-foreground pt-2">This exam has not started yet.</p>
          </CardHeader>
          <CardContent>
            <p>It will be available on:</p>
            <p className="font-semibold text-lg">{format(new Date(exam.windowStart), 'PPP p')}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-2xl font-mono text-primary">
              <Clock className="h-8 w-8" />
              <span>{timeUntilStart}</span>
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
             <p className="text-sm text-muted-foreground">The page will automatically refresh when the exam begins.</p>
             <Button onClick={() => router.push('/')} variant="outline"><Home className="mr-2"/> Back to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const isMCQ = (currentQuestion.type?.toLowerCase() === 'm1' || currentQuestion.type?.toLowerCase() === 'mcq') && currentQuestion.options && currentQuestion.options.length > 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-muted/20 p-4 font-body">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{exam.name}</CardTitle>
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                <Timer className="h-6 w-6"/>
                <span>{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="mt-2" />
          <p className="text-sm text-muted-foreground mt-1">Question {currentQuestionIndex + 1} of {exam.questions.length}</p>
        </CardHeader>
        <CardContent className="min-h-[300px]">
            <h2 className="text-xl font-semibold mb-4">{currentQuestion.text}</h2>
            {isMCQ && currentQuestion.options && (
                <RadioGroup 
                    value={answers[currentQuestion.id] || ''}
                    onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                    className="space-y-2"
                >
                    {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 p-3 rounded-md border has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <RadioGroupItem value={option.text} id={`q${currentQuestion.id}-o${index}`} />
                            <Label htmlFor={`q${currentQuestion.id}-o${index}`} className="flex-1 cursor-pointer">{option.text}</Label>
                        </div>
                    ))}
                </RadioGroup>
            )}
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handlePrev} disabled={currentQuestionIndex === 0}>
                Previous
            </Button>
            {currentQuestionIndex < exam.questions.length - 1 ? (
                <Button onClick={handleNext}>
                    Next
                </Button>
            ) : (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Submit Exam</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You cannot change your answers after submitting. Please review your answers before proceeding.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmit}>Submit</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </CardFooter>
      </Card>
    </div>
  );
}
