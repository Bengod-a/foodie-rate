"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import Navbar from "../../../components/Nav/Navbar";
import { useSession } from "next-auth/react";
import { DropdownMenuDemo } from "../../../components/Nav/DropdownMenuDemo";

type Image = {
  id: string;
  url: string;
  postId: string;
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: number;
  name: string;
  email: string;
};

type Like = {
  id: string;
  postId: string;
  userId: number;
};

type Comment = {
  id: string;
  text: string;
  postId: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

type Review = {
  id: string;
  user: User;
  restaurantName: string;
  foodname: string;
  userId: number;
  rating: number;
  description: string;
  location: string;
  likes: Like[];
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
  images: Image[];
};

const page = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const session = useSession();

  const getmypost = async (loadMore = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/posts/getmypost`);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const response = await res.json();
      const data: Review[] = response.data;
      const hasMoreResponse = response.hasMore;

      if (Array.isArray(data)) {
        if (loadMore) {
          setReviews((prev) => [...prev, ...data]);
        } else {
          setReviews(data);
        }
        setHasMore(hasMoreResponse);
      } else {
        throw new Error("API response 'data' is not an array");
      }
    } catch (err) {
      setError(
        "เกิดข้อผิดพลาดในการโหลดรีวิว: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
      console.error(err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getmypost();
  }, []);

  const loadMoreReviews = () => {
    setPage((prev) => prev + 1);
    getmypost(true);
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground p-4 font-sans">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            Foodie Rate
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {session.data?.user.name}
            </span>
            <DropdownMenuDemo />
          </div>
        </div>

        <div className="min-h-screen bg-background text-foreground p-4 font-sans cursor-pointer">
          <div className="mt-6">
            <h2 className="text-lg font-semibold">รีวิวของฉัน</h2>
            {loading && reviews.length === 0 && <p>กำลังโหลด...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && reviews.length === 0 && <p>ยังไม่มีรีวิว</p>}
            {reviews.length > 0 && (
              <div className="mt-2 space-y-4">
                {reviews.map((review) => (
                  <Link
                    href={`/post/${review.id}`}
                    key={review.id}
                    className="flex gap-4 p-4 bg-card rounded-lg border border-border"
                  >
                    {review.images.length > 0 ? (
                      <img
                        src={review.images[0].url}
                        alt="Food"
                        className="w-16 h-16 object-cover rounded-lg"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-muted rounded-lg" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        ร้าน: {review.restaurantName}
                      </h3>
                      <h3 className="font-semibold">
                        อาหาร: {review.foodname}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        โดย: {review.user.name || "ผู้ใช้ไม่ระบุชื่อ"}
                      </p>
                      <div className="text-primary">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)} ({review.rating}/5)
                      </div>
                      <p className="text-muted-foreground">
                        รีวิว: "{review.description}"
                      </p>
                      <div className="mt-2 flex gap-4">
                        <button className="text-muted-foreground hover:text-primary  hover:scale-110 transition-transform duration-200 ease-in-out">
                          👍
                          <span className="text-primary">
                            {review.likes?.length ?? 0}
                          </span>
                        </button>
                        <button className="text-muted-foreground hover:text-primary  hover:scale-110 transition-transform duration-200 ease-in-out">
                          💬
                          <span className="text-primary">
                            {review.comments?.length ?? 0}
                          </span>
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {hasMore && (
            <button
              onClick={loadMoreReviews}
              className="mt-4 w-full bg-secondary text-secondary-foreground py-2 rounded-lg"
              disabled={loading}
            >
              {loading ? "กำลังโหลด..." : "โหลดเพิ่ม"}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default page;
