"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const router = useRouter();
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) router.push("/login");

    // Fetch wallet
    fetch(`http://localhost:3000/api/wallet/${userId}`)
      .then(res => res.json())
      .then(data => setWallet(data));

    // Fetch transactions
    fetch(`http://localhost:3000/api/transactions/${userId}`)
      .then(res => res.json())
      .then(data => setTransactions(data));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {wallet && <p className="mb-4">Your balance: ${wallet.balance}</p>}
      <h2 className="text-xl font-semibold mb-2">Transactions</h2>
      <ul className="border p-4 rounded">
        {transactions.map(tx => (
          <li key={tx.id}>
            {tx.type} ${tx.amount} from {tx.senderEmail} to {tx.receiverEmail}
          </li>
        ))}
      </ul>
    </div>
  );
}