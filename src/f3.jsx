// import React from 'react';
// import { useSurvey } from './f1';

// export const AiQuestion = ({ question, index }) => {
//   const { updateAiResponse } = useSurvey();

//   return (
//     <div className="survey-question-card">
//       <h3>{question.question}</h3>
//       <textarea
//         placeholder="Provide your response"
//         onChange={(e) => updateAiResponse(index, e.target.value)}
//       />
//     </div>
//   );
// };

const enhanceDataWithAI = async (originalData) => {
  try {
    const enhancedPrompt = `
      As an expert survey designer, please clean and enhance the following survey data. 
      Follow these rules:
      1. Fix any malformed text or quotes
      
      2. Standardize question formatting
      3. Make answer options more clear and consistent
      4. Preserve all original Question_IDs and precode values
      5. Maintain the exact same data structure
      6. Keep all existing options but improve their text clarity
      7. Keep a question professional looking and make it in atleast 49 words
      8. Hispanic answer wer incomplete 
      No , not of Hispanic, Latino, or Spanish origin	1
        Yes, Mexican, Mexican American, Chicano	2
        Yes, Cuban	3
        Yes, another Hispanic, Latino, or Spanish origin *** Argentina 	4
        Yes, another Hispanic, Latino, or Spanish origin *** Colombia 	5
        Yes, another Hispanic, Latino, or Spanish origin *** Ecuador 	6
        Yes, another Hispanic, Latino, or Spanish origin *** El Salvadore 	7
        Yes, another Hispanic, Latino, or Spanish origin *** Guatemala 	8
        Yes, another Hispanic, Latino, or Spanish origin *** Nicaragua 	9
        Yes, another Hispanic, Latino, or Spanish origin *** Panama 	10
        Yes, another Hispanic, Latino, or Spanish origin *** Peru 	11
        Yes, another Hispanic, Latino, or Spanish origin *** Spain 	12
        Yes, another Hispanic, Latino, or Spanish origin *** Venezuela 	13
        Yes, another Hispanic, Latino, or Spanish origin *** Other Country	14
        Prefer not to answer	15
        Yes, Puerto Rican	16

        can you format them properly in  hispanic

      Original survey data:
      ${JSON.stringify(originalData, null, 2)}

      Please return the enhanced data in exactly the same JSON structure with the same fields (Question, Question_ID, Options array with answer and precode fields).
    `;

    const apiKey = "AIzaSyCcr8sTqsAvkBSTpCOZMUTZubBiuAJe1BQ"; // Make sure to set this in your .env file
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: enhancedPrompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    // Extract the JSON response from the AI
    const aiResponse = response.data?.candidates[0]?.content?.parts[0]?.text;
    const jsonMatch = aiResponse?.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const enhancedData = JSON.parse(jsonMatch[0]);
      console.log(enhancedData);
      setCleanedData(enhancedData);
    } else {
      // Fallback to original data if AI enhancement fails
      setCleanedData(originalData);
      console.warn("AI enhancement failed, using original data");
    }
  } catch (err) {
    console.error("AI enhancement error:", err);
    setCleanedData(originalData); // Fallback to original data
  }
};

const enhanceDataWithAI = async (originalData) => {
  if (!API_CONFIG.geminiKey) {
    console.warn("Gemini API key not configured, using original data");
    setSurveyData(prev => ({ ...prev, cleaned: originalData }));
    return;
  }

  try {
    const enhancedPrompt = generateAIPrompt(originalData);
    console.log(API_CONFIG.geminiKey)
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_CONFIG.geminiKey}`,
      {
        contents: [{ parts: [{ text: enhancedPrompt }] }],
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const jsonMatch = aiResponse?.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const enhancedData = JSON.parse(jsonMatch[0]);
      setSurveyData(prev => ({ ...prev, cleaned: enhancedData }));
    } else {
      throw new Error("Invalid AI response format");
    }
  } catch (err) {
    console.warn("AI enhancement failed, using original data:", err);
    setSurveyData(prev => ({ ...prev, cleaned: originalData }));
  }
};

const generateAIPrompt = (originalData) => {
  return `
  As an expert survey designer, please clean and enhance the following survey data. 
  Follow these rules:
  1. Fix any malformed text or quotes
  
  2. Standardize question formatting
  3. Make answer options more clear and consistent
  4. Preserve all original Question_IDs and precode values
  5. Maintain the exact same data structure
  6. Keep all existing options but improve their text clarity
  7. Keep a question professional looking and make it in atleast 49 words
  8. Hispanic answer wer incomplete 
  No , not of Hispanic, Latino, or Spanish origin	1
    Yes, Mexican, Mexican American, Chicano	2
    Yes, Cuban	3
    Yes, another Hispanic, Latino, or Spanish origin *** Argentina 	4
    Yes, another Hispanic, Latino, or Spanish origin *** Colombia 	5
    Yes, another Hispanic, Latino, or Spanish origin *** Ecuador 	6
    Yes, another Hispanic, Latino, or Spanish origin *** El Salvadore 	7
    Yes, another Hispanic, Latino, or Spanish origin *** Guatemala 	8
    Yes, another Hispanic, Latino, or Spanish origin *** Nicaragua 	9
    Yes, another Hispanic, Latino, or Spanish origin *** Panama 	10
    Yes, another Hispanic, Latino, or Spanish origin *** Peru 	11
    Yes, another Hispanic, Latino, or Spanish origin *** Spain 	12
    Yes, another Hispanic, Latino, or Spanish origin *** Venezuela 	13
    Yes, another Hispanic, Latino, or Spanish origin *** Other Country	14
    Prefer not to answer	15
    Yes, Puerto Rican	16

    can you format them properly in  hispanic

  Original survey data:
  ${JSON.stringify(originalData, null, 2)}

  Please return the enhanced data in exactly the same JSON structure with the same fields (Question, Question_ID, Options array with answer and precode fields).
`;
};

const handleInputChange = (questionId, value) => {
  setAnswers(prev => ({
    ...prev,
    [questionId]: value
  }));
};