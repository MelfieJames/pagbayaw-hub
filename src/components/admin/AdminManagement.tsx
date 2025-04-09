
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Shield, Plus, Trash2, UserPlus } from "lucide-react";

interface Admin {
  id: string;
  user_id: string;
  email: string;
  created_at: string;
}

export function AdminManagement() {
  const [email, setEmail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all admins
  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching admins:", error);
        throw error;
      }

      return data || [];
    },
  });

  // Add new admin
  const addAdminMutation = useMutation({
    mutationFn: async (email: string) => {
      // First check if this email exists as a user
      const { data: users, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (userError) throw userError;
      
      if (!users) {
        throw new Error("No user found with this email address");
      }

      // Check if user is already an admin
      const { data: existingAdmin, error: checkError } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', users.id)
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existingAdmin) {
        throw new Error("This user is already an admin");
      }

      // Add the user to admins
      const { data, error } = await supabase
        .from('admins')
        .insert({
          id: crypto.randomUUID(),
          user_id: users.id,
          email: email
        })
        .select()
        .single();

      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success("Admin added successfully");
      setEmail("");
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to add admin: ${error.message}`);
    }
  });

  // Remove admin
  const removeAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', adminId);

      if (error) throw error;
      
      return adminId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      toast.success("Admin removed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove admin: ${error.message}`);
    }
  });

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }
    addAdminMutation.mutate(email);
  };

  const handleRemoveAdmin = (adminId: string) => {
    if (window.confirm("Are you sure you want to remove this admin?")) {
      removeAdminMutation.mutate(adminId);
    }
  };

  return (
    <Card className="border-2 border-[#C4A484]">
      <CardHeader className="bg-[#F5F5DC]">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#8B7355] flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Management
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="flex items-center gap-2 bg-[#8B7355] hover:bg-[#9b815f]"
              >
                <UserPlus className="h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAdmin} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">User Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter user email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    The user must already have an account in the system
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">Cancel</Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    disabled={addAdminMutation.isPending}
                    className="bg-[#8B7355] hover:bg-[#9b815f]"
                  >
                    {addAdminMutation.isPending ? "Adding..." : "Add Admin"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Added On</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length > 0 ? (
                  admins.map((admin: Admin) => (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">
                        {admin.email}
                      </TableCell>
                      <TableCell>
                        {new Date(admin.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveAdmin(admin.id)}
                          className="h-8"
                          disabled={admin.email === 'admin@unvas.com'} // Protect the super admin
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-gray-500">
                      No admins found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
