import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-cyan-400 tracking-widest">
          SHADOW
        </h1>

        <p className="mt-4 text-gray-400">
          Shadow V2 is under construction...
        </p>

        <button className="mt-8 px-8 py-3 rounded-2xl bg-cyan-400 text-black font-bold hover:scale-105 transition">
          ENTER
        </button>
      </div>
    </div>
  );
}
