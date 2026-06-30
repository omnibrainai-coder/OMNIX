import React from "react";

export default function SearchScreen() {
  return (
    <div className="p-4 space-y-5">
      <input
        type="text"
        placeholder="Search people, reels, ideas..."
        className="w-full rounded-2xl bg-zinc-900 border border-zinc-800 p-4 text-white outline-none"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          🔥 Trending
        </div>

        <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          🎬 Reels
        </div>

        <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          🤖 AI
        </div>

        <div className="aspect-square rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
          👤 People
        </div>
      </div>
    </div>
  );
}
