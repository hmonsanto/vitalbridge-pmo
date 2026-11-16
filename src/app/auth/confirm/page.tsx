import Link from "next/link";
import { AuthCard } from "@/components/auth/AuthCard";
import { ConfirmForm } from "./ConfirmForm";

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token_hash?: string; type?: string }> }) {
  const { token_hash: tokenHash, type } = await searchParams;
  const valid = type === "recovery" && Boolean(tokenHash);

  return (
    <AuthCard title="Reset your password" subtitle="Press Continue to choose a new password.">
      {valid ? (
        <ConfirmForm tokenHash={tokenHash!} />
      ) : (
        <p role="alert" className="text-sm font-medium text-rose-600">
          This link is invalid or has expired. Request a new one.
        </p>
      )}
      <Link href="/forgot-password" className="block text-center text-sm font-medium text-[var(--link)] hover:underline">
        Request a new link
      </Link>
    </AuthCard>
  );
}
