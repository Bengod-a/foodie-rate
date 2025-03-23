import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

export function DropdownMenuDemo() {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (!session.data?.user.id) {
      session.update();
    }
  });

  const handleSignOut = async () => {
    try {
      await signOut({ redirect: false });
      toast.success("ออกจากระบบสำเร็จ");
      router.push("/AuthPage");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="">
          {session.data?.user.image ? (
            <Image
              src={session.data?.user.image}
              alt="Profile"
              width={30}
              height={30}
              className="rounded-full"
            />
          ) : (
            <Image
              src="/user-avatar-coffee.png"
              alt="Profile"
              width={30}
              height={30}
              className="rounded-full"
            />
          )}
        </div>
      </DropdownMenuTrigger>
      {session.data?.user && (
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              Profile
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Settings
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
            <Link href="/user/myposts">
              <DropdownMenuItem>
                My Posts
                <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup></DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuItem disabled>API</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      )}
      {!session.data?.user && (
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href='/AuthPage'>
          <DropdownMenuItem>เข้าสู่ระบบ</DropdownMenuItem>
          </Link>
          <DropdownMenuItem disabled>API</DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
