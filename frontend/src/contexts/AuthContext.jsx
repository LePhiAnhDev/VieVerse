import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = "http://localhost:5000/api";

// Add request interceptor to include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        // Verify token is still valid
        verifyToken();
      } catch (error) {
        console.error("Error parsing user data:", error);
        logout();
      }
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.get("/auth/profile");
      setUser(response.data.user);
      setLoading(false);
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      toast.success("Đăng nhập thành công!", { id: "login-success" });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Đăng nhập thất bại";
      toast.error(message, { id: "login-error" });
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post("/auth/register", userData);

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      toast.success("Đăng ký thành công!", { id: "register-success" });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Đăng ký thất bại";
      toast.error(message, { id: "register-error" });
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Đăng xuất thành công!", { id: "logout-success" });
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put("/auth/profile", profileData);

      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success("Cập nhật hồ sơ thành công!", {
        id: "profile-update-success",
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Cập nhật hồ sơ thất bại";
      toast.error(message, { id: "profile-update-error" });
      return { success: false, error: message };
    }
  };

  const changePassword = async (passwordData) => {
    try {
      await axios.put("/auth/change-password", passwordData);
      toast.success("Đổi mật khẩu thành công!", {
        id: "password-change-success",
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Đổi mật khẩu thất bại";
      toast.error(message, { id: "password-change-error" });
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
