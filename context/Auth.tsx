import React, { createContext, useContext, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError } from 'axios';

export enum Role {
  USER = 'user',
  RETAILER = 'retailer',
  MANUFACTURER = 'manufacturer'
}

interface AuthState {
  authenticated: boolean | null;
  username: string | null;
  role: Role | null;
  error: string | null;
  attemptedLogin: boolean; // New flag to indicate login attempt
}

interface AuthProps {
  authState: AuthState;
  onLogin: (username: string, password: string, role: Role) => Promise<void>;
  onLogout: () => void;
}

const AuthContext = createContext<AuthProps>({
  authState: { authenticated: null, username: null, role: null, error: null, attemptedLogin: false },
  onLogin: async () => { throw new Error("Login function is not available") },
  onLogout: () => {}
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: null,
    username: null,
    role: null,
    error: null,
    attemptedLogin: false
  });

  const login = async (username: string, password: string, role: Role) => {
    let loginEndpoint = '';
    switch (role) {
      case Role.USER:
        loginEndpoint = `${process.env.EXPO_BACKEND}/api/users/login`;
        break;
      case Role.RETAILER:
        loginEndpoint = `${process.env.EXPO_BACKEND}/api/retailer/login`;
        break;
      case Role.MANUFACTURER:
        loginEndpoint = `${process.env.EXPO_BACKEND}/api/manufacturer/login`;
        break;
    }

    try {
      const response = await axios.post(loginEndpoint, { email: username, password }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        const token = response.data.token;
        const userId = response.data.id;
        const userRole = response.data.role;

        if (token && userId) {
          await AsyncStorage.setItem('token', token);
          await AsyncStorage.setItem('loggedId', userId);
          await AsyncStorage.setItem('role', userRole);
          setAuthState({
            authenticated: true,
            username,
            role,
            error: null,
            attemptedLogin: true
          });
        } else {
          setAuthState({
            authenticated: false,
            username: null,
            role: null,
            error: 'Failed to Login: Token or userId not received',
            attemptedLogin: true
          });
        }
      } else {
        setAuthState({
          authenticated: false,
          username: null,
          role: null,
          error: 'Failed to Login: Invalid response status',
          attemptedLogin: true
        });
      }
    } catch (error:any) {
      console.log('Error logging in:', error);
      setAuthState({
        authenticated: false,
        username: null,
        role: null,
        error: 'Incorrect Email or Password or Select the role again',
        attemptedLogin: true
      });
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('loggedId');
    await AsyncStorage.removeItem('role');
    setAuthState({
      authenticated: false,
      username: null,
      role: null,
      error: null,
      attemptedLogin: false
    });
  };

  const value = {
    onLogin: login,
    onLogout: logout,
    authState
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
