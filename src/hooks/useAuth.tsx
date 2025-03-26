/*
Changes:
  -- Changed the token storage from localStorage to Cookies with 1 hour of expiration
  -- Added a new function to clear the token when the user logs out
  -- Added Toast on logout
*/

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import Cookies from 'js-cookie'

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

  
  useEffect(() => {
    const checkUser = async () => {
      try {
        
        // const token = localstorage.getItem("auth_token");
        const token = Cookies.get("auth_token");

        if (token) {
          
          const response = await axios.get("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setUser(response.data.user);
        }
      } catch (err) {
        
        console.error("Error checking authentication status:", err);
        
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

      
      // localStorage.setItem("auth_token", response.data.token);
      Cookies.set('auth_token', 'fakeToken', { expires: 1 / 24, path: "/" }) // set cookie for 1 hour

      setUser(response.data.user);
      router.push("/");
    } catch (error: unknown) {
      
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

      
      localStorage.setItem("auth_token", response.data.token);

      setUser(response.data.user);
      router.push("/");
    } catch (error: unknown) {
      
      setError("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    
    // localStorage.removeItem("auth_token");
    Cookies.remove('auth_token')
    setUser(null);
    router.push("/signin");
    toast.success("Logged out successfully");
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
