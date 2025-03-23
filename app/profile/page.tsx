"use client";
import React, { useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { DropdownMenuDemo } from "../../components/Nav/DropdownMenuDemo";

const ProfilePage = () => {
  const { data: session, status, update } = useSession();

  useEffect(() => {
    if (status === "authenticated" && !session?.user.id) {
      update();
    }
  }, [session, status]);

  console.log(session);

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] font-sans">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Foodie Rate
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">{session?.user.name}</span>
          <DropdownMenuDemo />
        </div>
      </div>
      <div className="relative w-full mt-2 max-w-[1250px] h-[200px] sm:h-[300px] md:h-[460px] bg-gray-200 mx-auto">
        <Image
          src="https://scontent.fphs2-1.fna.fbcdn.net/v/t39.30808-6/480798641_122123421092420070_3774834844180981727_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=110&ccb=1-7&_nc_sid=cc71e4&_nc_ohc=mVXx1zTWTFkQ7kNvgHOKeKe&_nc_oc=AdnbExfzLYukr2ejPpsLQMcivQt90AIdJFUf4Z5SxjRNymNbi55El2GVVJDuvT3O9m7njoR9wZwK7KnijM86d6Pf&_nc_zt=23&_nc_ht=scontent.fphs2-1.fna&_nc_gid=OBrAVBPi0Qo-LNrpQBhC2w&oh=00_AYGfYWrorQtS5MuY2-4ofXbo3h0T0Ob8diAoRMUcEfZBTQ&oe=67E599B2"
          alt="Cover Photo"
          fill
          className="object-cover rounded-md"
        />
      </div>

      <div className="max-w-5xl mx-auto relative -mt-16 sm:-mt-20 px-4">
        <div className="flex items-end flex-col sm:flex-row">
          <div className="relative w-32 h-32 sm:w-44 sm:h-44 rounded-full border-4 border-white">
            <Image
              src="https://scontent.fphs2-1.fna.fbcdn.net/v/t39.30808-1/451713787_122099829650420070_3203138656672093639_n.jpg?stp=dst-jpg_s200x200_tt6&_nc_cat=103&ccb=1-7&_nc_sid=e99d92&_nc_ohc=YzZZnoZM5VcQ7kNvgGk2-BG&_nc_oc=Adn6bNwYBqkXkR-63WYbW6LAx96z5TZJ0jcZz_lpY0YEO2Y87LwOpeROt6CO09zwTSzM9xMVi4tpKScA2Ab_rovo&_nc_zt=24&_nc_ht=scontent.fphs2-1.fna&_nc_gid=OBrAVBPi0Qo-LNrpQBhC2w&oh=00_AYHNYpBhIM3CpcF0YvRiWEA56JKwexN6c40qd4daCB7roQ&oe=67E5A1C1"
              alt="Profile Picture"
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div className="ml-0 sm:ml-6 flex-1 mb-4 mt-2 sm:mt-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1C2526]">
              Teeratat Nakarin
            </h1>
          </div>
        </div>

        <div className="mx-auto flex w-full mt-4 sm:mt-6 gap-2 sm:gap-4 flex-col md:flex-row">
          <div className="w-full md:w-1/3">
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-base sm:text-lg font-semibold mb-2">
                เกี่ยวกับ
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                ข้อมูลเกี่ยวกับ Teeratat Nakarin...
              </p>
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <h1 className="text-lg sm:text-xl font-semibold mb-4 bg-white p-2 rounded-md">
              โพสต์
            </h1>
            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200">
              {status === "loading" ? (
                <p className="text-gray-600 text-sm sm:text-base">
                  กำลังโหลด...
                </p>
              ) : session?.user?.posts && session.user.posts.length > 0 ? (
                <div className="mt-2 space-y-4">
                  {session.user.posts.map((post) => (
                    <Link
                      href={`/post/${post.id}`}
                      key={post.id}
                      className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:bg-gray-50 transition-colors"
                    >
                      {post.images && post.images.length > 0 ? (
                        <Image
                          src={post.images[0].url}
                          alt="Food"
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded-lg"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          ร้าน: {post.restaurantName}
                        </h3>
                        <h3 className="font-semibold">
                          อาหาร: {post.foodname}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          โดย: {post.user?.name || "ผู้ใช้ไม่ระบุชื่อ"}
                        </p>
                        <div className="text-yellow-500">
                          {"★".repeat(post.rating)}
                          {"☆".repeat(5 - post.rating)} ({post.rating}/5)
                        </div>
                        <p className="text-muted-foreground">
                          รีวิว: "{post.description}"
                        </p>
                        <div className="mt-2 flex gap-4">
                          <button className="text-muted-foreground hover:text-blue-600 hover:scale-110 transition-transform duration-200 ease-in-out">
                            👍{" "}
                            <span className="text-blue-600">
                              {post.likes?.length ?? 0}
                            </span>
                          </button>
                          <button className="text-muted-foreground hover:text-blue-600 hover:scale-110 transition-transform duration-200 ease-in-out">
                            💬{" "}
                            <span className="text-blue-600">
                              {post.comments?.length ?? 0}
                            </span>
                          </button>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm sm:text-base">
                  ยังไม่มีโพสต์
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
