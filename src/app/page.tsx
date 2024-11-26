"use client";

import LSEGChatbot from "@/components/LSEGChatbot";

export default function Home() {
  return (
    <div className="w-full h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center">
        <LSEGChatbot />
      </main>
    </div>
  );
}
