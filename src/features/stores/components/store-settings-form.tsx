"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Store } from "@prisma/client";
import { useTransition } from "react";
import { updateStoreSettings } from "../actions/settings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const storeSettingsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters").optional().or(z.literal("")),
  logoUrl: z.string().optional().or(z.literal("")),
  bannerUrl: z.string().optional().or(z.literal("")),
});

type StoreSettingsValues = z.infer<typeof storeSettingsSchema>;

export function StoreSettingsForm({ store }: { store: Store }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<StoreSettingsValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      name: store.name,
      description: store.description || "",
      logoUrl: store.logoUrl || "",
      bannerUrl: store.bannerUrl || "",
    },
  });

  function onSubmit(values: StoreSettingsValues) {
    startTransition(async () => {
      const result = await updateStoreSettings(store.id, values);

      if (result.success) {
        toast.success("Store settings updated");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update settings");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className="resize-none" {...field} />
              </FormControl>
              <FormDescription>Tell customers what makes your store special.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="logoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Logo URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormDescription>URL for your store&apos;s logo image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bannerUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banner URL</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/banner.jpg" {...field} />
              </FormControl>
              <FormDescription>URL for your store&apos;s hero banner image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </Form>
  );
}
