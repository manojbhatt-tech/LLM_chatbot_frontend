import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slice/userslice";

export const store = configureStore({
  reducer: {
    auth: userReducer, // 👈 renamed from admin → auth to match role-based
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// ✅ Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
