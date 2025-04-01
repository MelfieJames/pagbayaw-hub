
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
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { User, UserX, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get all auth users
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error fetching auth users:", authError);
        throw authError;
      }
      
      // Merge with profiles data to get additional info if needed
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profileError) {
        console.error("Profiles fetch error:", profileError);
      }
      
      // Map auth users to include profile data
      const userProfiles = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.id === user.id) || {};
        return {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: profile.updated_at,
          first_name: profile.first_name || '',
          last_name: profile.last_name || ''
        };
      });
      
      return userProfiles || [];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      // First, call our edge function to clean up user reviews
      const { error: cleanupError } = await supabase.functions.invoke('cleanup-user-reviews', {
        body: { userId }
      });
      
      if (cleanupError) throw cleanupError;
      
      // Then delete the user
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: "User deleted successfully" });
      setIsDeleteDialogOpen(false);
      setSelectedUserId(null);
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error deleting user", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUserId) {
      deleteMutation.mutateAsync(selectedUserId);
    }
  };

  const filteredUsers = users.filter((user: any) => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="border-2 border-[#C4A484]">
      <CardHeader>
        <CardTitle className="text-[#8B7355] flex items-center gap-2">
          <User className="h-5 w-5" />
          User Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: UserProfile) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-[#8B7355] text-white">
                              {user.email?.substring(0, 2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleDeleteClick(user.id)}
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
                      No users found
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
              This action cannot be undone. This will permanently delete the user account
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
