import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, AlertTriangle } from "lucide-react";

interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
}

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: Profile | null;
}

export function DeleteUserDialog({ open, onOpenChange, user }: DeleteUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Call the admin delete user function
      const { error } = await supabase.rpc("admin_delete_user", {
        target_user_id: user.id,
      });

      if (error) {
        throw error;
      }

      // Try to delete from auth.users as well (may require additional permissions)
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(user.id);
        if (authError) {
          console.warn("Auth user deletion failed:", authError);
          // Don't throw here as the application data was cleaned up
        }
      } catch (authDeleteError) {
        console.warn("Auth user deletion not available:", authDeleteError);
      }

      toast({
        title: "User deleted successfully",
        description: `${user.email || user.id} has been removed from the system.`,
      });

      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Failed to delete user",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete User Account
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div>
              Are you sure you want to delete the user account for{" "}
              <span className="font-medium">{user?.email || user?.id}</span>?
            </div>
            <div className="text-sm bg-destructive/10 p-3 rounded-md border border-destructive/20">
              <strong>Warning:</strong> This action cannot be undone. This will:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Permanently delete the user's profile</li>
                <li>Remove all assigned roles</li>
                <li>Delete all associated onboarding requests</li>
                <li>May delete the authentication account</li>
              </ul>
            </div>
            {user?.display_name && (
              <div className="text-sm">
                <span className="font-medium">Display Name:</span> {user.display_name}
              </div>
            )}
            <div className="text-sm">
              <span className="font-medium">Account Created:</span>{" "}
              {user ? new Date(user.created_at).toLocaleString() : ""}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}