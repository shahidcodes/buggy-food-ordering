import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useRouter } from "next/router";

interface User {
  _id: string;
  name: string;
  email: string;
  addresses: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
  }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Bug 1: Doesn't properly handle token expiration
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Try to get the token from localStorage
        const token = localStorage.getItem("auth_token");

        if (token) {
          // Bug 2: Doesn't validate token format before using it
          const response = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setUser(response.data.user);
        }
      } catch (err) {
        // Bug 3: Doesn't clear invalid token on 401 errors
        console.error("Error checking authentication status:", err);
        // Should clear token and state here, but doesn't
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/auth/login", { email, password });

      // Bug 4: Token is stored insecurely and without expiration check
      localStorage.setItem("auth_token", response.data.token);

      setUser(response.data.user);
      router.push("/");
    } catch (error: unknown) {
      // Bug 5: Generic error messages that don't distinguish between different failure reasons
      setError("Invalid credentials. Please try again.");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });

      // Bug 6: Automatically logs in user without email verification
      localStorage.setItem("auth_token", response.data.token);

      setUser(response.data.user);
      router.push("/");
    } catch (error: unknown) {
      // Bug 7: Doesn't handle duplicate email errors with specific messages
      setError("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Bug 8: Doesn't invalidate the token on the server side
    localStorage.removeItem("auth_token");
    setUser(null);
    router.push("/signin");
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
