import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Award, ChevronRight, ChevronLeft } from 'lucide-react';

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  // Track user answers and answered questions
  const [userAnswers, setUserAnswers] = useState([]);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await window.fs.readFile('test_questions1.txt', { encoding: 'utf8' });
        
        // Parse the questions from the file
        const questionPattern = /Q\d+\.\s(.*?)\s*A\.\s(.*?)\s*B\.\s(.*?)\s*C\.\s(.*?)(?:\s*D\.\s(.*?))?\s*Correct\s+Answer:\s+(.*?)\s*Explanation:\s*([\s\S]*?)(?=Q\d+\.|$)/gi;
        
        let parsedQuestions = [];
        let match;
        
        while ((match = questionPattern.exec(response)) !== null) {
          const question = {
            text: match[1].trim(),
            options: [
              { id: 'A', text: match[2].trim() },
              { id: 'B', text: match[3].trim() },
              { id: 'C', text: match[4].trim() },
            ],
            correctAnswer: match[6].trim().charAt(0), // Extract just the letter
            explanation: match[7].trim()
          };
          
          // Add option D if it exists
          if (match[5]) {
            question.options.push({ id: 'D', text: match[5].trim() });
          }
          
          parsedQuestions.push(question);
        }
        
        // Shuffle the questions
        parsedQuestions = shuffleArray(parsedQuestions);
        setQuestions(parsedQuestions);
        // Initialize userAnswers and answeredQuestions arrays
        setUserAnswers(new Array(parsedQuestions.length).fill(null));
        setAnsweredQuestions(new Array(parsedQuestions.length).fill(false));
        setLoading(false);
      } catch (error) {
        console.error("Error loading questions:", error);
        setLoading(false);
      }
    }
    
    loadQuestions();
  }, []);

  // Fisher-Yates shuffle algorithm
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Modified to only select the answer without submitting
  const handleAnswerSelect = (answerId) => {
    if (showExplanation) return; // Don't allow changes after submission
    setSelectedAnswer(answerId);
  };
  
  // New function to handle answer submission
  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || showExplanation) return;
    
    // Update userAnswers array
    const updatedUserAnswers = [...userAnswers];
    updatedUserAnswers[currentQuestionIndex] = selectedAnswer;
    setUserAnswers(updatedUserAnswers);
    
    // Mark question as answered
    const updatedAnsweredQuestions = [...answeredQuestions];
    updatedAnsweredQuestions[currentQuestionIndex] = true;
    setAnsweredQuestions(updatedAnsweredQuestions);
    
    // Update score if answer is correct
    if (selectedAnswer === questions[currentQuestionIndex].correctAnswer) {
      setScore(score + 1);
    }
    
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    setFadeOut(true);
    
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        // If we've already answered this question, show the explanation
        if (answeredQuestions[currentQuestionIndex + 1]) {
          setSelectedAnswer(userAnswers[currentQuestionIndex + 1]);
          setShowExplanation(true);
        } else {
          setSelectedAnswer(null);
          setShowExplanation(false);
        }
      } else {
        setQuizComplete(true);
      }
      
      setFadeOut(false);
      setFadeIn(true);
      
      setTimeout(() => {
        setFadeIn(false);
      }, 500);
    }, 500);
  };
  
  // New function to handle going to previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex === 0) return;
    
    setFadeOut(true);
    
    setTimeout(() => {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Set the previously selected answer
      setSelectedAnswer(userAnswers[currentQuestionIndex - 1]);
      // Show explanation if question was answered
      setShowExplanation(answeredQuestions[currentQuestionIndex - 1]);
      
      setFadeOut(false);
      setFadeIn(true);
      
      setTimeout(() => {
        setFadeIn(false);
      }, 500);
    }, 500);
  };

  const resetQuiz = () => {
    setQuestions(shuffleArray([...questions]));
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowExplanation(false);
    setQuizComplete(false);
    setUserAnswers(new Array(questions.length).fill(null));
    setAnsweredQuestions(new Array(questions.length).fill(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    let message;
    let messageColor;
    
    if (percentage >= 90) {
      message = "Outstanding! You're an Einstein AI expert!";
      messageColor = "text-green-400";
    } else if (percentage >= 70) {
      message = "Great job! You have solid knowledge of Einstein AI!";
      messageColor = "text-blue-400";
    } else if (percentage >= 50) {
      message = "Good effort! Keep learning about Einstein AI!";
      messageColor = "text-yellow-400";
    } else {
      message = "Keep studying! Einstein AI has a lot to offer!";
      messageColor = "text-red-400";
    }
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-6">
        <div className="bg-gray-800 rounded-lg shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <Award className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
            <div className="mb-6">
              <div className="text-5xl font-bold mb-2">
                {score} / {questions.length}
              </div>
              <div className="text-xl">{percentage}% Correct</div>
            </div>
            <p className={`text-xl mb-8 ${messageColor}`}>{message}</p>
            
            <button 
              onClick={resetQuiz}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full transition duration-300 shadow-lg hover:shadow-xl"
            >
              Take Quiz Again
            </button>
            
            {/* Button to review answers */}
            <div className="mt-4">
              <button 
                onClick={() => {
                  setQuizComplete(false);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer(userAnswers[0]);
                  setShowExplanation(answeredQuestions[0]);
                }}
                className="text-blue-400 hover:text-blue-300 underline"
              >
                Review Answers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className={`bg-gray-800 rounded-lg shadow-2xl p-6 max-w-3xl w-full transition-opacity duration-500 ease-in-out ${fadeOut ? 'opacity-0' : 'opacity-100'} ${fadeIn ? 'opacity-0' : 'opacity-100'}`}>
        {/* Header with progress and score */}
        <div className="flex justify-between items-center mb-6">
          <div className="bg-gray-700 rounded-full px-4 py-2">
            <span className="font-bold">Question {currentQuestionIndex + 1}/{questions.length}</span>
          </div>
          <div className="bg-blue-600 rounded-full px-4 py-2">
            <span className="font-bold">Score: {score}</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
        
        {/* Question */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold leading-relaxed">{currentQuestion.text}</h2>
        </div>
        
        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswerSelect(option.id)}
              disabled={showExplanation}
              className={`w-full text-left p-4 rounded-lg transition duration-300 flex items-start ${
                !showExplanation
                  ? selectedAnswer === option.id
                    ? 'bg-blue-700 text-white' // Currently selected (but not submitted)
                    : 'bg-gray-700 hover:bg-gray-600' // Not selected
                  : selectedAnswer === option.id
                    ? option.id === currentQuestion.correctAnswer
                      ? 'bg-green-700 text-white' // Correct answer selected
                      : 'bg-red-700 text-white' // Wrong answer selected
                    : option.id === currentQuestion.correctAnswer
                      ? 'bg-green-700 text-white' // Show correct answer
                      : 'bg-gray-700 opacity-70' // Other options
              }`}
            >
              <div className="flex-none mr-3 mt-0.5">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-600 text-white font-medium">
                  {option.id}
                </span>
              </div>
              <span>{option.text}</span>
              {showExplanation && option.id === currentQuestion.correctAnswer && (
                <CheckCircle className="ml-auto text-green-400 h-6 w-6 flex-shrink-0" />
              )}
              {showExplanation && selectedAnswer === option.id && option.id !== currentQuestion.correctAnswer && (
                <AlertCircle className="ml-auto text-red-400 h-6 w-6 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
        
        {/* Submit button (only shown before submission) */}
        {!showExplanation && (
          <div className="flex justify-center mb-6">
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className={`bg-blue-600 py-3 px-8 rounded-lg font-bold transition duration-300 ${
                selectedAnswer === null 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:bg-blue-700 shadow-lg hover:shadow-xl'
              }`}
            >
              Submit Answer
            </button>
          </div>
        )}
        
        {/* Explanation */}
        {showExplanation && (
          <div className="bg-gray-700 rounded-lg p-4 mb-6 border-l-4 border-blue-500 animate-fadeIn">
            <h3 className="text-lg font-bold mb-2">Explanation:</h3>
            <p className="text-gray-300 leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex justify-between">
          {/* Previous button */}
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'} py-2 px-4 rounded-lg flex items-center transition duration-300`}
          >
            <ChevronLeft className="mr-1 h-5 w-5" />
            Previous
          </button>
          
          {/* Next button */}
          <button
            onClick={handleNextQuestion}
            disabled={!showExplanation && !answeredQuestions[currentQuestionIndex]}
            className={`${!showExplanation && !answeredQuestions[currentQuestionIndex] ? 'opacity-50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-bold py-2 px-6 rounded-lg flex items-center transition duration-300`}
          >
            {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
            <ChevronRight className="ml-2 h-5 w-5" />
          </button>
        </div>
        
        {/* Question navigation */}
        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="flex flex-wrap gap-2 justify-center">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setFadeOut(true);
                  setTimeout(() => {
                    setCurrentQuestionIndex(index);
                    setSelectedAnswer(userAnswers[index]);
                    setShowExplanation(answeredQuestions[index]);
                    setFadeOut(false);
                    setFadeIn(true);
                    setTimeout(() => setFadeIn(false), 500);
                  }, 500);
                }}
                className={`h-8 w-8 rounded-full flex items-center justify-center font-medium ${
                  currentQuestionIndex === index 
                    ? 'bg-blue-600 text-white' 
                    : answeredQuestions[index]
                      ? userAnswers[index] === questions[index].correctAnswer
                        ? 'bg-green-700 text-white'
                        : 'bg-red-700 text-white'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
