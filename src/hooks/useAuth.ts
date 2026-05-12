import { useEffect, useState } from "react";
import { storage } from "../services/storage";

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
        // Timeout 3 detik untuk storage check - lebih cepat
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn("Auth bootstrap timeout - proceeding without token");
            resolve(null);
          }, 3000);
        });

        const storagePromise = storage.getItem("userToken");
        const token = await Promise.race([storagePromise, timeoutPromise]);

        if (token) {
          try {
            const user = JSON.parse(token);
            setAuthState({
              isSignedIn: true,
              user,
            });
          } catch (parseErr) {
            console.warn("Failed to parse token:", parseErr);
            setAuthState({
              isSignedIn: false,
              user: null,
            });
          }
        } else {
          setAuthState({
            isSignedIn: false,
            user: null,
          });
        }
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
