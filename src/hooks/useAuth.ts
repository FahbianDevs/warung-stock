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
        // Tambah timeout 5 detik untuk mencegah loading infinite
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.warn(
              "Storage access timeout - defaulting to not signed in",
            );
            resolve(null);
          }, 5000);
        });

        const storagePromise = storage.getItem("userToken");
        const token = await Promise.race([storagePromise, timeoutPromise]);

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
