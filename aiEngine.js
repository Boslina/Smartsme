// ai/aiEngine.js
const synaptic = require("synaptic");
const { Layer, Network } = synaptic;

// Simple spending prediction (mock learning)
function predictSpending(transactions) {
  if (!transactions || transactions.length === 0) {
    return { prediction: 0, trend: "No data yet" };
  }

  // Prepare data
  const data = transactions.map((t) => parseFloat(t.amount));

  // Create a very small network
  const inputLayer = new Layer(1);
  const hiddenLayer = new Layer(3);
  const outputLayer = new Layer(1);
  inputLayer.project(hiddenLayer);
  hiddenLayer.project(outputLayer);

  const net = new Network({
    input: inputLayer,
    hidden: [hiddenLayer],
    output: outputLayer,
  });

  // Train quickly
  for (let i = 0; i < data.length - 1; i++) {
    net.activate([data[i]]);
    net.propagate(0.3, [data[i + 1]]);
  }

  // Predict next likely spending
  const last = data[data.length - 1];
  const nextSpending = net.activate([last])[0] * 1.05; // small projection factor

  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const trend = nextSpending > avg ? "increasing" : "stable/decreasing";

  return {
    prediction: nextSpending.toFixed(2),
    trend,
  };
}

// Generate natural-language insights
function generateInsight(predictionData) {
  const { prediction, trend } = predictionData;
  if (trend === "increasing") {
    return `Your expenses are trending upward. Projected next spend is ₦${prediction}. Consider cost reduction or supplier negotiation.`;
  } else {
    return `Your expenses appear stable, with the next spend projected at ₦${prediction}. Keep monitoring production efficiency.`;
  }
}

module.exports = { predictSpending, generateInsight };


// Simple spending prediction model
function predictSpending(transactions) {
  if (!transactions || transactions.length === 0) {
    return { prediction: 0, trend: "No data yet" };
  }

  const net = new brain.recurrent.LSTMTimeStep();

  // Prepare training data (amounts over time)
  const data = transactions.map((t) => t.amount);
  const trainingData = [data];

  // Train model
  net.train(trainingData, { iterations: 100, log: false });

  // Predict the next likely spending value
  const nextSpending = net.run(data);

  // Simple trend analysis
  const avg = data.reduce((a, b) => a + b, 0) / data.length;
  const trend = nextSpending > avg ? "increasing" : "stable/decreasing";

  return {
    prediction: nextSpending.toFixed(2),
    trend,
  };
}

// Generate natural-language insights
function generateInsight(predictionData) {
  const { prediction, trend } = predictionData;
  if (trend === "increasing") {
    return `Your expenses are trending upward. Projected next spend is ₦${prediction}. Consider cost reduction or supplier negotiation.`;
  } else {
    return `Your expenses appear stable, with the next spend projected at ₦${prediction}. Keep monitoring production efficiency.`;
  }
}

module.exports = { predictSpending, generateInsight };
