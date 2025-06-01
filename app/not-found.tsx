import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-6">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Oops! The page you are looking for does not exist.</p>
      <Link href="/">
        <span className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/80 transition">Go Home</span>
      </Link>
    </div>
  );
} 