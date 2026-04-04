"use client";

import { useEffect, useState } from "react";
import { LoadingStep } from "@/app/lib/types";

const MESSAGES: Record<LoadingStep, string[]> = {
  analyzing: [
    "Searching FBref for stats...",
    "Checking Transfermarkt...",
    "Reading WhoScored data...",
    "Analyzing performance data...",
    "Comparing similar transfers...",
    "Weighing contract factors...",
    "Consulting the scouting network...",
    "Calculating market value...",
    "Assessing marketability...",
    "Writing the verdict...",
  ],
  idle: [],
  done: [],
  error: [],
};

interface Props {
  step: LoadingStep;
}

export default function LoadingState({ step }: Props) {
  const [msgIndex, setMsgIndex] = useState(0);
  const messages = MESSAGES[step] ?? [];

  useEffect(() => {
    if (messages.length === 0) return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [step, messages.length]);

  if (!messages.length) return null;

  return (
    <div className="flex flex-col items-center gap-6 py-16">
      {/* Animated radar ring */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-2 border-accent/30 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-accent/60 animate-ping [animation-delay:0.3s]" />
        <div className="absolute inset-4 rounded-full border-2 border-accent animate-ping [animation-delay:0.6s]" />
        <div className="absolute inset-6 rounded-full bg-accent/20 flex items-center justify-center">
          <span className="text-accent text-xl">⚽</span>
        </div>
      </div>

      {/* Cycling message */}
      <div className="text-center">
        <p className="text-lg font-medium text-primary animate-pulse min-h-[28px]">
          {messages[msgIndex]}
        </p>
        <p className="text-sm text-muted mt-1">
          Claude AI is searching the web for live stats
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {messages.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i === msgIndex ? "bg-accent scale-125" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
