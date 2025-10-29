import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginUser,
  logoutUser,
  registerUser,
  fetchUserProfile,
  setAuthChecked,
  clearError,
} from "../store/slice/userslice";
import { useCallback, useRef } from "react";
import { RootState, AppDispatch } from "../store";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const profileFetchRef = useRef(false);

  const { loading, error, isLoggedIn, authChecked, data } = useSelector(
    (state: RootState) => state.auth
  );

  // ✅ Signup
  const signup = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    try {
      dispatch(clearError());
      const response = await dispatch(
        registerUser({ username, email, password, confirmPassword })
      ).unwrap();

      if (response) {
        await dispatch(fetchUserProfile()).unwrap();
        navigate("/");
      }
    } catch (err) {
      console.error("Signup failed:", err);
      throw err;
    }
  };

  // ✅ Login
  const login = async (email: string, password: string) => {
    try {
      dispatch(clearError());
      const response = await dispatch(loginUser({ email, password })).unwrap();

      if (response) {
        await dispatch(fetchUserProfile()).unwrap();
        navigate("/");
      }
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  // ✅ Logout
  const logout = async (force = false) => {
    try {
      if (!force) {
        await dispatch(logoutUser()).unwrap();
      } else {
        dispatch(logoutUser());
      }
      profileFetchRef.current = false;
      navigate("/login");
    } catch (err) {
      dispatch(logoutUser());
      profileFetchRef.current = false;
      navigate("/login");
    }
  };

  // ✅ Check auth on page load
  const checkAuth = useCallback(async () => {
    if (authChecked || profileFetchRef.current) return;

    const storedLoginStatus = localStorage.getItem("isLoggedIn");
    if (storedLoginStatus !== "true") {
      dispatch(setAuthChecked(true));
      return;
    }

    profileFetchRef.current = true;
    try {
      await dispatch(fetchUserProfile()).unwrap();
    } catch (err: any) {
      const isTokenExpired =
        err?.status === 401 ||
        err?.status === 403 ||
        err?.message?.toLowerCase().includes("unauthorized") ||
        err?.message?.toLowerCase().includes("expired");

      if (isTokenExpired) {
        await logout(true);
      }
    } finally {
      profileFetchRef.current = false;
      dispatch(setAuthChecked(true));
    }
  }, [authChecked, dispatch]);

  return {
    isLoggedIn,
    loading,
    error,
    authChecked,
    data, // contains role, email, username
    login,
    signup,
    logout,
    checkAuth,
  };
};
