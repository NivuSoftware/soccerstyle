import { apiClient } from "@/services/apiClient";
import type { LoginCredentials, LoginResponse } from "@/types/auth";

export const authService = {
  login(credentials: LoginCredentials) {
    return apiClient<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },
};
