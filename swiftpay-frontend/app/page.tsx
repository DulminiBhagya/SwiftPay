"use client";

import { useState, useEffect } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  Wallet: {
    balance: number;
  } | null;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [senderEmail, setSenderEmail] = useState("");
  const [receiverEmail, setReceiverEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [forceError, setForceError] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Could not fetch users, backend might not be ready yet.");
    }
  };

  useEffect(() => {
    fetchUsers();
    // Auto-refresh every 5 seconds for convenience
    const interval = setInterval(fetchUsers, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "info", message: "Processing transaction..." });

    try {
      const res = await fetch("http://localhost:5000/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderEmail, receiverEmail, amount, forceError }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: "success", message: `Transfer Successful! Sent $${data.data.amount}.` });
        setAmount("");
        fetchUsers();
      } else {
        setStatus({ type: "error", message: data.error || data.details || "Transfer failed" });
      }
    } catch (err: any) {
      setStatus({ type: "error", message: "Network error. Ensure backend is running." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans flex flex-col items-center justify-center p-6 selection:bg-indigo-500/30">
      
      {/* Header */}
      <div className="max-w-4xl w-full mb-12 text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          SwiftPay
        </h1>
        <p className="text-slate-400 text-lg">
          Mastering Database Transactions with Sequelize.
        </p>
      </div>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Left Column: Transfer Form */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500 opacity-50"></div>
          
          <h2 className="text-2xl font-bold mb-6 text-white">Send Money</h2>
          
          <form onSubmit={handleTransfer} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Sender Email</label>
              <select 
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              >
                <option value="" disabled>Select Sender</option>
                {users.map(u => (
                  <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Receiver Email</label>
              <select 
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
              >
                <option value="" disabled>Select Receiver</option>
                {users.filter(u => u.email !== senderEmail).map(u => (
                  <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount ($)</label>
              <input 
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
              <input 
                type="checkbox"
                id="forceError"
                className="w-5 h-5 accent-red-500 cursor-pointer"
                checked={forceError}
                onChange={(e) => setForceError(e.target.checked)}
              />
              <label htmlFor="forceError" className="text-sm font-medium text-red-400 cursor-pointer flex-1">
                Trigger Sequelize Rollback Error
                <span className="block text-xs opacity-75 mt-0.5 text-red-300">
                  Simulates a crash after sender deduction to test ACID properties.
                </span>
              </label>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 flex justify-center items-center"
            >
              {loading ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                "Complete Transfer"
              )}
            </button>
          </form>

          {/* Status Messages */}
          {status && (
            <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 transition-all animate-in fade-in slide-in-from-bottom-2
              ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : ''}
              ${status.type === 'error' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : ''}
              ${status.type === 'info' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : ''}
            `}>
              <div className="flex-1 text-sm font-medium">{status.message}</div>
            </div>
          )}
        </div>

        {/* Right Column: Database State Visualization */}
        <div className="space-y-6 flex flex-col">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Database State
            </h2>
            
            {users.length === 0 ? (
              <div className="text-slate-500 text-sm text-center py-8 bg-slate-800/50 rounded-xl">
                Waiting for backend connection...
              </div>
            ) : (
              <div className="space-y-4">
                {users.map(u => (
                  <div key={u.id} className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/50 hover:border-slate-600 transition-colors flex justify-between items-center group">
                    <div>
                      <div className="font-semibold text-white text-lg">{u.name}</div>
                      <div className="text-xs text-slate-400 mt-1 truncate">{u.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500 mb-1">Balance</div>
                      <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 group-hover:scale-105 origin-right transition-transform">
                        ${Number(u.Wallet?.balance || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6 text-sm text-slate-400 shadow-inner">
            <h3 className="text-indigo-400 font-semibold mb-2">How this works:</h3>
            <ul className="list-disc list-inside space-y-2 opacity-80">
              <li>Built with <strong className="text-white">Next.js</strong> & Tailwind.</li>
              <li>Backend handles transfers in a <strong className="text-white">single Sequelize Transaction</strong>.</li>
              <li>If step 2 fails, the DB perfectly <strong className="text-red-400">Rolls Back</strong> the money deducted in step 1.</li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
}
