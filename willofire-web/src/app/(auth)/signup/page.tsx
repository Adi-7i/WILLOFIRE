'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

import { registerSchema, RegisterFormValues } from '@/features/auth/schemas';
import { useRegister } from '@/features/auth/useAuth';

export default function SignupPage() {
    const { mutate: register, isPending, error } = useRegister();

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = (data: RegisterFormValues) => {
        register(data);
    };

    return (
        <main className="flex min-h-screen items-center justify-center p-6 text-foreground">
            <Card className="w-full max-w-sm rounded-xl border-border bg-card shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-semibold tracking-tight">Create an account</CardTitle>
                    <CardDescription className="text-muted-foreground">Join Willofire to start practicing</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/90">Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="name@example.com"
                                                type="email"
                                                autoCapitalize="none"
                                                autoComplete="email"
                                                autoCorrect="off"
                                                className="bg-background border-border focus-visible:ring-[#3F6E6A]/30"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-foreground/90">Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                                className="bg-background border-border focus-visible:ring-[#3F6E6A]/30"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-red-500" />
                                    </FormItem>
                                )}
                            />

                            {error && <div className="text-sm font-medium text-red-500 text-center">{error.message}</div>}

                            <Button
                                type="submit"
                                className="w-full mt-2 wf-accent-gradient text-primary-foreground font-medium wf-soft-glow-hover"
                                disabled={isPending}
                            >
                                {isPending ? 'Creating account...' : 'Sign up'}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    <p>
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:text-[#6C918D] transition-colors font-medium">
                            Log in
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </main>
    );
}
