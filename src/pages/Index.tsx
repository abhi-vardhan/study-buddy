
import { useState } from "react";
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import FileUpload from "@/components/FileUpload";
import AIProcessing from "@/components/AIProcessing";
import StudyGuide from "@/components/StudyGuide";
import FlashcardViewer from "@/components/FlashcardViewer";
import QuizGenerator from "@/components/QuizGenerator";
import AudioPlayer from "@/components/AudioPlayer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ScrollText, ListChecks, Headphones } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [studyMaterialsGenerated, setStudyMaterialsGenerated] = useState(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null);
  
  // State for AI-generated content
  const [studyGuideData, setStudyGuideData] = useState<{
    title: string;
    content: Array<{
      section: string;
      keyPoints: string[];
      summary: string;
    }>;
  } | null>(null);
  
  const [flashcardData, setFlashcardData] = useState<{
    title: string;
    cards: Array<{
      id: number;
      question: string;
      answer: string;
    }>;
  } | null>(null);
  
  const [quizData, setQuizData] = useState<{
    title: string;
    questions: Array<{
      id: number;
      question: string;
      options: string[];
      correctAnswerIndex: number;
    }>;
  } | null>(null);
  
  const [audioData, setAudioData] = useState<{
    title: string;
    audioUrl: string;
  } | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length > 0) {
      setIsProcessing(true);
      setProcessingStage(0);
      
      try {
        // Process first file only for now
        const file = files[0];
        const formData = new FormData();
        formData.append('file', file);
        
        // Start processing animation
        const stageTimers = [
          setTimeout(() => setProcessingStage(1), 2000),
          setTimeout(() => setProcessingStage(2), 4000)
        ];
        
        // Call our edge function to process the file
        const { data: processingResponse, error } = await supabase.functions.invoke('process-files', {
          body: formData,
        });
        
        // Clear animation timers
        stageTimers.forEach(timer => clearTimeout(timer));
        
        if (error) {
          throw new Error(`Error processing file: ${error.message}`);
        }
        
        // Final processing stage
        setProcessingStage(3);
        
        // Store the generated data
        if (processingResponse) {
          setStudyGuideData(processingResponse.studyGuide || {
            title: "Study Guide",
            content: [{
              section: "No Content Available",
              keyPoints: ["Please try uploading a different file"],
              summary: "No summary available"
            }]
          });
          
          setFlashcardData(processingResponse.flashcards || {
            title: "Flashcards",
            cards: [{
              id: 1,
              question: "No flashcards available",
              answer: "Please try uploading a different file"
            }]
          });
          
          setQuizData(processingResponse.quiz || {
            title: "Quiz",
            questions: [{
              id: 1,
              question: "No quiz available",
              options: ["Option A", "Option B", "Option C", "Option D"],
              correctAnswerIndex: 0
            }]
          });
          
          setAudioData(processingResponse.audio || {
            title: "Audio Summary",
            audioUrl: ""
          });
        }
        
        // Complete processing
        setTimeout(() => {
          handleProcessingComplete();
          toast({
            title: "Processing complete!",
            description: "Your study materials are ready.",
          });
        }, 1500);
        
      } catch (error) {
        console.error("Error processing files:", error);
        setIsProcessing(false);
        toast({
          variant: "destructive",
          title: "Processing failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred",
        });
      }
    }
  };

  const handleProcessingComplete = () => {
    setIsProcessing(false);
    setStudyMaterialsGenerated(true);
  };

  const handleQuizComplete = (score: number, total: number) => {
    setQuizScore({ score, total });
    toast({
      title: "Quiz completed!",
      description: `You scored ${score} out of ${total}`,
    });
  };

  const generateTextToSpeech = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text },
      });
      
      if (error) throw new Error(`Error generating speech: ${error.message}`);
      
      return data.audioUrl;
    } catch (error) {
      console.error("Text-to-speech error:", error);
      toast({
        variant: "destructive",
        title: "Audio generation failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      return null;
    }
  };

  const scrollToUploadSection = () => {
    const uploadSection = document.getElementById('upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <Hero onGetStarted={scrollToUploadSection} />

      <section id="upload-section" className="py-16 px-4 sm:px-6 relative">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Transform Your Notes into AI-Powered Study Materials</h2>
            <p className="text-muted-foreground">
              Upload your lecture notes, textbooks, or any study material. Our AI will analyze your content and create personalized study tools.
            </p>
          </div>

          {!studyMaterialsGenerated ? (
            <FileUpload onFilesSelected={handleFilesSelected} />
          ) : (
            <Tabs defaultValue="studyguide" className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <TabsList className="bg-muted/60 p-1 rounded-full">
                  <TabsTrigger value="studyguide" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-studyBuddy-primary">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Study Guide
                  </TabsTrigger>
                  <TabsTrigger value="flashcards" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-studyBuddy-primary">
                    <ScrollText className="h-4 w-4 mr-2" />
                    Flashcards
                  </TabsTrigger>
                  <TabsTrigger value="quiz" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-studyBuddy-primary">
                    <ListChecks className="h-4 w-4 mr-2" />
                    Quiz
                  </TabsTrigger>
                  <TabsTrigger value="audio" className="rounded-full data-[state=active]:bg-white data-[state=active]:text-studyBuddy-primary">
                    <Headphones className="h-4 w-4 mr-2" />
                    Audio
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="studyguide" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
                {studyGuideData && (
                  <StudyGuide title={studyGuideData.title} content={studyGuideData.content} />
                )}
              </TabsContent>

              <TabsContent value="flashcards" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
                {flashcardData && (
                  <FlashcardViewer title={flashcardData.title} cards={flashcardData.cards} />
                )}
              </TabsContent>

              <TabsContent value="quiz" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
                {quizData && (
                  <QuizGenerator 
                    title={quizData.title} 
                    questions={quizData.questions}
                    onComplete={handleQuizComplete}
                  />
                )}
              </TabsContent>

              <TabsContent value="audio" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
                {audioData && (
                  <AudioPlayer 
                    title={audioData.title} 
                    audioUrl={audioData.audioUrl} 
                    generateTextToSpeech={generateTextToSpeech}
                    studyContent={studyGuideData?.content}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </section>

      {/* Features section */}
      <section id="features" className="py-16 bg-studyBuddy-background/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Features That Make Learning Easier</h2>
            <p className="text-muted-foreground">
              Our AI-powered tools help you study more efficiently and effectively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-xl border border-border/40 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="bg-studyBuddy-primary/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-studyBuddy-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Study Guides</h3>
              <p className="text-muted-foreground">
                Automatically extract and organize key concepts and summaries from your notes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border/40 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="bg-studyBuddy-secondary/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <ScrollText className="h-6 w-6 text-studyBuddy-secondary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Interactive Flashcards</h3>
              <p className="text-muted-foreground">
                Generate question-answer pairs for effective memorization and recall practice.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border/40 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="bg-studyBuddy-accent/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <ListChecks className="h-6 w-6 text-studyBuddy-accent" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Personalized Quizzes</h3>
              <p className="text-muted-foreground">
                Test your knowledge with AI-generated quizzes based on your study materials.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-border/40 shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
              <div className="bg-studyBuddy-success/10 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                <Headphones className="h-6 w-6 text-studyBuddy-success" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Audio Learning</h3>
              <p className="text-muted-foreground">
                Listen to your notes with natural-sounding voice for auditory learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-16 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-studyBuddy-primary to-studyBuddy-secondary rounded-2xl shadow-lg overflow-hidden">
            <div className="p-8 md:p-12 text-white">
              <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Study Routine?</h2>
              <p className="mb-6 opacity-90">
                Start using StudyBuddy AI today and experience a smarter way to learn. Upload your notes and let our AI do the hard work.
              </p>
              <Button 
                className="bg-white text-studyBuddy-primary hover:bg-white/90 rounded-full px-8"
                onClick={scrollToUploadSection}
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* AI Processing overlay */}
      <AIProcessing 
        isProcessing={isProcessing} 
        processingStage={processingStage} 
        onComplete={handleProcessingComplete} 
      />
    </Layout>
  );
};

export default Index;
