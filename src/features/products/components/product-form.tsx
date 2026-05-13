"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Category, Product } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createProduct, updateProduct } from "../actions";
import { toast } from "sonner";
import { useFieldArray } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { ImageUpload } from "@/components/shared/image-upload";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0.01),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string()).min(1, "At least one image is required"),
  variants: z.array(z.object({
    size: z.string().optional(),
    color: z.string().optional(),
    stock: z.coerce.number().int().min(0),
    price: z.coerce.number().optional(),
  })).optional(),
});

type ProductFormValues = {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images: string[];
  variants?: {
    size?: string;
    color?: string;
    stock: number;
    price?: number;
  }[];
};

interface ProductFormProps {
  storeId: string;
  categories: Category[];
  initialData?: any;
}

export function ProductForm({ storeId, categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          price: Number(initialData.price),
          stock: initialData.stock,
          categoryId: initialData.categoryId,
          images: initialData.images.map((img: any) => img.url),
          variants: initialData.variants.map((v: any) => ({
              size: v.size || "",
              color: v.color || "",
              stock: v.stock,
              price: v.price ? Number(v.price) : undefined,
          })),
        }
      : {
          name: "",
          description: "",
          price: 0,
          stock: 0,
          categoryId: "",
          images: [],
          variants: [],
        },
  });

  const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: "variants",
  });

  function onSubmit(values: ProductFormValues) {
    startTransition(async () => {
      const formattedValues = {
        ...values,
        variants: values.variants?.map((v: { size?: string; color?: string; stock: number; price?: number }) => ({
            ...v,
            size: v.size || undefined,
            color: v.color || undefined,
        }))
      };

      const result = initialData
        ? await updateProduct(storeId, initialData.id, formattedValues)
        : await createProduct(storeId, formattedValues);

      if (result.success) {
        toast.success(initialData ? "Product updated" : "Product created");
        router.push(`/dashboard/${storeId}/products`);
        router.refresh();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Classic Denim Jacket" {...field} />
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
                        <Textarea
                          placeholder="Tell us about your product..."
                          className="resize-none h-32"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Base Price ($)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Base Stock</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category: Category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Images</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || []}
                          disabled={isPending}
                          onChange={(urls) => field.onChange(urls)}
                          onRemove={(url: string) => field.onChange([...field.value.filter((current: string) => current !== url)])}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Product Variants</h3>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ size: "", color: "", stock: 0 })}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Variant
                    </Button>
                </div>
                <Separator />

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                    {fields.map((field, index: number) => (
                        <div key={field.id} className="p-4 border rounded-lg bg-muted/30 space-y-4 relative group">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => remove(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`variants.${index}.size`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Size (e.g. XL, 42)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="S, M, L..." {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`variants.${index}.color`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Color</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Black, Blue..." {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name={`variants.${index}.stock`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Variant Stock</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name={`variants.${index}.price`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs">Price Override (Optional)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" {...field} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    ))}
                    {fields.length === 0 && (
                        <div className="text-center py-10 border border-dashed rounded-lg text-muted-foreground text-sm">
                            No variants added. Use variants for sizes and colors.
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="flex items-center gap-4 border-t pt-8">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="px-8">
            {isPending ? "Saving..." : initialData ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
