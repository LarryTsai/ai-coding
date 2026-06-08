export interface AuthService {
  logout: () => void;
  setToken: (token: string) => void;
  getToken: () => string | null;
  isAuthenticated: () => boolean;
}

export const createAuthService = (): AuthService => {
  return {
    logout() {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('correlation_id');
    },

    setToken(token: string) {
      localStorage.setItem('auth_token', token);
    },

    getToken(): string | null {
      return localStorage.getItem('auth_token');
    },

    isAuthenticated(): boolean {
      return !!localStorage.getItem('auth_token');
    },
  };
};

export const authService = createAuthService();
