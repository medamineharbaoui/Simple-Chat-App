import { ReactNode, createContext, useEffect, useState } from "react";
import { User, UserAuthApiResponse, UserLoggedInApiResponse } from "../types";
import useApi from "../hooks/useApi";

interface AuthContextProviderProps {
  children?: ReactNode;
}

interface AuthContextProps {
  authenticated: boolean;
  user: User; // User object with userId and userName
  login(userName: string, userPassword: string): void;
  logout(): void;
  checkUserIsLoggedInOnServer(apiResponse: any): void;
  lastApiResponse: string;
}

const INITIAL_VALUES = {
  authenticated: false,
  user: { userName: "", userId: -1 },
  login: () => {},
  logout: () => {},
  checkUserIsLoggedInOnServer: () => {},
  lastApiResponse: "",
};

export const AuthContext = createContext<AuthContextProps>(INITIAL_VALUES);

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState(INITIAL_VALUES.user);
  const [lastApiResponse, setLastApiResponse] = useState(
    INITIAL_VALUES.lastApiResponse
  );
  const [authenticated, setAuthenticated] = useState(
    INITIAL_VALUES.authenticated
  );

  const { data: authData, handleFetch: handleFetchAuth } =
    useApi<UserAuthApiResponse>();

  const login = (userName: string, userPassword: string) => {
    handleFetchAuth({
      url: "/api/users/login/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userName, userPassword }),
    });
  };

  const checkUserIsLoggedInOnServer = (apiResponse: any) => {
    if (apiResponse) {
      if ("loggedIn" in apiResponse) {
        if (!(apiResponse as UserLoggedInApiResponse).loggedIn) {
          setAuthenticated(false);
          setUser(INITIAL_VALUES.user);
        }
      }
    }
  };

  const logout = async () => {
    try {
      await handleFetchAuth({
        url: "/api/users/logout/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Clear user session and reset authentication state
      setAuthenticated(false);
      setUser(INITIAL_VALUES.user);
      setLastApiResponse("Logged out successfully.");
    } catch (error) {
      // Handle error if the logout request fails
      console.error("Logout failed", error);
      setLastApiResponse("Logout failed");
    }
  };

  useEffect(() => {
    handleFetchAuth({
      url: "/api/users/user",
      method: "GET",
    });
  }, []);

  useEffect(() => {
    if (authData) {
      if (authData.loggedIn) {
        setAuthenticated(authData.loggedIn);
        setUser({ userId: authData.userId, userName: authData.userName }); // Store userId and userName
      } else {
        setAuthenticated(authData.loggedIn);
        setUser(INITIAL_VALUES.user);
      }
      setLastApiResponse(JSON.stringify(authData));
    }
  }, [authData]);

  return (
    <AuthContext.Provider
      value={{
        authenticated,
        user, // This contains userId and userName
        login,
        logout,
        checkUserIsLoggedInOnServer,
        lastApiResponse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
