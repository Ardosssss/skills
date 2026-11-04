import { LoginForm } from "@/components/admin/LoginForm";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center"><Logo /></div>
        <div className="card p-7">
          <h1 className="h-display mb-6 text-center text-xl">Admin-Login</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
