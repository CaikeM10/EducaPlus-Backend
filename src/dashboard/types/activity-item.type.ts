export enum ActivityType {
  LEARNING_PATH_STARTED = 'LEARNING_PATH_STARTED',
  LEARNING_PATH_COMPLETED = 'LEARNING_PATH_COMPLETED',
  LESSON_PLAN_CREATED = 'LESSON_PLAN_CREATED',
  LESSON_PLAN_UPDATED = 'LESSON_PLAN_UPDATED',
  DIARY_CREATED = 'DIARY_CREATED',
  DIARY_UPDATED = 'DIARY_UPDATED',
}

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  occurredAt: Date;
  status: 'success' | 'info' | 'warning';
  entityId: string;
};
