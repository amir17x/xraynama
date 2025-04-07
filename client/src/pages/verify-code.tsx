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
const verificationSchema = z.object({
  email: z.string().email({ message: "ایمیل معتبر وارد کنید" }),
  code: z.string().min(6, { message: "کد تأیید باید حداقل 6 کاراکتر باشد" }),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export default function VerifyCodePage() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [storedEmail, setStoredEmail] = useState("");
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get the email from session storage
    const email = sessionStorage.getItem("resetEmail");
    if (!email) {
      // Redirect to forgot password page if no email is stored
      setLocation("/forgot-password");
      return;
    }
    setStoredEmail(email);
  }, [setLocation]);

  // Set up the form
  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      email: "",
      code: "",
    },
    values: {
      email: storedEmail,
      code: "",
    },
  });

  // Update form values when storedEmail changes
  useEffect(() => {
    form.setValue("email", storedEmail);
  }, [storedEmail, form]);

  // Set up mutation
  const { mutate, error, isPending } = useMutation({
    mutationFn: async (data: VerificationFormValues) => {
      return apiRequest("/api/verify-code", {
        method: "POST",
        data,
      });
    },
    onSuccess: (response) => {
      setSubmitSuccess(true);
      
      // Store the reset token in session storage
      const { token } = response.data;
      sessionStorage.setItem("resetToken", token);
      
      // Redirect to reset password page after a short delay
      setTimeout(() => {
        setLocation("/reset-password");
      }, 2000);
    },
    onError: (error: Error) => {
      console.error("Error verifying code:", error);
    },
  });

  const onSubmit = (data: VerificationFormValues) => {
    mutate(data);
  };

  const handleResendCode = () => {
    if (storedEmail) {
      apiRequest("/api/forgot-password", {
        method: "POST",
        data: { email: storedEmail },
      })
        .then(() => {
          alert("کد جدید ارسال شد. لطفاً ایمیل خود را بررسی کنید.");
        })
        .catch((error) => {
          console.error("Error resending code:", error);
          alert("خطا در ارسال مجدد کد. لطفاً بعداً تلاش کنید.");
        });
    }
  };

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center p-4 lg:max-w-md">
      <Card className="w-full glassmorphic-card dark:bg-slate-900/60 border-slate-200/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary mb-1">تأیید کد</CardTitle>
          <CardDescription>کد تأییدی که به ایمیل شما ارسال شده را وارد کنید</CardDescription>
        </CardHeader>
        <CardContent>
          {submitSuccess ? (
            <Alert className="bg-green-500/10 text-green-500 border-green-500/30">
              <AlertDescription>
                کد تأیید با موفقیت تأیید شد. در حال انتقال به صفحه بعدی...
              </AlertDescription>
            </Alert>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ایمیل</FormLabel>
                      <FormControl>
                        <Input 
                          disabled 
                          placeholder="example@email.com" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>کد تأیید</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="کد 6 رقمی" 
                          className="text-center tracking-widest text-lg" 
                          maxLength={6} 
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
                      {(error as any).response?.data?.message || "کد وارد شده نامعتبر است. لطفا مجددا تلاش کنید."}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "در حال بررسی..." : "تأیید کد"}
                </Button>
                
                <div className="text-sm text-center">
                  <button 
                    type="button" 
                    onClick={handleResendCode} 
                    className="text-primary hover:underline"
                  >
                    ارسال مجدد کد
                  </button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            <Link href="/forgot-password" className="text-primary hover:underline">
              بازگشت به صفحه قبل
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}