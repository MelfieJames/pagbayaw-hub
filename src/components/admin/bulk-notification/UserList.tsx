
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Users } from "lucide-react";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface UserListProps {
  users: User[];
  selectedUsers: string[];
  searchTerm: string;
  selectAll: boolean;
  isLoading: boolean;
  onSearchChange: (term: string) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectUser: (userId: string, checked: boolean) => void;
}

export function UserList({
  users,
  selectedUsers,
  searchTerm,
  selectAll,
  isLoading,
  onSearchChange,
  onSelectAll,
  onSelectUser,
}: UserListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Label className="text-[#8B7355] flex items-center gap-2">
          <Users className="w-4 h-4" />
          Select Recipients ({selectedUsers.length} selected)
        </Label>
        <Badge variant="outline" className="text-[#8B7355] border-[#8B7355]">
          {users.length} users
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectAll}
              onCheckedChange={onSelectAll}
            />
            <Label htmlFor="select-all" className="text-sm">
              Select All
            </Label>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="border rounded-md max-h-64 overflow-y-auto">
            {users.map((user) => (
              <div key={user.id} className="flex items-center space-x-3 p-3 border-b last:border-b-0 hover:bg-gray-50">
                <Checkbox
                  id={user.id}
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={(checked) => onSelectUser(user.id, checked as boolean)}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            ))}
            {users.length === 0 && !isLoading && (
              <div className="text-center py-4 text-gray-500">
                No users found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
