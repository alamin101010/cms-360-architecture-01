
'use client';

import type { DragEvent } from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Question, QuestionSet, Exam } from '@/types';
import { allQuestions as initialQuestions } from '@/data/mock-data';
import { Header } from '@/components/Header';
import { QuestionBank } from '@/components/QuestionBank';
import { ExamBuilder } from '@/components/ExamBuilder';
import { useToast } from '@/hooks/use-toast';
import useLocalStorage from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [questions, setQuestions] = useLocalStorage<Question[]>('allQuestions', initialQuestions);
  const [currentExamQuestions, setCurrentExamQuestions] = useState<Question[]>([]);
  const [examDetails, setExamDetails] = useState({
    name: 'New Exam',
    duration: 60,
    negativeMarking: 0,
    windowStart: '',
    windowEnd: '',
  });

  const [savedExams, setSavedExams] = useLocalStorage<Exam[]>('savedExams', []);
  const { toast } = useToast();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const questionId = e.dataTransfer.getData('questionId');
    const questionSetId = e.dataTransfer.getData('questionSetId');

    if (questionId) {
      const questionToAdd = questions.find((q) => q.id === questionId);
      if (questionToAdd && !currentExamQuestions.some(q => q.id === questionToAdd.id)) {
        setCurrentExamQuestions((prev) => [...prev, questionToAdd]);
        toast({ title: 'Question added to exam.' });
      }
    }

    if (questionSetId) {
      const questionIdsInSet = questionSetId.split(',');
      const questionsFromSet = questions.filter(q => questionIdsInSet.includes(q.id));
      const newQuestions = questionsFromSet.filter(q => !currentExamQuestions.some(examQ => examQ.id === q.id));
      setCurrentExamQuestions(prev => [...prev, ...newQuestions]);
      toast({ title: `Added ${newQuestions.length} new questions from the set.` });
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const persistQuestions = (updatedQuestions: Question[]) => {
    setQuestions(updatedQuestions);
  }

  const addSuggestedQuestions = (newQuestions: Omit<Question, 'id'>[]) => {
    const uniqueNewQuestions = newQuestions.filter(nq => !questions.some(q => q.text === nq.text));
    const questionsWithIds: Question[] = uniqueNewQuestions.map((q, i) => ({ ...q, id: `ai-${Date.now()}-${i}`, createdAt: new Date().toISOString() }));
    const updatedQuestions = [...questionsWithIds, ...questions];
    persistQuestions(updatedQuestions);
    toast({ title: `${questionsWithIds.length} AI-suggested questions added to the bank.` });
    return questionsWithIds;
  };

  const addImportedQuestions = (newQuestions: Omit<Question, 'id'>[]) => {
    const uniqueNewQuestions = newQuestions.filter(nq => !questions.some(q => q.text === nq.text));
    const questionsWithIds: Question[] = uniqueNewQuestions.map((q, i) => ({...q, id: `import-${Date.now()}-${i}`, createdAt: new Date().toISOString()}));
    const updatedQuestions = [...questionsWithIds, ...questions];
    persistQuestions(updatedQuestions);
    toast({ title: `${questionsWithIds.length} imported questions added to the bank.` });
  };
  
  const addQuestionsToExam = (questionsToAdd: Question[]) => {
    const newQuestions = questionsToAdd.filter(q => !currentExamQuestions.some(examQ => examQ.id === q.id));
    setCurrentExamQuestions(prev => [...prev, ...newQuestions]);
    toast({ title: `Added ${newQuestions.length} questions to the exam.` });
  };

  const removeQuestionFromExam = (questionId: string) => {
    setCurrentExamQuestions(prev => prev.filter(q => q.id !== questionId));
  };
  
  const addMultipleQuestionsToExam = (questionIds: string[]) => {
    const questionsToAdd = questions.filter(q => questionIds.includes(q.id));
    addQuestionsToExam(questionsToAdd);
  };

  const deleteQuestion = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    persistQuestions(updatedQuestions);
    setCurrentExamQuestions(prev => prev.filter(q => q.id !== questionId));
    toast({ title: "Question deleted." });
  };

  const deleteMultipleQuestions = (questionIds: string[]) => {
    const updatedQuestions = questions.filter(q => !questionIds.includes(q.id));
    persistQuestions(updatedQuestions);
    setCurrentExamQuestions(prev => prev.filter(q => !questionIds.includes(q.id)));
    toast({ title: `${questionIds.length} questions deleted.` });
  };
  
  const updateQuestion = (updatedQuestion: Question) => {
    const updatedQuestions = questions.map(q => q.id === updatedQuestion.id ? updatedQuestion : q);
    persistQuestions(updatedQuestions);
    setCurrentExamQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
    toast({ title: "Question updated successfully." });
  };

  const updateMultipleQuestions = (questionsToUpdate: Question[]) => {
    const questionMap = new Map(questionsToUpdate.map(q => [q.id, q]));
    const updatedQuestions = questions.map(q => questionMap.has(q.id) ? questionMap.get(q.id)! : q);
    persistQuestions(updatedQuestions);

    // Also update questions in the current exam if they were edited
    setCurrentExamQuestions(prev => prev.map(q => questionMap.has(q.id) ? questionMap.get(q.id)! : q));
    toast({ title: `${questionsToUpdate.length} questions updated successfully.` });
  };


  const saveExam = () => {
    if (examDetails.name.trim() === '' || currentExamQuestions.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot save exam',
        description: 'Please provide a name and add at least one question.',
      });
      return;
    }
    const newExam: Exam = {
      id: `exam-${Date.now()}`,
      name: examDetails.name,
      questions: currentExamQuestions,
      createdAt: new Date().toISOString(),
      duration: examDetails.duration,
      negativeMarking: examDetails.negativeMarking,
      windowStart: examDetails.windowStart,
      windowEnd: examDetails.windowEnd,
    };
    setSavedExams([...savedExams, newExam]);
    toast({ 
        title: 'Exam saved successfully!',
        description: `URL: /exam/${newExam.id}`,
        action: (
            <Button variant="outline" size="sm" onClick={() => router.push(`/exam/${newExam.id}`)}>
                Take Exam
            </Button>
        )
    });
    clearExam();
  };

  const clearExam = () => {
    setCurrentExamQuestions([]);
    setExamDetails({
      name: 'New Exam',
      duration: 60,
      negativeMarking: 0,
      windowStart: '',
      windowEnd: '',
    });
    toast({ title: 'Exam cleared.' });
  }

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header savedExams={savedExams} />
      <main className="flex-1 grid lg:grid-cols-2 gap-6 p-4 md:p-6 overflow-hidden">
        <QuestionBank
          questions={questions}
          addSuggestedQuestions={addSuggestedQuestions}
          addImportedQuestions={addImportedQuestions}
          addMultipleQuestionsToExam={addMultipleQuestionsToExam}
          addQuestionsToExam={addQuestionsToExam}
          deleteQuestion={deleteQuestion}
          deleteMultipleQuestions={deleteMultipleQuestions}
          updateQuestion={updateQuestion}
          updateMultipleQuestions={updateMultipleQuestions}
        />
        <ExamBuilder
          examDetails={examDetails}
          setExamDetails={setExamDetails}
          currentExamQuestions={currentExamQuestions}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          removeQuestionFromExam={removeQuestionFromExam}
          saveExam={saveExam}
          clearExam={clearExam}
        />
      </main>
    </div>
  );
}
