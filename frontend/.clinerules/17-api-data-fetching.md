---
description: "API and data fetching patterns with Axios — Active when working on API/service files"
globs: "src/api/**,src/services/**,src/infrastructure/**"
alwaysApply: false
---

# API & Data Fetching Patterns

## Axios Instance Setup

```typescript
// src/infrastructure/api/axiosInstance.ts
import axios, { AxiosInstance, AxiosError } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstance;
```

## Request Interceptors

```typescript
// Auth token interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

## Response Interceptors

```typescript
// Error handling interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<IApiError>) => {
    const status = error.response?.status;

    switch (status) {
      case 401:
        // Redirect to login or refresh token
        handleUnauthorized();
        break;
      case 403:
        // Show forbidden message
        handleForbidden();
        break;
      case 500:
        // Log and show generic error
        logger.error('Server error', error);
        break;
    }

    return Promise.reject(transformError(error));
  }
);
```

## Error Response Format

```typescript
// Standard API error interface
interface IApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
}

// Transform Axios error to app error
function transformError(error: AxiosError<IApiError>): IAppError {
  if (error.response) {
    return {
      type: 'api',
      status: error.response.status,
      message: error.response.data?.message ?? 'Server error',
      code: error.response.data?.code ?? 'UNKNOWN',
    };
  }

  if (error.request) {
    return {
      type: 'network',
      status: 0,
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  }

  return {
    type: 'client',
    status: 0,
    message: error.message,
    code: 'CLIENT_ERROR',
  };
}
```

## Repository Pattern

```typescript
// src/infrastructure/repositories/UserRepository.ts
import axiosInstance from 'infrastructure/api/axiosInstance';
import { IUserRepository } from 'domain/repositories/IUserRepository';
import { IUser } from 'domain/entities/User';

class UserRepository implements IUserRepository {
  private readonly basePath = '/api/users';

  async findById(id: string): Promise<IUser> {
    const response = await axiosInstance.get<IUser>(`${this.basePath}/${id}`);
    return response.data;
  }

  async findAll(params?: IUserQueryParams): Promise<IPaginatedResponse<IUser>> {
    const response = await axiosInstance.get<IPaginatedResponse<IUser>>(
      this.basePath,
      { params }
    );
    return response.data;
  }

  async create(data: ICreateUserDto): Promise<IUser> {
    const response = await axiosInstance.post<IUser>(this.basePath, data);
    return response.data;
  }

  async update(id: string, data: IUpdateUserDto): Promise<IUser> {
    const response = await axiosInstance.put<IUser>(
      `${this.basePath}/${id}`,
      data
    );
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`${this.basePath}/${id}`);
  }
}

export default new UserRepository();
```

## Request Cancellation

```typescript
// Cancel on component unmount
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get('/api/data', {
        signal: controller.signal,
      });
      setData(response.data);
    } catch (error) {
      if (!axios.isCancel(error)) {
        setError(error);
      }
    }
  };

  fetchData();
  return () => controller.abort();
}, []);
```

## Retry Mechanism

```typescript
// Simple retry wrapper
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw new Error('Max retries exceeded');
}
```

## API Endpoint Constants

```typescript
// src/constants/api.ts
export const API_ENDPOINTS = {
  USERS: '/api/users',
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  SETTINGS: '/api/settings',
} as const;
```
