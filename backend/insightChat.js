// ============================================
// FILE: backend/routes/insights.js
// ============================================
const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Make sure this is set in your .env file
});

// ========== CHAT ENDPOINT (FIXED) ==========
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        error: 'Message is required',
        reply: 'Please provide a message'
      });
    }

    console.log('Received chat message:', message);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-3.5-turbo" for cheaper option
      messages: [
        {
          role: "system",
          content: `You are an expert business advisor for small and medium-sized manufacturing enterprises (SMEs) in Nigeria. 
          You provide practical advice on:
          - Pricing strategies and cost management
          - Cash flow optimization
          - Production efficiency
          - Sales and marketing strategies
          - Inventory management
          - Business growth and scaling
          - Financial planning and budgeting
          
          Keep responses concise, practical, and actionable. Use Nigerian Naira (₦) in financial examples.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    // Extract the AI's response
    const aiReply = completion.choices[0].message.content;

    console.log('AI Response:', aiReply);

    // Send response in the format expected by frontend
    res.json({
      reply: aiReply,
      answer: aiReply, // Backward compatibility
      success: true
    });

  } catch (error) {
    console.error('Chat error:', error);
    
    // Handle specific errors
    if (error.code === 'insufficient_quota') {
      return res.status(402).json({
        error: 'OpenAI API quota exceeded',
        reply: 'The AI service is temporarily unavailable due to quota limits. Please try again later.'
      });
    }

    if (error.code === 'invalid_api_key') {
      return res.status(401).json({
        error: 'Invalid API key',
        reply: 'AI service configuration error. Please contact support.'
      });
    }

    res.status(500).json({
      error: error.message,
      reply: 'Sorry, I encountered an error processing your request. Please try again.'
    });
  }
});

// ========== FORECAST ENDPOINT ==========
router.get('/forecast', async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    
    // Get recent transactions
    const transactions = await Transaction.find()
      .sort({ date: -1 })
      .limit(30);

    if (transactions.length < 3) {
      return res.json({
        prediction: 0,
        trend: 'insufficient data',
        message: 'Not enough data for forecast'
      });
    }

    // Simple moving average forecast
    const expenses = transactions
      .filter(t => t.amount < 0)
      .map(t => Math.abs(t.amount));
    
    const avgExpense = expenses.reduce((a, b) => a + b, 0) / expenses.length;
    
    // Calculate trend
    const recentExpenses = expenses.slice(0, 10);
    const olderExpenses = expenses.slice(10, 20);
    const recentAvg = recentExpenses.reduce((a, b) => a + b, 0) / recentExpenses.length;
    const olderAvg = olderExpenses.reduce((a, b) => a + b, 0) / olderExpenses.length;
    
    let trend = 'stable';
    if (recentAvg > olderAvg * 1.1) trend = 'increasing';
    if (recentAvg < olderAvg * 0.9) trend = 'decreasing';

    res.json({
      prediction: Math.round(avgExpense),
      trend: trend,
      confidence: expenses.length > 20 ? 'high' : 'medium'
    });

  } catch (error) {
    console.error('Forecast error:', error);
    res.status(500).json({
      error: error.message,
      prediction: 0,
      trend: 'error'
    });
  }
});

// ========== INSIGHTS ENDPOINT ==========
router.get('/', async (req, res) => {
  try {
    const Transaction = require('../models/Transaction');
    
    const transactions = await Transaction.find().sort({ date: -1 }).limit(50);
    
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const balance = totalIncome - totalExpense;
    
    // Generate insight
    let insight = '';
    if (balance > 0) {
      insight = `Your business is profitable with a positive balance of ₦${balance.toLocaleString()}. `;
    } else {
      insight = `Your expenses exceed income by ₦${Math.abs(balance).toLocaleString()}. Consider cost reduction strategies. `;
    }
    
    if (totalExpense > 0) {
      const profitMargin = ((totalIncome - totalExpense) / totalIncome * 100).toFixed(1);
      insight += `Your profit margin is ${profitMargin}%.`;
    }

    res.json({
      insight,
      totalIncome,
      totalExpense,
      balance,
      transactionCount: transactions.length
    });

  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({
      error: error.message,
      insight: 'Unable to generate insights'
    });
  }
});

module.exports = router;
