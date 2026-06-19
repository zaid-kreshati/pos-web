// API Response types
export interface ApiResponse<T = unknown> {
  status: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse extends ApiResponse {
  data: {
    user: {
      id: number;
      name: string;
      email: string;
    };
    auth_token: string;
    role: string;
  };
}

export interface CreateInvoiceResponse extends ApiResponse {
  data: {
    uuid: string;
  };
}

export interface LogoutResponse extends ApiResponse {
  message: string;
}

// Error response
export interface ApiError {
  status: false;
  message: string;
  errors?: Record<string, string[]>;
}
