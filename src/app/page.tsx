"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [zip, setZip] = useState("");
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    if (zip.trim().length === 5 && /^\d{5}$/.test(zip)) {
      router.push(`/results?zip=${zip}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white">
      <div className="w-full max-w-md bg-white/90 rounded-xl shadow-lg p-10 flex flex-col items-center">
        <h1 className="text-3xl font-semibold mb-4 text-center text-gray-800">Civic Engagement App</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Enter your ZIP code to get the contact info for your representatives and take action.
        </p>
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            type="text"
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            value={zip}
            onChange={e => setZip(e.target.value)}
            placeholder="ZIP Code"
            className="w-full px-4 py-3 text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-gray-800 placeholder-gray-600 focus:placeholder-transparent"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl font-semibold py-3 rounded-lg transition-colors"
          >
            Get My Representatives
          </button>
        </form>
      </div>
    </div>
  );
}
