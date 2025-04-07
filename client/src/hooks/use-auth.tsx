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

// Extend the insertUserSchema to add emailConfirm and validation
const loginSchema = z.object({
  username: z.string().min(3, "نام کاربری باید حداقل 3 کاراکتر باشد"),
  password: z.string().min(6, "رمز عبور باید حداقل 6 کاراکتر باشد"),
});

const registerSchema = insertUserSchema
  .extend({
    passwordConfirm: z.string(),
    emailConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "رمز عبور و تایید آن باید یکسان باشند",
    path: ["passwordConfirm"],
  })
  .refine((data) => data.email === data.emailConfirm, {
    message: "ایمیل و تایید آن باید یکسان باشند",
    path: ["emailConfirm"],
  });

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
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
        description: `${user.displayName || user.username} عزیز، خوش آمدید!`,
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
      // Remove passwordConfirm and emailConfirm before sending
      const { passwordConfirm, emailConfirm, ...userDataToSend } = userData;
      const res = await apiRequest("POST", "/api/register", userDataToSend);
      return await res.json();
    },
    onSuccess: (user: User) => {
      queryClient.setQueryData(["/api/user"], user);
      toast({
        title: "ثبت‌نام موفقیت‌آمیز",
        description: "حساب کاربری شما با موفقیت ایجاد شد.",
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
        description: "با موفقیت از حساب کاربری خود خارج شدید.",
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

export { loginSchema, registerSchema };
export type { LoginData, RegisterData };
