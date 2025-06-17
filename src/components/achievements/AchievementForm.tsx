
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, Upload, Video, Image as ImageIcon, X } from "lucide-react";
import { useAchievementForm } from "@/hooks/achievement/useAchievementForm";
import { useAchievementImages } from "@/hooks/achievement/useAchievementImages";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AchievementFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  achievement?: any;
}

export function AchievementForm({ isOpen, onOpenChange, achievement }: AchievementFormProps) {
  const {
    formData,
    isSubmitting,
    handleInputChange,
    handleSubmit,
    resetForm,
  } = useAchievementForm(achievement, onOpenChange);

  const {
    images,
    isUploading,
    handleImageUpload,
    removeImage,
  } = useAchievementImages(achievement?.id);

  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-[#8B7355]">
            {achievement ? "Edit Achievement" : "Add New Achievement"}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <form onSubmit={onSubmitForm} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="achievement_name" className="text-[#8B7355]">
                    Achievement Name *
                  </Label>
                  <Input
                    id="achievement_name"
                    name="achievement_name"
                    value={formData.achievement_name}
                    onChange={handleInputChange}
                    placeholder="Enter achievement name"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="date" className="text-[#8B7355]">
                    Date *
                  </Label>
                  <div className="relative">
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="mt-1 pl-10"
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="venue" className="text-[#8B7355]">
                    Venue
                  </Label>
                  <Input
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleInputChange}
                    placeholder="Enter venue"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="video" className="text-[#8B7355]">
                    Video URL
                  </Label>
                  <div className="relative">
                    <Input
                      id="video"
                      name="video"
                      value={formData.video}
                      onChange={handleInputChange}
                      placeholder="Enter video URL"
                      className="mt-1 pl-10"
                    />
                    <Video className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="description" className="text-[#8B7355]">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    required
                    rows={4}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="about_text" className="text-[#8B7355]">
                    About Text
                  </Label>
                  <Textarea
                    id="about_text"
                    name="about_text"
                    value={formData.about_text}
                    onChange={handleInputChange}
                    placeholder="Additional information about the achievement"
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload Section */}
            <Card className="border-[#C4A484]">
              <CardHeader>
                <CardTitle className="text-[#8B7355] flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Images
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image-upload" className="text-[#8B7355]">
                      Upload Images
                    </Label>
                    <div className="mt-2">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={isUploading}
                        className="w-full border-[#C4A484] text-[#8B7355]"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Choose Images"}
                      </Button>
                    </div>
                  </div>

                  {images.length > 0 && (
                    <ScrollArea className="h-32">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image.image_url}
                              alt={`Achievement ${index + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(image.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="border-[#C4A484] text-[#8B7355]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#8B7355] hover:bg-[#7a624d] text-white"
              >
                {isSubmitting ? "Saving..." : achievement ? "Update Achievement" : "Create Achievement"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
