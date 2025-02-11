import React from 'react';
import { useSurvey } from './f1';

export const StandardQuestion = ({ item }) => {
  const { updateResponse } = useSurvey();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === "checkbox") {
      updateResponse(name, Array.from(e.target.form.elements)
        .filter(el => el.name === name && el.checked)
        .map(el => el.value));
    } else {
      updateResponse(name, value);
    }
  };

  return (
    <div className="survey-question-card">
      {/* <h3 className="survey-question-label">{item.Label}</h3> */}
      {/* <p><strong>Type:</strong> {item.Question_Type}</p> */}
      <p><strong>Question:</strong> {item.Question}</p>

      {item.Question_Type === "Numeric - Open-end" && (
        <input
          type="number"
          placeholder="Enter your answer"
          name={item.Label}
          onChange={handleInputChange}
        />
      )}

      {item.Question_Type === "Single Punch" && item.Option && (
        <div className="survey-options-group">
          <strong>Options:</strong>
          {item.Option.split("_").map((option, index) => (
            <label key={index}>
              <input
                type="radio"
                name={item.Label}
                value={option.toUpperCase()}
                onChange={handleInputChange}
              />
              {option}
            </label>
          ))}
        </div>
      )}

      {item.Question_Type === "Multi Punch" && item.Option && (
        <div className="survey-options-group">
          <strong>Options:</strong>
          {item.Option.split("_").map((option, index) => (
            <label key={index}>
              <input
                type="checkbox"
                name={item.Label}
                value={option}
                onChange={handleInputChange}
              />
              {option}
            </label>
          ))}
        </div>
      )}

      {(item.Question_Type === "Dummy" || item.Question_Type === "Other") && (
        <textarea
          placeholder="Enter your response"
          name={item.Label}
          onChange={handleInputChange}
        />
      )}
    </div>
  );
};