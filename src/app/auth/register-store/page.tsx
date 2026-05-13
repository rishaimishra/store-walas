import { StoreRegistrationForm } from "@/features/stores/components/store-registration-form";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RegisterStorePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login?callbackUrl=/auth/register-store");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <StoreRegistrationForm />
      </div>
    </div>
  );
}
