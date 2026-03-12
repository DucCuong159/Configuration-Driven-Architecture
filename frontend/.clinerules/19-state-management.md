---
description: "Redux Toolkit state management patterns — Active when working on store files"
globs: "src/store/**,src/slices/**"
alwaysApply: false
---

# State Management (Redux Toolkit)

## Slice Structure

```typescript
// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// 1. Define state interface
interface IUserState {
  list: IUser[];
  selected: IUser | null;
  loading: boolean;
  error: string | null;
}

// 2. Define initial state
const initialState: IUserState = {
  list: [],
  selected: null,
  loading: false,
  error: null,
};

// 3. Create async thunks
export const fetchUsers = createAsyncThunk(
  'user/fetchAll',
  async (params: IUserQueryParams, { rejectWithValue }) => {
    try {
      const response = await userRepository.findAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(transformError(error));
    }
  }
);

// 4. Create slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    selectUser: (state, action: PayloadAction<IUser>) => {
      state.selected = action.payload;
    },
    clearSelection: (state) => {
      state.selected = null;
    },
    resetState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// 5. Export actions and reducer
export const { selectUser, clearSelection, resetState } = userSlice.actions;
export default userSlice.reducer;
```

## Store Configuration

```typescript
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import settingsReducer from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: true,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

## Typed Hooks

```typescript
// src/store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// ✅ Always use these typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

## Memoized Selectors

```typescript
// src/store/selectors/userSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'store';

// Base selector
const selectUserState = (state: RootState) => state.user;

// ✅ Memoized derived selectors
export const selectUserList = createSelector(
  [selectUserState],
  (userState) => userState.list
);

export const selectActiveUsers = createSelector(
  [selectUserList],
  (users) => users.filter(u => u.isActive)
);

export const selectUserById = createSelector(
  [selectUserList, (_state: RootState, userId: string) => userId],
  (users, userId) => users.find(u => u.id === userId) ?? null
);

export const selectUserLoading = createSelector(
  [selectUserState],
  (userState) => userState.loading
);
```

## Local vs Global State

| Use Redux (Global) | Use useState (Local) |
|---------------------|---------------------|
| Shared across pages/components | Single component only |
| Server data (API responses) | Form input values |
| Auth state, user session | UI toggles (modal, dropdown) |
| App-wide settings | Animations, hover states |
| Data that survives navigation | Temporary/transient state |

## Async Thunk Patterns

### With Error Handling
```typescript
export const createUser = createAsyncThunk(
  'user/create',
  async (dto: ICreateUserDto, { rejectWithValue }) => {
    try {
      const user = await userRepository.create(dto);
      return user;
    } catch (error) {
      return rejectWithValue(transformError(error));
    }
  }
);
```

### With Conditional Dispatch
```typescript
export const fetchUsersIfNeeded = createAsyncThunk(
  'user/fetchIfNeeded',
  async (_, { getState, dispatch }) => {
    const state = getState() as RootState;
    if (state.user.list.length === 0) {
      return dispatch(fetchUsers({})).unwrap();
    }
  }
);
```

## Rules
- **One slice per feature/domain** — Don't mix concerns
- **Always use Immer** (built into RTK) — Mutate state directly in reducers
- **Reset state on logout** — Dispatch `resetState` for each slice
- **Never access store outside React** — Use hooks, not `store.getState()`
- **Normalize nested data** — Use `createEntityAdapter` for collections
