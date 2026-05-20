import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { env } from '@/config/env';

export const baseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers) => {
    // Attach auth token from localStorage / cookie when wired up.
    const token = localStorage.getItem('auth_token');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});
