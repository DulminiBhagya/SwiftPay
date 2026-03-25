"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SendMoney() {
  const [receiverEmail, setReceiverEmail] = useState("");
  const [amount, setAmount] = useState("");
  const router = useRouter();
  const userId = localStorage.getItem("userId");

  const handleSend = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:3000/api/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderId: parseInt(userId), receiverEmail, amount: parseFloat(amount) })
    });
    const data = await res.json();
    if (res.ok) {
      alert("Transfer successful");
      router.push("/dashboard");
    } else {
      alert(`Error: ${data.error}`);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleSend} className="bg-white p-8 rounded shadow-md w-80">
        <h1 className="text-xl font-bold mb-4">Send Money</h1>
        <input type="email" placeholder="Receiver Email" 
          className="border p-2 w-full mb-4" 
          value={receiverEmail} onChange={e => setReceiverEmail(e.target.value)} />
        <input type="number" placeholder="Amount" 
          className="border p-2 w-full mb-4" 
          value={amount} onChange={e => setAmount(e.target.value)} />
        <button className="bg-green-500 text-white p-2 w-full rounded">Send</button>
      </form>
    </div>
  );
}