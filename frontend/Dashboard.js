import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, CartesianGrid, PieChart, Pie, Cell
} from "recharts";
import { motion } from "framer-motion";
import { 
  TrendingUp, TrendingDown, DollarSign, Package, 
  ShoppingCart, BarChart3, FileText, Download, X 
} from "lucide-react";

// Enhanced color scheme - mature and bright
const COLORS = {
  primary: "#1E40AF", // Deep professional blue
  primaryLight: "#3B82F6",
  accent: "#F59E0B", // Bright amber
  success: "#10B981", // Emerald green
  danger: "#EF4444", // Red
  warning: "#F59E0B",
  info: "#06B6D4",
  bg: "#F8FAFC",
  cardBg: "#FFFFFF",
  darkBg: "#0F172A",
  darkCard: "#1E293B",
  text: "#1F2937",
  textLight: "#6B7280"
};

const CHART_COLORS = ['#1E40AF', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#8B5CF6'];

// API Base URL - adjust as needed
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// ========== Add Transaction Component ==========
function AddTransaction({ refresh, setView, theme }) {
  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    category: "",
    type: "expense",
    date: new Date().toISOString().split('T')[0]
  });
  const [customCategory, setCustomCategory] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const predefinedCategories = {
    expense: ["Raw Materials", "Production", "Marketing", "Sales", "Utilities", "Salaries", "Rent", "Transportation", "Packaging"],
    income: ["Product Sales", "Service Income", "Wholesale", "Retail", "Other Income"]
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalCategory = showCustom ? customCategory : formData.category;
    if (!finalCategory) {
      alert("Please select or enter a category");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const transactionData = {
      description: formData.description,
      amount: formData.type === "expense" ? -Math.abs(amount) : Math.abs(amount),
      category: finalCategory,
      date: formData.date
    };

    try {
      const res = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transactionData)
      });
      
      if (res.ok) {
        alert("Transaction added successfully!");
        refresh();
        setView("overview");
      } else {
        alert("Failed to add transaction");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error adding transaction");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className={`p-6 rounded-xl shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
        <h3 className="text-2xl font-bold mb-6" style={{ color: COLORS.primary }}>Add Transaction</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2 font-medium">Type</label>
            <div className="flex gap-4">
              {["income", "expense"].map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({...formData, type, category: ""})}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                    formData.type === type 
                      ? "text-white" 
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  style={formData.type === type ? { backgroundColor: COLORS.primary } : {}}
                >
                  {type === "income" ? "Income" : "Expense"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g., Raw materials purchase"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Amount (₦)</label>
            <input
              type="number"
              required
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Category</label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setShowCustom(false)}
                className={`px-4 py-1 rounded ${!showCustom ? "bg-blue-100 text-blue-700" : "bg-gray-100"}`}
              >
                Predefined
              </button>
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className={`px-4 py-1 rounded ${showCustom ? "bg-blue-100 text-blue-700" : "bg-gray-100"}`}
              >
                Custom
              </button>
            </div>
            
            {showCustom ? (
              <input
                type="text"
                value={customCategory}
                onChange={e => setCustomCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter custom category"
              />
            ) : (
              <select
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select category</option>
                {predefinedCategories[formData.type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 py-3 rounded-lg text-white font-semibold shadow-lg hover:opacity-90 transition"
              style={{ backgroundColor: COLORS.primary }}
            >
              Add Transaction
            </button>
            <button
              type="button"
              onClick={() => setView("overview")}
              className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}

// ========== Report Generator ==========
function ReportGenerator({ transactions, summary, theme }) {
  const [reportType, setReportType] = useState("financial");
  const [dateRange, setDateRange] = useState("month");
  
  const generateReport = () => {
    // Filter transactions by date range
    const now = new Date();
    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      if (dateRange === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return tDate >= weekAgo;
      } else if (dateRange === "month") {
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
      } else if (dateRange === "year") {
        return tDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    let reportContent = "";
    
    if (reportType === "financial") {
      const income = filtered.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const expense = filtered.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      reportContent = `
SMARTSME FINANCIAL REPORT
Generated: ${new Date().toLocaleDateString()}
Period: ${dateRange.toUpperCase()}
${"=".repeat(60)}

SUMMARY
-------
Total Income:     ₦${income.toLocaleString()}
Total Expenses:   ₦${expense.toLocaleString()}
Net Profit:       ₦${(income - expense).toLocaleString()}
Profit Margin:    ${income > 0 ? ((income - expense) / income * 100).toFixed(2) : 0}%

INCOME BREAKDOWN
----------------
${filtered.filter(t => t.amount > 0).map(t => 
  `${t.date} - ${t.category}: ₦${t.amount.toLocaleString()} (${t.description})`
).join('\n') || 'No income recorded'}

EXPENSE BREAKDOWN
-----------------
${filtered.filter(t => t.amount < 0).map(t => 
  `${t.date} - ${t.category}: ₦${Math.abs(t.amount).toLocaleString()} (${t.description})`
).join('\n') || 'No expenses recorded'}

${"=".repeat(60)}
Report prepared by SmartSME - AI Business Management System
      `;
    } else if (reportType === "sales") {
      const sales = filtered.filter(t => t.amount > 0 && (t.category.includes("Sales") || t.category.includes("Product")));
      const totalSales = sales.reduce((sum, t) => sum + t.amount, 0);
      
      reportContent = `
SMARTSME SALES REPORT
Generated: ${new Date().toLocaleDateString()}
Period: ${dateRange.toUpperCase()}
${"=".repeat(60)}

SALES SUMMARY
-------------
Total Sales:        ₦${totalSales.toLocaleString()}
Number of Sales:    ${sales.length}
Average Sale:       ₦${sales.length > 0 ? (totalSales / sales.length).toLocaleString() : 0}

DETAILED SALES
--------------
${sales.map(t => 
  `${t.date} - ${t.category}: ₦${t.amount.toLocaleString()} (${t.description})`
).join('\n') || 'No sales recorded'}

${"=".repeat(60)}
      `;
    } else if (reportType === "production") {
      const production = filtered.filter(t => t.category.includes("Production") || t.category.includes("Raw Materials"));
      const totalCost = production.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      reportContent = `
SMARTSME PRODUCTION REPORT
Generated: ${new Date().toLocaleDateString()}
Period: ${dateRange.toUpperCase()}
${"=".repeat(60)}

PRODUCTION COSTS
----------------
Total Production Cost: ₦${totalCost.toLocaleString()}
Number of Entries:     ${production.length}

BREAKDOWN
---------
${production.map(t => 
  `${t.date} - ${t.category}: ₦${Math.abs(t.amount).toLocaleString()} (${t.description})`
).join('\n') || 'No production costs recorded'}

${"=".repeat(60)}
      `;
    }

    return reportContent;
  };

  const handlePrint = () => {
    const reportContent = generateReport();
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>SmartSME Report</title>
          <style>
            body { font-family: monospace; padding: 20px; white-space: pre-wrap; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>${reportContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownload = () => {
    const reportContent = generateReport();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartSME_${reportType}_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg ${theme === "dark" ? "bg-gray-800" : "bg-white"}`}>
      <h3 className="text-2xl font-bold mb-4" style={{ color: COLORS.primary }}>Generate Report</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block mb-2 font-medium">Report Type</label>
          <select 
            value={reportType} 
            onChange={e => setReportType(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
          >
            <option value="financial">Financial Report</option>
            <option value="sales">Sales Report</option>
            <option value="production">Production Report</option>
            <option value="marketing">Marketing Report</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-2 font-medium">Period</label>
          <select 
            value={dateRange} 
            onChange={e => setDateRange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handlePrint}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold shadow-lg hover:opacity-90 transition"
          style={{ backgroundColor: COLORS.primary }}
        >
          <FileText size={20} />
          Print Report
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-white font-semibold shadow-lg hover:opacity-90 transition"
          style={{ backgroundColor: COLORS.success }}
        >
          <Download size={20} />
          Download Report
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg max-h-96 overflow-auto">
        <pre className="text-xs whitespace-pre-wrap">{generateReport()}</pre>
      </div>
    </div>
  );
}

// ========== Main Dashboard ==========
export default function Dashboard() {
  const [view, setView] = useState("overview");
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 });
  const [forecast, setForecast] = useState(null);
  const [search, setSearch] = useState("");
  const [theme, setTheme] = useState("light");
  const [chatOpen, setChatOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    try {
      const res = await fetch(`${API_BASE}/transactions`);
      const data = await res.json();
      const processed = data.map(t => ({ ...t, amount: Number(t.amount) }));
      setTransactions(processed);

      const totalIncome = processed.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = processed.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      setSummary({ totalIncome, totalExpense, balance: totalIncome - totalExpense });

      fetchForecast();
    } catch (err) {
      console.error("Error fetching transactions:", err);
    }
  }

  async function fetchForecast() {
    try {
      const res = await fetch(`${API_BASE}/insights/forecast`);
      if (res.ok) {
        const data = await res.json();
        setForecast(data);
      }
    } catch (err) {
      console.warn("Forecast unavailable:", err);
    }
  }

  async function sendChatMessage() {
    if (!chatInput.trim()) return;

    const userMsg = { role: "user", content: chatInput };
    setChatMessages([...chatMessages, userMsg]);
    setChatInput("");

    try {
      const res = await fetch(`${API_BASE}/insights/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput })
      });
      const data = await res.json();
      const aiMsg = { role: "ai", content: data.reply || data.answer || "No response" };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages(prev => [...prev, { role: "ai", content: "Error connecting to AI advisor" }]);
    }
  }

  // Data processing
  const categoryMap = {};
  transactions.forEach(t => {
    const cat = t.category || "Uncategorized";
    if (!categoryMap[cat]) categoryMap[cat] = { category: cat, income: 0, expense: 0 };
    if (t.amount > 0) categoryMap[cat].income += t.amount;
    else categoryMap[cat].expense += Math.abs(t.amount);
  });
  const categoryData = Object.values(categoryMap);

  const monthlyMap = {};
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString("default", { month: "short", year: "numeric" });
    if (!monthlyMap[month]) monthlyMap[month] = { month, income: 0, expense: 0, balance: 0 };
    if (t.amount > 0) monthlyMap[month].income += t.amount;
    else monthlyMap[month].expense += Math.abs(t.amount);
    monthlyMap[month].balance = monthlyMap[month].income - monthlyMap[month].expense;
  });
  const monthlyData = Object.values(monthlyMap);

  const trendData = transactions.slice(-10).map(t => ({
    date: new Date(t.date).toLocaleDateString(),
    amount: t.amount
  }));

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: theme === "dark" ? COLORS.darkBg : COLORS.bg }}>
      {/* Sidebar */}
      <aside className={`w-64 p-6 ${theme === "dark" ? "bg-gray-900" : "bg-white"} border-r shadow-lg`}>
        <div className="mb-8">
          <h2 className="text-2xl font-bold" style={{ color: COLORS.primary }}>SmartSME</h2>
          <p className="text-sm opacity-70">AI Business Manager</p>
        </div>
        <nav className="space-y-2">
          {[
            ["Overview", "overview", BarChart3],
            ["Add Transaction", "add", DollarSign],
            ["Reports", "reports", FileText],
            ["Inventory", "inventory", Package],
            ["AI Insights", "insights", TrendingUp]
          ].map(([label, key, Icon]) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                view === key ? "text-white font-semibold" : "hover:bg-gray-100"
              }`}
              style={view === key ? { backgroundColor: COLORS.primary } : {}}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Top Bar */}
        <div className={`flex items-center justify-between p-4 ${theme === "dark" ? "bg-gray-800" : "bg-white"} shadow`}>
          <h3 className="text-xl font-semibold" style={{ color: COLORS.primary }}>
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </h3>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="px-4 py-2 rounded-lg border focus:ring-2 outline-none"
          />
        </div>

        <main className="p-6">
          {view === "add" && <AddTransaction refresh={fetchTransactions} setView={setView} theme={theme} />}
          
          {view === "overview" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Income", value: summary.totalIncome, icon: TrendingUp, color: COLORS.success },
                  { label: "Total Expense", value: summary.totalExpense, icon: TrendingDown, color: COLORS.danger },
                  { label: "Net Balance", value: summary.balance, icon: DollarSign, color: COLORS.primary },
                  { label: "Forecast", value: forecast?.prediction || 0, icon: BarChart3, color: COLORS.accent }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-xl shadow-lg bg-white"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">{item.label}</span>
                      <item.icon size={24} style={{ color: item.color }} />
                    </div>
                    <div className="text-2xl font-bold" style={{ color: item.color }}>
                      ₦{item.value.toLocaleString()}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl shadow-lg bg-white">
                  <h4 className="font-semibold mb-4" style={{ color: COLORS.primary }}>Income vs Expenses</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="income" fill={COLORS.success} />
                      <Bar dataKey="expense" fill={COLORS.danger} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-6 rounded-xl shadow-lg bg-white">
                  <h4 className="font-semibold mb-4" style={{ color: COLORS.primary }}>Monthly Trend</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="income" stroke={COLORS.success} strokeWidth={2} />
                      <Line type="monotone" dataKey="expense" stroke={COLORS.danger} strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="p-6 rounded-xl shadow-lg bg-white">
                <h4 className="font-semibold mb-4" style={{ color: COLORS.primary }}>Recent Transactions</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Date</th>
                        <th className="text-left">Description</th>
                        <th className="text-left">Category</th>
                        <th className="text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.slice(-10).reverse().map((t, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="py-3">{new Date(t.date).toLocaleDateString()}</td>
                          <td>{t.description}</td>
                          <td>{t.category}</td>
                          <td className="text-right font-semibold" style={{ color: t.amount > 0 ? COLORS.success : COLORS.danger }}>
                            ₦{Math.abs(t.amount).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {view === "reports" && <ReportGenerator transactions={transactions} summary={summary} theme={theme} />}

          {view === "inventory" && (
            <div className="p-6 rounded-xl shadow-lg bg-white">
              <h4 className="text-xl font-semibold mb-4" style={{ color: COLORS.primary }}>Inventory Tracking</h4>
              <p className="text-gray-600 mb-4">Track raw materials and production inventory</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categoryData.filter(c => c.category.includes("Raw") || c.category.includes("Production")).map((item, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={20} style={{ color: COLORS.primary }} />
                      <span className="font-semibold">{item.category}</span>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: COLORS.danger }}>
                      ₦{item.expense.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total spent</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "insights" && (
            <div className="p-6 rounded-xl shadow-lg bg-white">
              <h4 className="text-xl font-semibold mb-4" style={{ color: COLORS.primary }}>AI Business Advisor</h4>
              <div className="border rounded-lg p-4 h-96 overflow-y-auto mb-4">
                {chatMessages.length === 0 && (
                  <p className="text-gray-500">Ask me about pricing strategies, cash flow, production costs, or business growth...</p>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`mb-3 ${msg.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block p-3 rounded-lg ${msg.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
                      <div className="font-semibold text-sm mb-1">{msg.role === "user" ? "You" : "AI Advisor"}</div>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && sendChatMessage()}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-2 rounded-lg border focus:ring-2"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-6 py-2 rounded-lg text-white font-semibold"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Chat Widget */}
      {!["insights"].includes(view) && (
        <div className="fixed bottom-6 right-6 z-50">
          {chatOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-white rounded-xl shadow-2xl w-80 overflow-hidden"
            >
              <div className="p-4" style={{ backgroundColor: COLORS.primary }}>
                <div className="flex items-center justify-between text-white">
                  <h4 className="font-semibold">AI Advisor</h4>
                  <button onClick={() => setChatOpen(false)}>
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className="p-4 h-64 overflow-y-auto">
                {chatMessages.length === 0 && (
                  <p className="text-gray-500 text-sm">Hello! I can help you with business decisions, pricing, and more.</p>
                )}
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`mb-2 ${msg.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block p-2 rounded-lg text-sm ${msg.role === "user" ? "bg-blue-100" : "bg-gray-100"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t flex gap-2">
                <input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyPress={e => e.key === "Enter" && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded border text-sm"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-4 py-2 rounded text-white text-sm font-semibold"
                  style={{ backgroundColor: COLORS.primary }}
                >
                  Send
                </button>
              </div>
            </motion.div>
          )}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="w-14 h-14 rounded-full shadow-2xl text-white flex items-center justify-center hover:scale-110 transition"
            style={{ backgroundColor: COLORS.primary }}
          >
            {chatOpen ? <X size={24} /> : <ShoppingCart size={24} />}
          </button>
        </div>
      )}
    </div>
  );
}
