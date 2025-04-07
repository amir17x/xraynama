import { createContext, ReactNode, useContext } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, RegisterData>;
};

// Login data type
type LoginData = {
  username: string;
  password: string;
};

// Extended schema for registration with password confirmation
const registerUserSchema = insertUserSchema.extend({
  passwordConfirm: z.string()
}).refine((data) => data.password === data.passwordConfirm, {
  message: "رمز عبور و تأیید آن باید یکسان باشند",
  path: ["passwordConfirm"],
});

type RegisterData = z.infer<typeof registerUserSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "ورود موفقیت‌آمیز",
        description: `${user.username} عزیز، خوش آمدید!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در ورود",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: RegisterData) => {
      // Extract passwordConfirm before sending to API
      const { passwordConfirm, ...registerData } = userData;
      const res = await apiRequest("POST", "/api/register", registerData);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "ثبت‌نام موفقیت‌آمیز",
        description: `${user.username} عزیز، خوش آمدید!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در ثبت‌نام",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "خروج موفقیت‌آمیز",
        description: "شما با موفقیت از حساب کاربری خود خارج شدید.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطا در خروج",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
