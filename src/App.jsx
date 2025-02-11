import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import crypto from "crypto-js";
import logo from "./assets/logo.png";
import ConsentPopup from "./consentPopup";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import "./App.css";

const App = () => {
  const [surveyData, setSurveyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitStatus, setSubmitStatus] = useState({
    loading: false,
    error: null,
    success: false,
  });
  const [showPrescreen, setShowPrescreen] = useState(() => {
    const consentStatus = localStorage.getItem("consentStatus");
    return consentStatus === "accepted";
  });

  const { pid } = useParams();
  const searchParams = new URLSearchParams(window.location.search);
  const loi_min = searchParams.get("loi_min");
  const loi_max = searchParams.get("loi_max");
  const country = searchParams.get("country");

  const API_CONFIG = {
    baseURL: "https://api.qmapi.com",
    endpoints: {
      submit: "/val",
      survey: "/getResearchSurveys",
    },
  };

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_CONFIG.baseURL}${API_CONFIG.endpoints.submit}`
        );
        console.log(response);

        if (response.status === 200 && Array.isArray(response.data)) {
          const filteredData = response.data.filter(
            (question) =>
              question.Question_ID === 42 ||
              question.Question_ID === 43 ||
              question.Question_ID === 96 ||
              question.Question_ID === 113 ||
              question.Question_ID === 61076 ||
              question.Question_ID === 2189 ||
              question.Question_ID === 96 ||
              question.Question_ID === 122 ||
              question.Question_ID === 48741
          );
          setSurveyData(filteredData);
        } else {
          throw new Error("Invalid data format received from server");
        }
      } catch (err) {
        setError(`Failed to load survey: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch survey data if consent has been given
    if (showPrescreen) {
      fetchSurveyData();
    }
  }, [showPrescreen]);

  const handleConsentAccept = async () => {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();

      const ipResponse = await fetch("https://api.ipify.org");
      const ipAddress = await ipResponse.text();

      const deviceData = {
        FingerPrintID: result.visitorId,
        UserAgent: navigator.userAgent,
        DeviceType: /mobile/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        Browser: getBrowser(navigator.userAgent),
        IpAddress: ipAddress,
        PanelistId: pid,
        ScreenResolution: `${window.screen.height} * ${window.screen.width}`,
      };

      // Send device data
      const h = await axios.post(
        "https://api.qmapi.com/devicedata/",
        deviceData
      );
      setShowPrescreen(true);
      localStorage.setItem("consentStatus", "accepted");
    } catch (error) {
      console.error("Error handling consent:", error);
      setError("Failed to process consent. Please try again.");
    }
  };

  const handleConsentDecline = () => {
    localStorage.setItem("consentStatus", "declined");
    window.close();
  };

  const getBrowser = (userAgent) => {
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  };

  const handleInputChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxChange = (questionId, value, checked) => {
    setAnswers((prev) => {
      const currentValues = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, value],
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

  const validateAnswers = () => {
    const missingAnswers = surveyData
      .filter((q) => !answers[q.Question_ID])
      .map((q) => q.Question_ID);

    if (missingAnswers.length > 0) {
      return {
        valid: false,
        message: `Please answer all questions: ${missingAnswers.join(", ")}`,
      };
    }
    return { valid: true };
  };

  class SurveyURLGenerator {
    constructor(baseUrl) {
      this.baseUrl = baseUrl;
      this.hashKey =
        "kH7g65T91zCDYHU3nV8t42UVyuM7QLmTiZ181z7oK2YTms8lLzXZ0V4O40bG7T69E8PF04X9DswmzcXMPpE0E"; // Your hash key
    }

    generateURL(params = {}) {
      const urlParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        urlParams.append(key, value);
      });

      const urlWithParams = `${this.baseUrl}${
        urlParams.toString() ? "?" + urlParams.toString() : ""
      }`;

      const hash = this.generateHash(urlWithParams);

      return `${urlWithParams}${
        urlParams.toString() ? "&" : "?"
      }hash=${encodeURIComponent(hash)}`;
    }

    generateHash(url) {
      const hmacSha1 = crypto.HmacSHA1(url, this.hashKey);
      return crypto.enc.Base64.stringify(hmacSha1)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    }
  }

  const randomString = (length) => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateAnswers();
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    try {
      setSubmitStatus({ loading: true, error: null, success: false });

      const response = await axios.post(
        `${API_CONFIG.baseURL}${API_CONFIG.endpoints.survey}?loi_min=${loi_min}&loi_max=${loi_max}&country=${country}`,
        { score: answers }
      );

      console.log(response)

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error("Invalid response format");
      }

      const topSurvey = response.data.sort((a, b) => b.score - a.score)[0];
      if (!topSurvey) throw new Error("No matching surveys found");
      console.log(topSurvey.survey_id);

      const resp = await axios.post(
        `https://api.qmapi.com/api/v2/survey/prescreen/update/${pid}`,
        null,
        {
          params: {
            survey_id: topSurvey.survey_id,
          },
        }
      );

      const mid = randomString(12);
      const surveyUrl = `${topSurvey.livelink}${pid}&MID=${mid}&`;
      const urlGenerator = new SurveyURLGenerator(surveyUrl);
      const hash = urlGenerator.generateHash(surveyUrl);

      const finalUrl = `${surveyUrl}hash=${hash}`;
      console.log(finalUrl);

      setSubmitStatus({ loading: false, error: null, success: true });
      console.log(finalUrl);
      window.location.href = finalUrl;
    } catch (err) {
      setSubmitStatus({
        loading: false,
        error: `Submission failed: ${err.message}`,
        success: false,
      });
    }
  };

  const renderQuestionInput = (question) => {
    switch (question.Type) {
      case "Numeric - Open-end":
        return (
          <input
            type="number"
            className="input-field"
            value={answers[question.Question_ID] || ""}
            onChange={(e) =>
              handleInputChange(question.Question_ID, e.target.value)
            }
            placeholder="Enter a number"
            required
          />
        );
      case "Dummy":
        return (
          <input
            className="input-field"
            value={answers[question.Question_ID] || ""}
            onChange={(e) =>
              handleInputChange(question.Question_ID, e.target.value)
            }
            placeholder="Enter text"
            required
          />
        );
      case "Single Punch":
        return (
          <select
            className="select-field"
            value={answers[question.Question_ID] || ""}
            onChange={(e) =>
              handleInputChange(question.Question_ID, e.target.value)
            }
            required
          >
            <option value="">Select an answer</option>
            {question.Options.map((option) => (
              <option key={option.precode} value={option.precode}>
                {option.answer}
              </option>
            ))}
          </select>
        );
      case "Multi Punch":
        return (
          <div className="multi-punch-options">
            {question.Options.map((option) => (
              <label key={option.precode} className="checkbox-option">
                <input
                  type="checkbox"
                  value={option.precode}
                  checked={answers[question.Question_ID]?.includes(
                    option.precode
                  )}
                  onChange={(e) =>
                    handleCheckboxChange(
                      question.Question_ID,
                      option.precode,
                      e.target.checked
                    )
                  }
                />
                {option.answer}
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (loading && showPrescreen) {
    return <div className="loading-container">Loading survey...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="app-container">
      {!showPrescreen &&
        localStorage.getItem("consentStatus") !== "accepted" && (
          <ConsentPopup
            onAccept={handleConsentAccept}
            onDecline={handleConsentDecline}
          />
        )}

      {showPrescreen && (
        <div className="survey-container">
          <form onSubmit={handleSubmit} className="survey-form">
            <div className="logo-container">
              <img src={logo} alt="Logo" className="logo" />
              ACUTUS AI
            </div>
            <h1 className="survey-title">Please complete the survey</h1>
            {surveyData.map((question) => (
              <div className="question-container" key={question.Question_ID}>
                <label className="question-label">{question.Question}</label>
                {renderQuestionInput(question)}
              </div>
            ))}
            <button
              type="submit"
              className="submit-button"
              disabled={submitStatus.loading}
            >
              {submitStatus.loading ? "Submitting..." : "Submit"}
            </button>
            {submitStatus.error && (
              <div className="submit-error">{submitStatus.error}</div>
            )}
            {submitStatus.success && (
              <div className="submit-success">
                Survey submitted successfully!
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default App;
