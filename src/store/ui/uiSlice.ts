import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarCollapsed: boolean;
  // theme, density, language, etc. land here later
}

const initialState: UiState = {
  sidebarCollapsed: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const { setSidebarCollapsed } = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
