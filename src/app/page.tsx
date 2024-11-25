"use client";

import { useEffect, useState } from "react";
import LSEGChatbot from "@/components/LSEGChatbot";

export default function Home() {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
  }, []);

  return (
    isRendered && (
      <div className="w-full h-screen flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center">
          <LSEGChatbot />
        </main>
      </div>
    )
  );
}