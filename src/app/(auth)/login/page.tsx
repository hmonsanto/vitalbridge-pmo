import { LoginForm } from "./LoginForm";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ recovered?: string }> }) {
  const { recovered } = await searchParams;
  return <LoginForm recovered={recovered === "1"} />;
}
