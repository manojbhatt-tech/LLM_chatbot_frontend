import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import AxiosHelper from "../../helpers/axiosHelper";

const userRegisterPath = "/auth/register";
const userLoginPath = "/auth/login";
const userLogoutPath = "/auth/logout";
const userProfilePath = "/auth/me";

interface UserData {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin";
}

interface AuthState {
  data: UserData | null;
  isLoggedIn: boolean;
  authChecked: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  data: null,
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
  authChecked: false,
  loading: false,
  error: null,
};

// ✅ Register user
export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    credentials: {
      username: string;
      email: string;
      password: string;
      confirmPassword: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await AxiosHelper.postData(
        userRegisterPath,
        credentials
      );

      if (response.data?.user) {
        const user = response.data.user;
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", user.role || "user");
        localStorage.setItem("email", user.email);
        localStorage.setItem("username", user.username);
      }
      return response.data.user;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || "Signup failed",
        status: error.response?.status,
      });
    }
  }
);

// ✅ Login user
export const loginUser = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await AxiosHelper.postData(userLoginPath, credentials);

      if (response.data?.user) {
        const user = response.data.user;
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", user.role || "user");
        localStorage.setItem("email", user.email);
        localStorage.setItem("username", user.username);
      }

      return response.data.user;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || "Login failed",
        status: error.response?.status,
      });
    }
  }
);

// ✅ Logout
export const logoutUser = createAsyncThunk("auth/logout", async () => {
  try {
    await AxiosHelper.postData(userLogoutPath, {});
  } catch (err) {
    console.log("Logout API failed, but proceeding...");
  }

  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("username");

  return null;
});

// ✅ Fetch profile
export const fetchUserProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await AxiosHelper.getData(userProfilePath);
      const user = response.data?.data;
      console.log("users data: ", user);
      if (user) {
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("role", user.role || "user");
        localStorage.setItem("email", user.email);
        localStorage.setItem("username", user.username);
      }
      return user;
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.clear();
      }
      return rejectWithValue({
        message: error.response?.data?.message || "Profile fetch failed",
        status: error.response?.status,
      });
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthChecked: (state, action: PayloadAction<boolean>) => {
      state.authChecked = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: () => ({
      ...initialState,
      isLoggedIn: false,
      authChecked: true,
    }),
    syncAuthFromStorage: (state) => {
      state.isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const role = localStorage.getItem("role") as "user" | "admin" | null;
      state.data = role
        ? {
            id: "",
            username: localStorage.getItem("username") || "",
            email: localStorage.getItem("email") || "",
            role,
          }
        : null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.data = action.payload;
      })
      .addCase(registerUser.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || "Signup failed";
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.data = action.payload;
      })
      .addCase(loginUser.rejected, (state, action: any) => {
        state.loading = false;
        state.isLoggedIn = false;
        state.error = action.payload?.message || "Login failed";
      })

      // Logout
      .addCase(logoutUser.fulfilled, () => ({
        ...initialState,
        isLoggedIn: false,
        authChecked: true,
      }))

      // Fetch Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || "Profile fetch failed";
        state.isLoggedIn = false;
      });
  },
});

export const { setAuthChecked, clearError, resetAuth, syncAuthFromStorage } =
  authSlice.actions;
export default authSlice.reducer;
