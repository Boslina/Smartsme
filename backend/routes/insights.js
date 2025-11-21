// routes/insightRoutes.js - Financial Insights Generation
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// GET /api/insights - Generate financial insights
router.get("/", async (req, res) => {
  try {
    // Check if API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ 
        error: "OpenAI API key not configured. Please set OPENAI_API_KEY in .env file" 
      });
    }

    // Get Transaction model
    const Transaction = require("mongoose").model("Transaction");
    
    // Fetch all transactions
    const transactions = await Transaction.find();

    if (transactions.length === 0) {
      return res.json({ 
        insights: "No transactions found. Add some transactions to get insights.",
        hasData: false
      });
    }

    // Calculate basic metrics
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netProfit = totalIncome - totalExpenses;

    // Group by category
    const categoryBreakdown = transactions.reduce((acc, t) => {
      const cat = t.category || "Uncategorized";
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += Math.abs(t.amount);
      return acc;
    }, {});

    // Create summary for AI
    const summary = `
Business Financial Summary:
- Total Income: ₦${totalIncome.toFixed(2)}
- Total Expenses: ₦${totalExpenses.toFixed(2)}
- Net Profit: ₦${netProfit.toFixed(2)}
- Number of Transactions: ${transactions.length}

Category Breakdown:
${Object.entries(categoryBreakdown)
  .map(([cat, amt]) => `  ${cat}: ₦${amt.toFixed(2)}`)
  .join('\n')}

Recent Transactions:
${transactions.slice(-5).map(t => 
  `  ${new Date(t.date).toLocaleDateString()}: ${t.description} - ₦${t.amount.toFixed(2)}`
).join('\n')}
    `.trim();

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a financial advisor for small and medium enterprises (SMEs) in Nigeria. Provide clear, actionable insights and recommendations based on the financial data provided. Use Nigerian Naira (₦) in your responses."
        },
        {
          role: "user",
          content: `Analyze this business's financial data and provide insights, trends, and recommendations:\n\n${summary}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const insights = completion.choices[0].message.content;

    res.json({ 
      insights,
      hasData: true,
      metrics: {
        totalIncome,
        totalExpenses,
        netProfit,
        transactionCount: transactions.length,
        categoryBreakdown
      }
    });

  } catch (error) {
    console.error("Error generating insights:", error);
    
    // Provide specific error messages
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ 
        error: "Invalid OpenAI API key. Please check your API key in .env file" 
      });
    }
    
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({ 
        error: "OpenAI API quota exceeded. Please check your billing details" 
      });
    }

    res.status(500).json({ 
      error: "Failed to generate insights",
      details: error.message 
    });
  }
});

module.exports = router;
