import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { supabase } from "@/services/supabase/client";
import { useSession } from "@/hooks/useSession";
import { UserRound, ShoppingCart } from "lucide-react";

interface ProfileFormFields {
  first_name: string;
  last_name: string;
  phone_number: string;
  address: string;
  profile_picture_path: string;
}

interface Purchase {
  id: number;
  product_name: string;
  status: string;
  created_at: string;
}

type ActivePage = "profile" | "purchases";

export default function ProfilePage() {
  const { session } = useSession();
  const user = session?.user;
  const navigate = useNavigate();
  const location = useLocation();
  const redirectAfterUpdate = location.state?.redirectAfterUpdate ?? "/";

  const [formData, setFormData] = useState<ProfileFormFields>({
    first_name: "",
    last_name: "",
    phone_number: "",
    address: "",
    profile_picture_path: "",
  });

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activePage, setActivePage] = useState<ActivePage>("profile");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Fetch profile details
      const { data: profile, error: profileError } = await supabase
        .from("transaction_details")
        .select("*")
        .eq("email", user.email)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
        return;
      }

      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone_number: profile.phone_number || "",
        address: profile.address || "",
        profile_picture_path: profile.profile_picture_path || "",
      });

      if (profile.profile_picture_path) {
        const { data } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(profile.profile_picture_path);
        setPreviewImage(data?.publicUrl || null);
      }

      // Fetch user purchases
      const { data: orders, error: ordersError } = await supabase
        .from("purchases")
        .select("*")
        .eq("email", user.email);

      if (ordersError) {
        console.error("Error fetching purchases:", ordersError.message);
      } else {
        setPurchases(orders);
      }
    };

    fetchData();
  }, [user]);

  const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileToUpload(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      let profilePicturePath = formData.profile_picture_path;

      if (fileToUpload) {
        const fileExt = fileToUpload.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(fileName, fileToUpload, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw new Error("Image upload failed.");
        profilePicturePath = fileName;
      }

      const payload = {
        ...formData,
        profile_picture_path: profilePicturePath,
        email: user.email,
      };

      const { data: existing, error: fetchError } = await supabase
        .from("transaction_details")
        .select("*")
        .eq("email", user.email)
        .single();

      const { error: saveError } = existing
        ? await supabase.from("transaction_details").update(payload).eq("email", user.email)
        : await supabase.from("transaction_details").insert([payload]);

      if (fetchError && fetchError.code !== "PGRST116")
        throw new Error("Failed to fetch profile");
      if (saveError) throw new Error("Failed to save profile");

      toast.success("Profile updated successfully");
      setIsEditing(false);
      navigate(redirectAfterUpdate);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (id: number) => {
    try {
      const { error } = await supabase
        .from("purchases")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw new Error("Failed to cancel order");

      setPurchases((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: "cancelled" } : p))
      );

      toast.success("Order cancelled successfully");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md border-r h-screen fixed top-0 left-0 flex flex-col p-6">
        <h1 className="text-2xl font-bold text-center mb-6">Profile Menu</h1>
        <nav className="space-y-4">
          <Button variant="ghost" className="w-full justify-start" onClick={() => setActivePage("profile")}>
            <UserRound className="w-5 h-5 mr-2" /> Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start" onClick={() => setActivePage("purchases")}>
            <ShoppingCart className="w-5 h-5 mr-2" /> My Purchases
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-10 flex-1">
        <div className="max-w-2xl mx-auto space-y-10">
          {activePage === "profile" && (
            <section className="bg-white rounded-xl shadow border p-6 w-full">
              <div className="flex flex-col items-center gap-4 mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden border">
                  {previewImage ? (
                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="bg-gray-200 w-full h-full flex items-center justify-center">No Image</div>
                  )}
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleProfileSubmit} className="grid md:grid-cols-2 gap-4">
                  <Input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleProfileChange} />
                  <Input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleProfileChange} />
                  <Input name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleProfileChange} />
                  <Input name="address" placeholder="Address" value={formData.address} onChange={handleProfileChange} />
                  <Input type="file" onChange={handleFileChange} className="col-span-2" />
                  <div className="col-span-2 flex gap-4 justify-center">
                    <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
                    <Button type="button" variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-2 text-center">
                  <p><b>Name:</b> {formData.first_name} {formData.last_name}</p>
                  <p><b>Phone:</b> {formData.phone_number}</p>
                  <p><b>Address:</b> {formData.address}</p>
                  <Button className="mt-4" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                </div>
              )}
            </section>
          )}

          {activePage === "purchases" && (
            <section className="bg-white rounded-xl shadow border p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> Recent Purchases
              </h2>

              {purchases.length === 0 ? (
                <p>No recent purchases found</p>
              ) : (
                purchases.map((purchase) => (
                  <div key={purchase.id} className="border-b py-4 flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{purchase.product_name}</p>
                      <p className="text-sm text-gray-500">{new Date(purchase.created_at).toLocaleString()}</p>
                      <p className={`text-sm ${purchase.status === "cancelled" ? "text-red-500" : "text-green-600"}`}>
                        {purchase.status}
                      </p>
                    </div>
                    {purchase.status !== "cancelled" && (
                      <Button variant="destructive" onClick={() => cancelOrder(purchase.id)}>Cancel</Button>
                    )}
                  </div>
                ))
              )}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
