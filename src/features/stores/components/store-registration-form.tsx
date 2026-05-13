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
import { useTransition } from "react";
import { createStore } from "../actions/create";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Store as StoreIcon } from "lucide-react";

const storeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

type StoreFormValues = z.infer<typeof storeSchema>;

export function StoreRegistrationForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(values: StoreFormValues) {
    startTransition(async () => {
      const result = await createStore(values);

      if (result.success) {
        toast.success("Store created successfully! It is now pending approval.");
        router.push(`/dashboard/${result.storeId}`);
      } else {
        toast.error(result.error || "Failed to create store");
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <StoreIcon className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Create Your Store</h1>
        <p className="text-sm text-muted-foreground">
          Enter the details below to start selling on the marketplace.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input placeholder="Acme Clothing Co." {...field} />
                </FormControl>
                <FormDescription>This will be the name of your shop and part of your URL.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell customers about your brand, mission, and what you sell."
                    className="resize-none h-32"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Creating Store..." : "Launch Store"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
