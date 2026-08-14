const getHost = (): string => {
  if (typeof location !== 'undefined' && location.hostname) {
    return location.hostname;
  }
  if (typeof self !== 'undefined' && self.location && self.location.hostname) {
    return self.location.hostname;
  }
  if (
    typeof window !== 'undefined' &&
    window.location &&
    window.location.hostname
  ) {
    return window.location.hostname;
  }
  return '';
};

const host = getHost();
const isTunnelDomain =
  host.includes('smkalazharsempu.sch.id') ||
  (typeof process !== 'undefined' && process.env.NODE_ENV === 'production');

export const API_BASE_URL = isTunnelDomain
  ? 'https://api-lms.smkalazharsempu.sch.id/api/v1'
  : 'http://localhost:3001/api/v1';

export const WS_BASE_URL = isTunnelDomain
  ? 'wss://api-lms.smkalazharsempu.sch.id/api/v1'
  : 'ws://localhost:3001/api/v1';

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  ME: '/auth/me',
  CHANGE_PASSWORD: '/auth/change-password',
  UPDATE_PROFILE: '/auth/profile',
  LOGOUT: '/auth/logout',

  // Classes
  CLASSES: '/classes',
  JOIN_CLASS: '/classes/join',

  // Forum & Reactions
  FORUM_POSTS: (classId: string) => `/classes/${classId}/forum`,
  FORUM_COMMENTS: (postId: string) => `/forum/posts/${postId}/comments`,
  REACTIONS: '/reactions',
  REACTIONS_SUMMARY: '/reactions/summary',
  REACTIONS_ACTORS: '/reactions/actors',

  // Quizzes & Assignments
  QUIZZES: (classId: string) => `/classes/${classId}/quizzes`,
  MATERIALS: (classId: string) => `/classes/${classId}/materials`,
  ASSIGNMENTS: (classId: string) => `/classes/${classId}/assignments`,

  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_UNREAD: '/notifications/unread-count',
  NOTIFICATIONS_READ_ALL: '/notifications/read-all',

  // Dashboard
  DASHBOARD_SUMMARY: '/dashboard/summary',
  GRADE_HISTORY: '/me/grade-history',
};
