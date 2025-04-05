
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
import { Shield, UserX, UserPlus, Mail, Calendar, AlertTriangle } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
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
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
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
      try {
        // In a real application, you would have a proper admins table or role system
        // For this example, we'll return all users who have admin role
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1);
        
        // Filtering sample - in a real app, you'd have a proper admin role check
        if (error) throw error;
        
        // Just for demonstration, we're treating the first user as admin
        // In a real app, you would check a roles table
        return data.length > 0 ? [data[0]] : [];
      } catch (error) {
        console.error("Error fetching admins:", error);
        throw error;
      }
    }
  });

  const createAdminAccount = async (values: z.infer<typeof adminFormSchema>) => {
    setAdminError(null);
    setIsAddingAdmin(true);
    
    try {
      // Create user through direct API access is restricted
      // In a real production app, you'd need a function for this
      // Instead, we'll create a regular user and mark it as admin in profiles
      
      // Signup the user first
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      
      if (signupError) throw signupError;
      
      if (!signupData.user) {
        throw new Error("Failed to create user");
      }

      // This would be where you'd mark the user as admin in your roles system
      // For this example, we'll just show a success message
      
      toast({ 
        title: "Admin created successfully", 
        description: "The user has been registered. For full admin privileges, you'll need to grant them in the Supabase dashboard."
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-list'] });
      form.reset();
      setIsAddDialogOpen(false);
      
      return signupData.user.id;
    } catch (error: any) {
      console.error("Error creating admin:", error);
      setAdminError(error.message || "Failed to create admin account");
      throw error;
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // First delete from profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
        
      if (profileError) throw profileError;
        
      toast({ title: "Admin removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['admin-list'] });
      setIsDeleteDialogOpen(false);
      setSelectedAdminId(null);
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast({ 
        title: "Failed to delete admin", 
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (adminId: string) => {
    setSelectedAdminId(adminId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedAdminId) {
      handleDeleteUser(selectedAdminId);
    }
  };

  const onSubmit = async (values: z.infer<typeof adminFormSchema>) => {
    try {
      await createAdminAccount(values);
    } catch (error) {
      // Error already handled in createAdminAccount
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#8B7355] hover:bg-[#9b815f] flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Admin</DialogTitle>
                <DialogDescription>Create a new admin account with full system access.</DialogDescription>
              </DialogHeader>
              
              {adminError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>{adminError}</div>
                </div>
              )}
              
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
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-200">
                    <p className="font-medium flex items-center gap-1 mb-1">
                      <AlertTriangle className="h-4 w-4" /> Important Note
                    </p>
                    <p>Admin creation through the UI is limited. For full admin rights, create the user here then grant additional permissions through the Supabase dashboard.</p>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isAddingAdmin} className="bg-[#8B7355] hover:bg-[#9b815f]">
                      {isAddingAdmin ? "Creating..." : "Create Admin"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length > 0 ? (
                  admins.map((admin: AdminProfile) => (
                    <TableRow key={admin.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-[#8B7355] text-white">
                              {admin.email.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="font-medium">
                            Administrator
                            <div className="text-xs text-gray-500">ID: {admin.id.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {admin.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-[#8B7355]">Super Admin</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {admin.created_at ? format(new Date(admin.created_at), 'MMM d, yyyy') : 'N/A'}
                        </div>
                      </TableCell>
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
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
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
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
