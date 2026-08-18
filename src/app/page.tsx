import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">PolyAccess Status</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Enterprise-grade status pages for the PolyAccess ecosystem. Monitor incidents, maintenance, and uptime in real time.
      </p>
      <Link href="/polyaccess">
        <Button size="lg">View Status Page</Button>
      </Link>
    </main>
  );
}
