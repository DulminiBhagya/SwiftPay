"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    // For now, fake login: find user by email in backend
    const res = await fetch("http://localhost:3000/api/users"); // You need /api/users route
    const users = await res.json();
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      localStorage.setItem("userId", user.id);
      router.push("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-80">
        <h1 className="text-xl font-bold mb-4">SwiftPay Login</h1>
        <input type="email" placeholder="Email" 
          className="border p-2 w-full mb-4" 
          value={email} onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="Password" 
          className="border p-2 w-full mb-4" 
          value={password} onChange={e => setPassword(e.target.value)} />
        <button className="bg-blue-500 text-white p-2 w-full rounded">Login</button>
      </form>
    </div>
  );
}