"use client";

import { Volume2, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Status = "idle" | "playing" | "paused";

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\n{2,}/g, ". ")
    .trim();
}

export default function ListenButton({ text }: { text: string }) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const supported =
    mounted && typeof window !== "undefined" && "speechSynthesis" in window;

  const handleClick = () => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    if (status === "playing") {
      synth.pause();
      setStatus("paused");
      return;
    }
    if (status === "paused") {
      synth.resume();
      setStatus("playing");
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(stripMarkdown(text));
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    const enVoice = synth.getVoices().find((v) => v.lang.startsWith("en"));
    if (enVoice) utterance.voice = enVoice;
    utterance.onend = () => setStatus("idle");
    utterance.onerror = () => setStatus("idle");
    utteranceRef.current = utterance;
    synth.speak(utterance);
    setStatus("playing");
  };

  const Icon = status === "playing" ? Pause : status === "paused" ? Play : Volume2;
  const label =
    status === "playing" ? "일시정지" : status === "paused" ? "이어 듣기" : "듣기";
  const active = status !== "idle";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!supported}
      aria-label={label}
      className={`inline-flex items-center justify-center w-9 h-9 rounded-full border ${
        active
          ? "bg-neutral-900 text-white border-neutral-900"
          : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
      } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      <Icon size={16} />
    </button>
  );
}
