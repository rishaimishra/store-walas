import { getStore } from "@/features/stores/actions/settings";
import { StoreSettingsForm } from "@/features/stores/components/store-settings-form";
import { notFound } from "next/navigation";

export default async function StoreSettingsPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const { store } = await getStore(storeId);

  if (!store) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Store Settings</h2>
        <p className="text-muted-foreground text-sm">
          Customize your storefront and store information.
        </p>
      </div>

      <div className="rounded-md border bg-card p-6">
        <StoreSettingsForm store={store} />
      </div>
    </div>
  );
}
