import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Loader2, UserCog } from "lucide-react";

const editUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  displayName: z.string().optional(),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Profile | null;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      email: "",
      displayName: "",
    },
  });

  // Reset form when user prop changes
  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email || "",
        displayName: user.display_name || "",
      });
    }
  }, [user, form]);

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          email: data.email,
          display_name: data.displayName || "",
        })
        .eq("id", user.id);

      if (profileError) {
        throw profileError;
      }

      // Update auth user email if it changed
      if (data.email !== user.email) {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          user.id,
          { email: data.email }
        );

        if (authError) {
          console.warn("Auth email update failed:", authError);
          // Don't throw here as profile was updated successfully
        }
      }

      toast({
        title: "User updated successfully",
        description: `${data.email} has been updated.`,
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["profiles"] });

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Failed to update user",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Edit User
          </DialogTitle>
          <DialogDescription>
            Update user profile information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">User ID:</span> {user.id}
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The user's email address (used for login)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The name shown in the application
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleString()}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}