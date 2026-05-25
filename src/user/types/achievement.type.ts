export enum AchievementType {
  FIRST_STEPS = 'FIRST_STEPS',
  DEDICATED_LEARNER = 'DEDICATED_LEARNER',
  PLANNING_MASTER = 'PLANNING_MASTER',
  REFLECTIVE_PROFESSIONAL = 'REFLECTIVE_PROFESSIONAL',
  KNOWLEDGE_SEEKER = 'KNOWLEDGE_SEEKER',
  MASTER_TEACHER = 'MASTER_TEACHER',
}

export type Achievement = {
  type: AchievementType;
  title: string;
  description: string;
  current: number;
  target: number;
  achieved: boolean;
};
