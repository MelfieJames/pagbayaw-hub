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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { User, Mail, Calendar, MapPin, Phone, Search, UserX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string | null;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  location?: string;
  phone_number?: string;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        console.log("Fetching users from profiles table directly...");
        
        // Get profiles from the profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        console.log("Profiles fetched:", profiles?.length);
        
        // Convert profile data to expected format
        const userProfiles = profiles?.map(profile => ({
          id: profile.id,
          email: profile.email || '',
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          middle_name: profile.middle_name || '',
          location: profile.location || '',
          phone_number: profile.phone_number || '',
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || null
        })) || [];
        
        console.log("User profiles prepared:", userProfiles.length);
        return userProfiles;
      } catch (error) {
        console.error("Error in user fetching:", error);
        throw error;
      }
    },
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 10 * 1000 // Consider data stale after 10 seconds
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      try {
        // First, clean up user reviews to prevent foreign key constraints issues
        await supabase
          .from('reviews')
          .delete()
          .eq('user_id', userId);

        // Delete profile from database
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);
        
        if (profileError) {
          console.error("Error deleting profile:", profileError);
          throw new Error(`Error deleting profile: ${profileError.message}`);
        }
        
        return userId;
      } catch (error) {
        console.error("Error in delete process:", error);
        throw error;
      }
    },
    onSuccess: (userId) => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsDeleteDialogOpen(false);
      setSelectedUserId(null);
    },
    onError: (error: Error) => {
      console.error("Delete user mutation error:", error);
      toast.error("Failed to delete user: " + error.message);
    },
  });

  const filteredUsers = users.filter((user: UserProfile) => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (user: UserProfile) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const getFullName = (user: UserProfile) => {
    return `${user.first_name || ''} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name || ''}`.trim() || 'Unknown';
  };

  const handleDeleteClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedUserId) {
      deleteUserMutation.mutate(selectedUserId);
    }
  };

  if (error) {
    console.error("Error loading users:", error);
  }

  return (
    <Card className="border-2 border-[#C4A484]">
      <CardHeader className="bg-[#F5F5DC]">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[#8B7355] flex items-center gap-2">
            <User className="h-5 w-5" />
            User Management
          </CardTitle>
          <Badge variant="outline" className="px-3 py-1 bg-white">
            Total: {users.length} users
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4 relative">
          <Input 
            placeholder="Search by name, email or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="h-4 w-4 absolute top-3 left-3 text-gray-400" />
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            <p>Error loading users: {(error as Error).message}</p>
          </div>
        ) : (
          <div className="border rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="hidden md:table-cell">Details</TableHead>
                  <TableHead className="hidden md:table-cell">Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user: UserProfile) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-[#8B7355] text-white">
                              {getInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{getFullName(user)}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {user.phone_number}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {user.location ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            {user.location}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">No address</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteClick(user.id)}
                          className="h-8 flex items-center gap-1"
                        >
                          <UserX className="h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
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
              This action cannot be undone. This will permanently delete the user profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
