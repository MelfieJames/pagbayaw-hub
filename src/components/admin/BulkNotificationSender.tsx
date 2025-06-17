
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Users, Send } from "lucide-react";
import { UserList } from "./bulk-notification/UserList";
import { useBulkNotification } from "./bulk-notification/useBulkNotification";

export function BulkNotificationSender() {
  const {
    filteredUsers,
    selectedUsers,
    selectAll,
    message,
    searchTerm,
    isLoading,
    isSending,
    setMessage,
    setSearchTerm,
    handleSelectAll,
    handleSelectUser,
    handleSendNotifications,
  } = useBulkNotification();

  return (
    <Card className="border-[#C4A484]">
      <CardHeader className="bg-[#F5F5DC]">
        <CardTitle className="text-[#8B7355] flex items-center gap-2">
          <Users className="h-5 w-5" />
          Send Bulk Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div>
          <Label className="text-[#8B7355] mb-2 block">Message</Label>
          <Textarea
            placeholder="Enter your notification message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <UserList
          users={filteredUsers}
          selectedUsers={selectedUsers}
          searchTerm={searchTerm}
          selectAll={selectAll}
          isLoading={isLoading}
          onSearchChange={setSearchTerm}
          onSelectAll={handleSelectAll}
          onSelectUser={handleSelectUser}
        />

        <Button
          onClick={handleSendNotifications}
          disabled={isSending || selectedUsers.length === 0 || !message.trim()}
          className="w-full bg-[#8B7355] hover:bg-[#7a624d] text-white"
        >
          {isSending ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Sending to {selectedUsers.length} user(s)...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send to {selectedUsers.length} User(s)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
