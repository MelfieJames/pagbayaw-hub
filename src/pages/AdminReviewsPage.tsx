
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/services/supabase/client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Search, MessageCircle, Image as ImageIcon, Video } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Review {
  id: number;
  user_id: string;
  product_id: number;
  purchase_item_id: number;
  rating: number;
  comment: string;
  image_url?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
  products: {
    product_name: string;
    image: string;
  };
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
    profile_picture?: string;
  };
}

export default function AdminReviewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: async () => {
      console.log("Fetching reviews...");
      
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          products (
            product_name,
            image
          ),
          profiles (
            first_name,
            last_name,
            email,
            profile_picture
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching reviews:", error);
        throw error;
      }

      console.log("Reviews fetched:", data?.length || 0);
      return data as Review[];
    },
  });

  const filteredReviews = reviews.filter((review) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      review.products?.product_name.toLowerCase().includes(searchLower) ||
      review.comment?.toLowerCase().includes(searchLower) ||
      `${review.profiles?.first_name} ${review.profiles?.last_name}`.toLowerCase().includes(searchLower) ||
      review.profiles?.email.toLowerCase().includes(searchLower)
    );
  });

  const viewReviewDetails = (review: Review) => {
    setSelectedReview(review);
    setIsViewModalOpen(true);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 4) return <Badge className="bg-green-500">Excellent</Badge>;
    if (rating >= 3) return <Badge className="bg-blue-500">Good</Badge>;
    if (rating >= 2) return <Badge className="bg-yellow-500">Fair</Badge>;
    return <Badge className="bg-red-500">Poor</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card className="shadow-sm bg-white">
        <CardHeader className="bg-gray-50">
          <div className="flex flex-col gap-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Customer Reviews ({reviews.length})
            </CardTitle>
            <div className="flex gap-2 items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                <Input
                  placeholder="Search reviews by product, customer, or comment..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                      {searchTerm ? "No reviews found matching your search" : "No reviews found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow key={review.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.profiles?.profile_picture} />
                            <AvatarFallback>
                              {review.profiles?.first_name?.[0]}{review.profiles?.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {review.profiles?.first_name} {review.profiles?.last_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {review.profiles?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={review.products?.image || "/placeholder.svg"}
                            alt={review.products?.product_name}
                            className="w-10 h-10 object-cover rounded"
                          />
                          <div className="max-w-[200px]">
                            <div className="font-medium truncate">
                              {review.products?.product_name}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {renderStars(review.rating)}
                          {getRatingBadge(review.rating)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate">
                          {review.comment || "No comment"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {review.image_url && (
                            <Badge variant="outline" className="text-xs">
                              <ImageIcon className="h-3 w-3 mr-1" />
                              Image
                            </Badge>
                          )}
                          {review.video_url && (
                            <Badge variant="outline" className="text-xs">
                              <Video className="h-3 w-3 mr-1" />
                              Video
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {format(new Date(review.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => viewReviewDetails(review)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Review Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          {selectedReview && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Review Details
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedReview.profiles?.profile_picture} />
                    <AvatarFallback>
                      {selectedReview.profiles?.first_name?.[0]}{selectedReview.profiles?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {selectedReview.profiles?.first_name} {selectedReview.profiles?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedReview.profiles?.email}
                    </div>
                    <div className="text-xs text-gray-400">
                      {format(new Date(selectedReview.created_at), "MMMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={selectedReview.products?.image || "/placeholder.svg"}
                      alt={selectedReview.products?.product_name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{selectedReview.products?.product_name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(selectedReview.rating)}
                        <span className="text-sm text-gray-500">
                          {selectedReview.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedReview.comment && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Comment:</h4>
                      <p className="text-gray-700">{selectedReview.comment}</p>
                    </div>
                  )}

                  {(selectedReview.image_url || selectedReview.video_url) && (
                    <div>
                      <h4 className="font-medium mb-2">Media:</h4>
                      <div className="flex gap-2">
                        {selectedReview.image_url && (
                          <img
                            src={selectedReview.image_url}
                            alt="Review image"
                            className="w-32 h-32 object-cover rounded border"
                          />
                        )}
                        {selectedReview.video_url && (
                          <video
                            src={selectedReview.video_url}
                            controls
                            className="w-32 h-32 object-cover rounded border"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
