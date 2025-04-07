import { useEffect, useState } from "react";
import { Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";

// Zod schema for form validation
const resetPasswordSchema = z.object({
  password: z.string().min(8, { message: "رمز عبور باید حداقل 8 کاراکتر باشد" }),
  confirmPassword: z.string().min(8, { message: "تکرار رمز عبور باید حداقل 8 کاراکتر باشد" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "رمز عبور و تکرار آن باید یکسان باشند",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [storedEmail, setStoredEmail] = useState("");
  const [storedToken, setStoredToken] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get the email and token from session storage
    const email = sessionStorage.getItem("resetEmail");
    const token = sessionStorage.getItem("resetToken");
    
    if (!email || !token) {
      // Redirect to forgot password page if no email or token is stored
      setLocation("/forgot-password");
      return;
    }
    
    setStoredEmail(email);
    setStoredToken(token);
  }, [setLocation]);

  // Set up the form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Set up mutation
  const { mutate, error, isPending } = useMutation({
    mutationFn: async (data: ResetPasswordFormValues) => {
      return apiRequest("/api/reset-password", {
        method: "POST",
        data: {
          email: storedEmail,
          token: storedToken,
          password: data.password,
        },
      });
    },
    onSuccess: () => {
      setSubmitSuccess(true);
      
      // Clear session storage
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetToken");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        setLocation("/login");
      }, 2000);
    },
    onError: (error: Error) => {
      console.error("Error resetting password:", error);
    },
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    mutate(data);
  };

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center p-4 lg:max-w-md">
      <Card className="w-full glassmorphic-card dark:bg-slate-900/60 border-slate-200/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary mb-1">تغییر رمز عبور</CardTitle>
          <CardDescription>رمز عبور جدید خود را وارد کنید</CardDescription>
        </CardHeader>
        <CardContent>
          {submitSuccess ? (
            <Alert className="bg-green-500/10 text-green-500 border-green-500/30">
              <AlertDescription>
                رمز عبور با موفقیت تغییر یافت. در حال انتقال به صفحه ورود...
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رمز عبور جدید</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="رمز عبور جدید" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تکرار رمز عبور</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="تکرار رمز عبور جدید" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {(error as any).response?.data?.message || "خطا در تغییر رمز عبور. لطفا مجددا تلاش کنید."}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "در حال ثبت..." : "تغییر رمز عبور"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            <Link href="/login" className="text-primary hover:underline">
              بازگشت به صفحه ورود
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}