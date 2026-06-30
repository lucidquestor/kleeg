import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign in",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <AuthForm
      mode="login"
      title="Welcome back"
      subtitle="Sign in to open your Kleeg workspace."
      nextPath={next ?? "/dashboard"}
    />
  );
}
