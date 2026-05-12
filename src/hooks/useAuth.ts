import { storage } from "@/src/services/storage";
import { useEffect, useState } from "react";

export const useAuth = () => {
  const [authState, setAuthState] = useState({
    isSignedIn: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const bootstrapAsync = async () => {
      try {
        const token = await storage.getItem("userToken");
        setAuthState({
          isSignedIn: !!token,
          user: token ? JSON.parse(token) : null,
        });
      } catch (e) {
        console.error("Auth bootstrap error:", e);
        setAuthState({
          isSignedIn: false,
          user: null,
        });
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  return { authState, isLoading };
};
