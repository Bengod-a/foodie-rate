"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export default function PostPage() {
  const session = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    restaurantName: "" as string,
    foodname: "" as string,
    location: "",
    rating: "",
    description: "",
    image: [] as File[],
  });
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    session.update();
  }, []);

  useEffect(() => {
    if (session.status === "unauthenticated") {
      toast.info("กรุณาเข้าสู่ระบบเพื่อโพสต์รีวิว");
      router.push("/AuthPage");
    }
  }, [session.status, router]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rating: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setFormData((prev) => ({ ...prev, image: fileArray }));
      const previewUrls = fileArray.map((file) => URL.createObjectURL(file));
      setImagePreview(previewUrls);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.data?.user?.id) {
      toast.error("กรุณาเข้าสู่ระบบ");
      return;
    }

    setIsSubmitting(true);
    const formDataToSend = new FormData();
    formDataToSend.append("restaurantName", formData.restaurantName);
    formDataToSend.append("foodname", formData.foodname);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("rating", formData.rating);
    formDataToSend.append("description", formData.description);
    formData.image.forEach((file) => {
      formDataToSend.append("images", file);
    });
    const userId = session.data.user.id as any;
    formDataToSend.append("userId", userId);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("โพสต์รีวิวสำเร็จ");
        router.push("/");
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session.status === "loading") {
    return (
      <div className="min-h-screen bg-background text-foreground p-4 font-sans flex items-center justify-center">
        <p>กำลังโหลด...</p>
      </div>
    );
  }

  if (session.status === "unauthenticated") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 font-sans">
      <div className="w-full">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">โพสต์รีวิวร้านอาหาร</h1>
          <Link
            href="/"
            className="text-muted-foreground text-base underline hover:text-primary"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="restaurantName" className="text-lg">
              ชื่อร้านอาหาร
            </Label>
            <Input
              id="restaurantName"
              name="restaurantName"
              type="text"
              placeholder="เช่น ร้านอาหารอร่อยมาก"
              value={formData.restaurantName}
              onChange={handleInputChange}
              className="w-full mt-2 p-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="foodname" className="text-lg">
              ชื่ออาหาร
            </Label>
            <Input
              id="foodname"
              name="foodname"
              type="text"
              value={formData.foodname}
              onChange={handleInputChange}
              className="w-full mt-2 p-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="location" className="text-lg">
              ที่ตั้ง
            </Label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="เช่น 123 ถนนสุขุมวิท กรุงเทพฯ"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full mt-2 p-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground text-base"
              required
            />
          </div>

          <div>
            <Label htmlFor="rating" className="text-lg">
              คะแนน
            </Label>
            <Select onValueChange={handleRatingChange} required>
              <SelectTrigger className="w-full p-3 bg-input border border-border rounded-lg text-foreground mt-2 text-base">
                <SelectValue placeholder="เลือกคะแนน (1-5)" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((score) => (
                  <SelectItem key={score} value={score.toString()}>
                    {score} ดาว
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="text-lg">
              รายละเอียดรีวิว
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="เช่น อาหารอร่อยมาก บรรยากาศดี บริการเยี่ยม!"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full mt-2 p-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground text-base"
              rows={8}
              required
            />
          </div>

          <div>
            <Label htmlFor="image" className="text-lg">
              รูปภาพร้านอาหาร และ อาหาร (ถ้ามี)
            </Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full mt-2 p-3 bg-input border border-border rounded-lg text-foreground text-base"
            />
            {imagePreview.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-4">
                {imagePreview.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-40 h-40 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg hover:bg-primary/80 transition-all duration-300 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังโพสต์..." : "โพสต์รีวิว"}
          </Button>
        </form>
      </div>
    </div>
  );
}
