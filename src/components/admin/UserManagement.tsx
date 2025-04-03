
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { User, Mail, Calendar, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  location?: string;
  phone_number?: string;
}

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      try {
        // Get profiles from profiles table
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          console.error("Error fetching profiles:", error);
          throw error;
        }
        
        return profiles || [];
      } catch (error) {
        console.error("Error in user fetching:", error);
        throw error;
      }
    }
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
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.middle_name ? user.middle_name + ' ' : ''}${user.last_name || ''}`.trim();
    }
    return 'Unknown';
  };

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
        {isLoading ? (
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
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
                            <div className="text-xs text-gray-500">ID: {user.id?.substring(0, 8)}...</div>
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
    </Card>
  );
}
