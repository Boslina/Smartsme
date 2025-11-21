import React, { useEffect, useState } from "react";

export default function Insights() {
  const [insight, setInsight] = useState("");
  const [prediction, setPrediction] = useState("");
  const [trend, setTrend] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/insights")
      .then((res) => res.json())
      .then((data) => {
        setInsight(data.insight);
        setPrediction(data.prediction);
        setTrend(data.trend);
      })
      .catch(() => setInsight("Error loading insights"));
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-3">AI Insights</h2>
      <p className="text-lg mb-2">Predicted Next Spending: ₦{prediction}</p>
      <p className="text-lg mb-2">Trend: {trend}</p>
      <div className="p-3 bg-gray-100 rounded">
        <p>{insight}</p>
      </div>
    </div>
  );
}
