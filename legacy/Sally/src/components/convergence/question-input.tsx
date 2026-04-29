"use client";

import { useEffect, useRef } from "react";
import type { ConvergenceQuestion } from "@/lib/convergence-questions";
import * as Slider from "@radix-ui/react-slider";

interface Props {
  question: ConvergenceQuestion;
  value: string | number | undefined;
  onChange: (value: string | number) => void;
}

export function ConvergenceQuestionInput({ question, value, onChange }: Props) {
  const scaleInitialized = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (question.type === "scale" && (value === undefined || value === "")) {
      const max = question.scaleMax ?? 10;
      if (!scaleInitialized.current.has(question.id)) {
        scaleInitialized.current.add(question.id);
        onChange(Math.ceil(max / 2));
      }
    }
  }, [question.id, question.type, question.scaleMax, value, onChange]);

  switch (question.type) {
    case "text":
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="w-full px-4 py-3 rounded-lg border border-heritage-300 bg-white text-heritage-800 placeholder:text-heritage-400 focus:outline-none focus:ring-2 focus:ring-heritage-500/40 focus:border-heritage-500"
        />
      );

    case "textarea":
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          rows={4}
          className="w-full px-4 py-3 rounded-lg border border-heritage-300 bg-white text-heritage-800 placeholder:text-heritage-400 focus:outline-none focus:ring-2 focus:ring-heritage-500/40 focus:border-heritage-500 resize-none"
        />
      );

    case "scale": {
      const max = question.scaleMax ?? 10;
      const numValue = typeof value === "number" ? value : (value ? parseInt(String(value), 10) : undefined);
      const displayValue = numValue ?? Math.ceil(max / 2);

      return (
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-heritage-500">
            {question.scaleLabels && (
              <>
                <span>{question.scaleLabels.min}</span>
                <span>{question.scaleLabels.max}</span>
              </>
            )}
          </div>
          <Slider.Root
            value={[displayValue]}
            onValueChange={([v]) => onChange(v)}
            max={max}
            step={1}
            className="relative flex w-full touch-none select-none items-center"
          >
            <Slider.Track className="relative h-2 w-full grow rounded-full bg-heritage-200">
              <Slider.Range className="absolute h-full rounded-full bg-heritage-500" />
            </Slider.Track>
            <Slider.Thumb className="block h-5 w-5 rounded-full bg-heritage-600 shadow-md hover:bg-heritage-700 focus:outline-none focus:ring-2 focus:ring-heritage-500/50" />
          </Slider.Root>
          <p className="text-center text-sm text-heritage-500">{displayValue}</p>
        </div>
      );
    }

    case "select":
      return (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-heritage-300 bg-white text-heritage-800 focus:outline-none focus:ring-2 focus:ring-heritage-500/40 focus:border-heritage-500"
        >
          <option value="">Choose…</option>
          {question.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    default:
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          className="w-full px-4 py-3 rounded-lg border border-heritage-300 bg-white text-heritage-800 placeholder:text-heritage-400 focus:outline-none focus:ring-2 focus:ring-heritage-500/40 focus:border-heritage-500"
        />
      );
  }
}
