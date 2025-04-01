import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Shield, UserX, UserPlus } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface AdminProfile {
  id: string;
  email: string;
  created_at: string;
}

const adminFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

export function AdminManagement() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof adminFormSchema>>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admin-list'],
    queryFn: async () => {
      // In a real application, you would have a proper admins table or role system
      // For this example, we'll just return the admin user from profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'admin@unvas.com');
      
      if (error) throw error;
      return data || [];
    }
  });

  const addAdminMutation = useMutation({
    mutationFn: async (values: z.infer<typeof adminFormSchema>) => {
      // Create user
      const { data, error } = await supabase.auth.admin.createUser({
        email: values.email,
        password: values.password,
        email_confirm: true,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-list'] });
      toast({ title: "Admin created successfully" });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error creating admin", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      // Delete admin user
      const { error } = await supabase.auth.admin.deleteUser(adminId);
      if (error) throw error;
      return adminId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-list'] });
      toast({ title: "Admin deleted successfully" });
      setIsDeleteDialogOpen(false);
      setSelectedAdminId(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error deleting admin", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleDeleteClick = (adminId: string) => {
    setSelectedAdminId(adminId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAdminId) {
      deleteAdminMutation.mutateAsync(selectedAdminId);
    }
  };

  const onSubmit = (values: z.infer<typeof adminFormSchema>) => {
    addAdminMutation.mutateAsync(values);
  };

  return (
    <Card className="border-2 border-[#C4A484]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#8B7355] flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Management
          </CardTitle>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#8B7355] hover:bg-[#9b815f]">
                <UserPlus className="h-4 w-4 mr-1" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>Create a new admin account with full system access.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="admin@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={addAdminMutation.isPending}>
                      {addAdminMutation.isPending ? "Creating..." : "Create Admin"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length > 0 ? (
                  admins.map((admin: AdminProfile) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#8B7355] text-white">
                              {admin.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>Super Admin</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteClick(admin.id)}
                          className="h-8"
                        >
                          <UserX className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      No admins found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the admin account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteAdminMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
