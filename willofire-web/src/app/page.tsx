import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl w-full space-y-8">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl text-zinc-50">
          Willofire
        </h1>
        <p className="text-xl text-zinc-400">
          AI-powered exam practice platform
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 font-medium">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 font-medium">
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
