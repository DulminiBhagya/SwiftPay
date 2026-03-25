"use client";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-100 flex space-x-4">
      <Link href="/dashboard">Dashboard</Link>
      <Link href="/send">Send Money</Link>
      <Link href="/login">Logout</Link>
    </nav>
  );
}