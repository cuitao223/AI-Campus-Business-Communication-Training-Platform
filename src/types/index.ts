export type OpponentStyle = "friendly" | "skeptical" | "price_pressure" | "dominant";
export type Difficulty = "easy" | "normal" | "hard";

export type ScoringLabels = {
  valueExpression: string;
  dataPersuasion: string;
  riskAwareness: string;
  bottomLineControl: string;
  professionalism: string;
  dealProbability: string;
};

export type ExampleCase = {
  id: string;
  title: string;
  userRole: string;
  aiRole: string;
  goal: string;
  bottomLine: string;
  opponentStyle: OpponentStyle;
  difficulty: Difficulty;
  openingMessage: string;
};

export type Scenario = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  trainingAbilities: string[];
  digitalEconomyTags: string[];
  userRoles: string[];
  aiRoles: string[];
  defaultGoals: string[];
  defaultBottomLines: string[];
  exampleCases: ExampleCase[];
  scoringLabels: ScoringLabels;
  riskKeywords: string[];
  economyExplanation: string;
};

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type Scores = {
  valueExpression: number;
  dataPersuasion: number;
  riskAwareness: number;
  bottomLineControl: number;
  professionalism: number;
  dealProbability: number;
};

export type TrainingSession = {
  id: string;
  scenarioId: string;
  userRole: string;
  aiRole: string;
  goal: string;
  bottomLine: string;
  opponentStyle: OpponentStyle;
  difficulty: Difficulty;
  realtimeHint: boolean;
  strictScoring: boolean;
  messages: Message[];
  scores: Scores;
  risks: string[];
  hints: string[];
  stage: "opening" | "probing" | "bargaining" | "closing" | "ended";
  dealStatus: "not_yet" | "likely" | "unlikely" | "reached" | "failed";
  createdAt: number;
  updatedAt: number;
};

export type Report = {
  summary: string;
  result: { dealStatus: string; dealProbability: number };
  strengths: string[];
  weaknesses: string[];
  riskWarnings: string[];
  improvementSuggestions: string[];
  betterReplyExample: string;
  digitalEconomyExplanation: string;
  nextPracticeSuggestion: string;
};
