import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { BellRing, UserSearch, Hash, Pencil, User, Clipboard } from "lucide-react";
import { Label } from "@/components/ui/label";
import { AdminSidebar } from "@/components/products/AdminSidebar";
import { supabase } from "@/services/supabase/client";

interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
}

export default function SendNotificationForm() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name");

      if (error) {
        console.error("Error fetching users:", error);
        alert("Error fetching users. Please try again later.");
        return;
      }

      const formattedUsers = data.map((user) => ({
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      }));

      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
    };

    fetchUsers();
  }, []);

  const getFullName = (user: User) =>
    `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email;

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    const filtered = users.filter((user) =>
      getFullName(user).toLowerCase().includes(value.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleSend = async () => {
    if (!selectedUserId || !message.trim() || !trackingNumber.trim()) {
      return alert("Please fill all fields.");
    }

    setLoading(true);
    const { error } = await supabase.from("notifications").insert([
      {
        user_id: selectedUserId,
        message: `${message.trim()} - TRACKING NUMBER: ${trackingNumber.trim()}`,
        tracking_number: trackingNumber.trim(),
        type: "tracking_update", // or any relevant type like "order_status", etc.
      },
    ]);

    if (error) {
      console.error("Error sending notification:", error);
      alert("Something went wrong. Please try again later.");
    } else {
      alert("Notification sent successfully!");
      setMessage("");
      setTrackingNumber("");
      setSearchTerm("");
      setSelectedUserId("");
    }

    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Tracking number copied!");
    });
  };

  return (
    <div className="flex min-h-screen bg-[#f4f1ed]">
      {/* Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-10">
        <Card className="max-w-xl mx-auto shadow-lg bg-[#fdfbf7] border-[#e5e2dd]">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-2">
              <BellRing className="text-[#8B7355]" />
              <h2 className="text-xl font-bold text-[#8B7355]">Send Notification</h2>
            </div>

            {/* Search Users */}
            <div>
              <Label className="text-[#8B7355] flex items-center gap-2">
                <UserSearch className="w-4 h-4" />
                Search User
              </Label>
              <Input
                placeholder="Enter name to search..."
                value={searchTerm}
                onChange={handleSearch}
                className="mt-1"
              />
              {searchTerm && (
                <div className="border mt-2 rounded-md max-h-40 overflow-y-auto bg-white shadow">
                  {filteredUsers.length > 0 &&
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-[#f5f5dc] ${
                          selectedUserId === user.id ? "bg-[#f5f5dc] font-semibold" : ""
                        }`}
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setSearchTerm(getFullName(user));
                          setFilteredUsers([]);
                        }}
                      >
                        <User className="w-4 h-4 text-gray-600" />
                        <span>{getFullName(user)} ({user.email})</span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Tracking Number */}
            <div>
              <Label className="text-[#8B7355] flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Tracking Number
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="mt-1 flex-1"
                />
                {trackingNumber && (
                  <button
                    onClick={() => copyToClipboard(trackingNumber)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Clipboard className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <Label className="text-[#8B7355] flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Message
              </Label>
              <Textarea
                placeholder="Write your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={loading}
              className="w-full bg-[#8B7355] hover:bg-[#7a624d] text-white"
            >
              {loading ? "Sending..." : "Send Notification"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
