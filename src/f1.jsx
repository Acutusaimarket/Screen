import React, { createContext, useContext, useState } from 'react';

const SurveyContext = createContext();

export const SurveyProvider = ({ children }) => {
  const [responses, setResponses] = useState({});
  const [aiResponses, setAiResponses] = useState([]);
  const [combinedData, setCombinedData] = useState(null);

  const updateResponse = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const updateAiResponse = (index, value) => {
    setAiResponses(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const generateCombinedData = (questions, aiQuestions) => {
    const standardResponses = Object.entries(responses).map(([key, value]) => ({
      questionId: key,
      responseType: 'standard',
      response: value
    }));

    const aiResponsesFormatted = aiResponses.map((response, index) => ({
      questionId: `ai_question_${index}`,
      responseType: 'ai',
      originalQuestion: aiQuestions[index]?.question,
      response: response
    }));

    const combined = {
      timestamp: new Date().toISOString(),
      surveyResponses: {
        standard: standardResponses,
        ai: aiResponsesFormatted
      }
    };

    setCombinedData(combined);
    return combined;
  };

  return (
    <SurveyContext.Provider value={{
      responses,
      aiResponses,
      combinedData,
      updateResponse,
      updateAiResponse,
      generateCombinedData
    }}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => useContext(SurveyContext);
