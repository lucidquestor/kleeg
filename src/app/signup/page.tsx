import { AuthForm } from "@/components/auth/AuthForm";

export const metadata = {
  title: "Create account",
};

export default function SignupPage() {
  return (
    <AuthForm
      mode="signup"
      title="Create your Kleeg account"
      subtitle="Start with projects, chat, and document editing."
      nextPath="/dashboard"
    />
  );
}
