import { useState } from "react";
import { Link, useLocation } from "wouter";
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

// Zod schema for form validation
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "ایمیل معتبر وارد کنید" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [, setLocation] = useLocation();

  // Set up the form
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Set up mutation
  const { mutate, error, isPending } = useMutation({
    mutationFn: async (data: ForgotPasswordFormValues) => {
      return apiRequest("/api/forgot-password", {
        method: "POST",
        data,
      });
    },
    onSuccess: () => {
      // Store email in session storage to use in next steps
      sessionStorage.setItem("resetEmail", form.getValues().email);
      setSubmitSuccess(true);
      
      // Redirect to verify code page after a short delay
      setTimeout(() => {
        setLocation("/auth/verify-code");
      }, 2000);
    },
    onError: (error: Error) => {
      console.error("Error sending verification code:", error);
    },
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    mutate(data);
  };

  return (
    <div className="container mx-auto flex h-screen flex-col items-center justify-center p-4 lg:max-w-md">
      <Card className="w-full glassmorphic-card dark:bg-slate-900/60 border-slate-200/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary mb-1">بازیابی رمز عبور</CardTitle>
          <CardDescription>ایمیل خود را وارد کنید تا کد تایید را دریافت کنید</CardDescription>
        </CardHeader>
        <CardContent>
          {submitSuccess ? (
            <Alert className="bg-green-500/10 text-green-500 border-green-500/30">
              <AlertDescription>
                کد تأیید با موفقیت ارسال شد. در حال انتقال به صفحه بعدی...
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
                        <Input placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {(error as any).response?.data?.message || "خطا در ارسال کد تأیید. لطفا مجددا تلاش کنید."}
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "در حال ارسال..." : "ارسال کد تأیید"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            <span className="text-muted-foreground">به یاد آوردید؟ </span>
            <Link href="/auth" className="text-primary hover:underline">
              بازگشت به صفحه ورود
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}