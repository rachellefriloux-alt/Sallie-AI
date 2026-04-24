/**
 * Great Convergence: Phase 1 of Genesis (onboarding).
 * 30-question questionnaire; categories: identity, values, goals, fears, communication, learning.
 */

export type QuestionCategory =
  | "identity"
  | "values"
  | "goals"
  | "fears"
  | "communication"
  | "learning";

export interface ConvergenceQuestion {
  id: string;
  category: QuestionCategory;
  question: string;
  placeholder?: string;
  type: "text" | "textarea" | "scale" | "select" | "multi";
  options?: string[];
  scaleMax?: number;
  scaleLabels?: { min: string; max: string };
}

export const CONVERGENCE_QUESTIONS: ConvergenceQuestion[] = [
  // Identity (5)
  {
    id: "identity_1",
    category: "identity",
    question: "How would you describe yourself in three words?",
    type: "text",
    placeholder: "e.g., curious, resilient, creative",
  },
  {
    id: "identity_2",
    category: "identity",
    question: "What role do you play in your family or community?",
    type: "text",
    placeholder: "e.g., mentor, caretaker, pioneer",
  },
  {
    id: "identity_3",
    category: "identity",
    question: "What's a story about your roots that matters to you?",
    type: "textarea",
    placeholder: "A moment, person, or place that shaped who you are",
  },
  {
    id: "identity_4",
    category: "identity",
    question: "What trait do you hope others see in you?",
    type: "text",
    placeholder: "e.g., integrity, warmth, clarity",
  },
  {
    id: "identity_5",
    category: "identity",
    question: "When do you feel most yourself?",
    type: "textarea",
    placeholder: "Describe the context or activity",
  },
  // Values (5)
  {
    id: "values_1",
    category: "values",
    question: "What do you value most in a relationship?",
    type: "text",
    placeholder: "e.g., honesty, presence, growth",
  },
  {
    id: "values_2",
    category: "values",
    question: "What principle would you never compromise?",
    type: "text",
    placeholder: "Your non-negotiable",
  },
  {
    id: "values_3",
    category: "values",
    question: "What do you want to protect or preserve?",
    type: "textarea",
    placeholder: "People, places, traditions, beliefs",
  },
  {
    id: "values_4",
    category: "values",
    question: "How important is tradition vs. innovation to you?",
    type: "scale",
    scaleMax: 10,
    scaleLabels: { min: "Tradition anchors me", max: "Innovation drives me" },
  },
  {
    id: "values_5",
    category: "values",
    question: "What does legacy mean to you?",
    type: "textarea",
    placeholder: "What you hope to leave behind",
  },
  // Goals (5)
  {
    id: "goals_1",
    category: "goals",
    question: "What do you want to achieve in the next year?",
    type: "textarea",
    placeholder: "One or two main goals",
  },
  {
    id: "goals_2",
    category: "goals",
    question: "What do you want to achieve in the next five years?",
    type: "textarea",
    placeholder: "A longer vision",
  },
  {
    id: "goals_3",
    category: "goals",
    question: "What would make you feel you've 'made it'?",
    type: "text",
    placeholder: "Your definition of success",
  },
  {
    id: "goals_4",
    category: "goals",
    question: "What skill or knowledge are you actively building?",
    type: "text",
    placeholder: "e.g., leadership, writing, empathy",
  },
  {
    id: "goals_5",
    category: "goals",
    question: "Who do you want to become?",
    type: "textarea",
    placeholder: "The person you're growing into",
  },
  // Fears (5)
  {
    id: "fears_1",
    category: "fears",
    question: "What keeps you up at night?",
    type: "textarea",
    placeholder: "Worries or uncertainties",
  },
  {
    id: "fears_2",
    category: "fears",
    question: "What would you regret not trying?",
    type: "text",
    placeholder: "One thing",
  },
  {
    id: "fears_3",
    category: "fears",
    question: "What makes you feel vulnerable?",
    type: "textarea",
    placeholder: "Situations or topics",
  },
  {
    id: "fears_4",
    category: "fears",
    question: "How do you handle uncertainty?",
    type: "select",
    options: [
      "I lean into it and explore",
      "I plan and prepare",
      "I seek support from others",
      "I take small steps",
      "I avoid it when possible",
    ],
  },
  {
    id: "fears_5",
    category: "fears",
    question: "What would you do if you knew you couldn't fail?",
    type: "text",
    placeholder: "A dream or leap",
  },
  // Communication (5)
  {
    id: "communication_1",
    category: "communication",
    question: "How do you prefer to receive feedback?",
    type: "select",
    options: [
      "Direct and honest",
      "Gentle and supportive",
      "Written first, then discussed",
      "With examples and specifics",
      "In private, one-on-one",
    ],
  },
  {
    id: "communication_2",
    category: "communication",
    question: "What tone resonates with you?",
    type: "select",
    options: [
      "Warm and encouraging",
      "Clear and direct",
      "Playful and light",
      "Thoughtful and considered",
      "Challenging and provocative",
    ],
  },
  {
    id: "communication_3",
    category: "communication",
    question: "How do you like to process ideas?",
    type: "select",
    options: [
      "Talking through them",
      "Writing them down",
      "Visualizing or sketching",
      "Sleeping on it",
      "Discussing with others",
    ],
  },
  {
    id: "communication_4",
    category: "communication",
    question: "What annoys you in conversations?",
    type: "text",
    placeholder: "e.g., rushing, jargon, assumptions",
  },
  {
    id: "communication_5",
    category: "communication",
    question: "How often do you want Sallie to check in?",
    type: "select",
    options: [
      "Only when I initiate",
      "Once a day",
      "A few times a week",
      "When I seem stuck",
      "Proactively when relevant",
    ],
  },
  // Learning (5)
  {
    id: "learning_1",
    category: "learning",
    question: "How do you learn best?",
    type: "select",
    options: [
      "By doing and trying",
      "By reading and reflecting",
      "By watching or listening",
      "Through discussion",
      "Through structured courses",
    ],
  },
  {
    id: "learning_2",
    category: "learning",
    question: "What format do you prefer for new concepts?",
    type: "select",
    options: [
      "Step-by-step guides",
      "Examples and stories",
      "Visual diagrams",
      "Analogies and metaphors",
      "Questions and exploration",
    ],
  },
  {
    id: "learning_3",
    category: "learning",
    question: "How much detail do you want?",
    type: "scale",
    scaleMax: 10,
    scaleLabels: { min: "High-level overview", max: "Deep dive" },
  },
  {
    id: "learning_4",
    category: "learning",
    question: "What distracts you when you're trying to focus?",
    type: "text",
    placeholder: "e.g., noise, notifications, clutter",
  },
  {
    id: "learning_5",
    category: "learning",
    question: "What would make Sallie's guidance feel most useful?",
    type: "textarea",
    placeholder: "How we can best support your growth",
  },
];

export const CATEGORY_LABELS: Record<QuestionCategory, string> = {
  identity: "Identity",
  values: "Values",
  goals: "Goals",
  fears: "Fears",
  communication: "Communication",
  learning: "Learning",
};

export const CATEGORY_ORDER: QuestionCategory[] = [
  "identity",
  "values",
  "goals",
  "fears",
  "communication",
  "learning",
];
