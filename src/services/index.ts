export * from './storage';
export * from './client';
export * from './auth.service';
export * from './class.service';
export * from './material.service';
export * from './assignment.service';
export * from './quiz.service';
export * from './forum.service';
export * from './grade.service';
export * from './dashboard.service';
export * from './notification.service';

import { authService } from './auth.service';
import { classService } from './class.service';
import { materialService } from './material.service';
import { assignmentService } from './assignment.service';
import { quizService } from './quiz.service';
import { forumService } from './forum.service';
import { gradeService } from './grade.service';
import { dashboardService } from './dashboard.service';
import { notificationService } from './notification.service';

// Unified facade object preserving original `api` interface
export const api = {
  ...authService,
  ...classService,
  ...materialService,
  ...assignmentService,
  ...quizService,
  ...forumService,
  ...gradeService,
  ...dashboardService,
  ...notificationService,
};

export default api;
