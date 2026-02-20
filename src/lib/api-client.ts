'use client';

// API Client for frontend to interact with backend

const API_BASE = '/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  [key: string]: any;
}

async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Include cookies
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'An error occurred',
      };
    }

    return {
      success: true,
      ...data,
    };
  } catch (error) {
    console.error('API call error:', error);
    return {
      success: false,
      error: 'Network error',
    };
  }
}

// Authentication APIs
export const authApi = {
  signup: (data: {
    username: string;
    password: string;
    email?: string;
    deviceFingerprint: string;
    avatarGradient?: string;
    displayName?: string;
  }) => apiCall('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  login: (data: { username: string; password: string }) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiCall('/auth/logout', {
      method: 'POST',
    }),

  me: () => apiCall('/auth/me'),
};

// Posts APIs
export const postsApi = {
  create: (data: {
    content: string;
    type?: string;
    voiceUrl?: string;
    waveform?: number[];
    duration?: string;
  }) =>
    apiCall('/posts/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  feed: (page = 1, limit = 20) =>
    apiCall(`/posts/feed?page=${page}&limit=${limit}`),

  like: (postId: string) =>
    apiCall('/posts/like', {
      method: 'POST',
      body: JSON.stringify({ postId }),
    }),

  comment: (data: { postId: string; content: string; parentId?: string }) =>
    apiCall('/posts/comment', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getComments: (postId: string) =>
    apiCall(`/posts/comment?postId=${postId}`),

  save: (postId: string) =>
    apiCall('/posts/save', {
      method: 'POST',
      body: JSON.stringify({ postId }),
    }),

  getSaved: () => apiCall('/posts/save'),

  report: (data: { postId?: string; userId?: string; reason?: string }) =>
    apiCall('/posts/report', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Messages APIs
export const messagesApi = {
  send: (data: {
    recipientId?: string;
    roomId?: string;
    content?: string;
    type?: string;
    voiceUrl?: string;
    waveform?: number[];
    duration?: string;
  }) =>
    apiCall('/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  fetch: (params: { recipientId?: string; roomId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/messages/fetch?${query}`);
  },

  conversations: () => apiCall('/messages/conversations'),
};

// Rooms APIs
export const roomsApi = {
  create: (data: { name: string; type?: string }) =>
    apiCall('/rooms/create', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  join: (data: { roomId: string; password?: string }) =>
    apiCall('/rooms/join', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  leave: (roomId: string) =>
    apiCall('/rooms/leave', {
      method: 'POST',
      body: JSON.stringify({ roomId }),
    }),

  list: (type?: 'public' | 'private' | 'my') => {
    const query = type ? `?type=${type}` : '';
    return apiCall(`/rooms/list${query}`);
  },
};

// Users APIs
export const usersApi = {
  getProfile: (params: { userId?: string; username?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiCall(`/users/profile?${query}`);
  },

  updateProfile: (data: {
    displayName?: string;
    bio?: string;
    moodTag?: string;
    avatarGradient?: string;
  }) =>
    apiCall('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  follow: (userId: string) =>
    apiCall('/users/follow', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  getPosts: (userId: string) =>
    apiCall(`/users/posts?userId=${userId}`),
};

// Upload APIs
export const uploadApi = {
  voice: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload/voice`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    return response.json();
  },

  avatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/upload/avatar`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    return response.json();
  },
};

// Notifications APIs
export const notificationsApi = {
  get: () => apiCall('/notifications'),

  markAsRead: (notificationId: string) =>
    apiCall('/notifications', {
      method: 'PUT',
      body: JSON.stringify({ notificationId }),
    }),

  markAllAsRead: () =>
    apiCall('/notifications', {
      method: 'PUT',
      body: JSON.stringify({ markAllAsRead: true }),
    }),
};

// AI Chat API
export const aiChatApi = {
  send: (data: { message: string; conversationHistory?: any[] }) =>
    apiCall('/ai-chat', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
