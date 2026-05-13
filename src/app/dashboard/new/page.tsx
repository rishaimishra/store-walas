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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransition } from "react";
import { createStore } from "@/features/stores/actions/create";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Store, ChevronLeft } from "lucide-react";
import Link from "next/link";

const storeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export default function NewStorePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof storeSchema>>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof storeSchema>) {
    startTransition(async () => {
      const result = await createStore(values);

      if (result.success) {
        toast.success("Store created successfully! It is currently pending approval.");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to create store");
      }
    });
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Seller Hub
        </Link>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Store className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Your Store</CardTitle>
          <CardDescription>
            Enter the details below to set up your new clothing brand on our marketplace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Modern Threads" {...field} />
                    </FormControl>
                    <FormDescription> This will be used to generate your store URL.</FormDescription>
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
                        placeholder="Tell us about your brand..."
                        className="resize-none h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-12" disabled={isPending}>
                {isPending ? "Creating Store..." : "Create Store"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
