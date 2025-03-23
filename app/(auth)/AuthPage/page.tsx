"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [formregister, setFormregister] = useState({
    name: "" as string,
    email: "" as string,
    password: "" as string,
    image: null as File | null,
  });
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const router = useRouter();

  const session = useSession();

  useEffect(() => {
    if (session.status === "authenticated") {
      router.push("/");
    }
  }, [session.status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (!res) {
        toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        return;
      }
      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success("ล็อกอินสำเร็จ");
      router.push("/");
    } catch (error: any) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const formdata = new FormData();
    formdata.append("name", formregister.name);
    formdata.append("email", formregister.email);
    formdata.append("password", formregister.password);
    if (formregister.image) {
      formdata.append("image", formregister.image);
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formdata,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("สมัครสมาชิกสำเร็จ");
        setActiveTab("login");
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const handleSocialSignIn = async (provider: "google") => {
    try {
      const result = await signIn(provider, { redirect: false });
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`เข้าสู่ระบบด้วย ${provider} สำเร็จ`);
        router.push("/");
      }
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message || `เกิดข้อผิดพลาดในการเข้าสู่ระบบด้วย ${provider}`
      );
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB)");
        return;
      }
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setFormregister({ ...formregister, image: file });
    }
  };

  const handleRemoveImage = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    setFormregister({ ...formregister, image: null });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 font-sans flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Foodie Rate</h1>
          <button className="text-muted-foreground">☰</button>
        </div>

        <div className="flex border-b border-border mb-6">
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "login"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("login")}
          >
            เข้าสู่ระบบ
          </button>
          <button
            className={`flex-1 py-2 text-center ${
              activeTab === "signup"
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("signup")}
          >
            ลงทะเบียน
          </button>
        </div>

        {activeTab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">อีเมล</label>
              <input
                type="email"
                placeholder="m@example.com"
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">รหัสผ่าน</label>
              <input
                type="text"
                placeholder="••••••••"
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                onChange={(e) => setPassword(e.target.value)}
              />
              <a
                href="#"
                className="text-muted-foreground text-sm mt-1 block underline"
              >
                ลืมรหัสผ่าน?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/80 transition-all duration-300"
            >
              เข้าสู่ระบบ
            </button>
            <div className="text-center text-muted-foreground my-4">หรือ</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSocialSignIn("google")}
                className="cursor-pointer flex-1 bg-secondary text-secondary-foreground py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all duration-300"
              >
                <Icon icon="flat-color-icons:google" width="24" height="24" />
                Google
              </button>
            </div>
          </form>
        )}

        {activeTab === "signup" && (
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">ชื่อผู้ใช้</label>
              <input
                type="text"
                placeholder="Ben CH"
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                onChange={(e) =>
                  setFormregister({ ...formregister, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">อีเมล</label>
              <input
                type="email"
                placeholder="m@example.com"
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                onChange={(e) =>
                  setFormregister({ ...formregister, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">รหัสผ่าน</label>
              <input
                type="text"
                placeholder="••••••••"
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                onChange={(e) =>
                  setFormregister({ ...formregister, password: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm mb-1">รูปโปรไฟล์</label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground"
                onChange={handleImageChange}
              />
              {previewImage && (
                <div className="mt-2 relative">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border border-border"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2 rounded-lg hover:bg-primary/80 transition-all duration-300"
            >
              ลงทะเบียน
            </button>
            <div className="text-center text-muted-foreground my-4">หรือ</div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleSocialSignIn("google")}
                className="cursor-pointer flex-1 bg-secondary text-secondary-foreground py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all duration-300"
              >
                <Icon icon="flat-color-icons:google" width="24" height="24" />
                Google
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
