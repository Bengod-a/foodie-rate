"use client";

import React, { useEffect, useState } from "react";
import { DropdownMenuDemo } from "./DropdownMenuDemo";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Post from "../Post/Post";

const Navbar = () => {
  const session = useSession();
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    if (!session.data?.user.id) {
      session.update();
    }
  }, [session]);

  return (
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

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="ค้นหาร้านอาหาร..."
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 p-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
        />
        {session.data?.user ? (
          <Link
            href="/post"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg cursor-pointer"
          >
            โพสต์รีวิว
          </Link>
        ) : (
          <Link
            href="/AuthPage"
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg cursor-pointer"
          >
            เข้าสู่ระบบเพื่อโพสต์
          </Link>
        )}
      </div>
      <Post search={search} />
    </div>
  );
};

export default Navbar;
