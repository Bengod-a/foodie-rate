import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import prisma from "../../../lib/DB/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/Auth";
import { revalidatePath } from "next/cache";
import { Icon } from "@iconify/react";
import { Button } from "../../../components/ui/button";
import { toast } from "react-toastify";

type Props = {
  params: Promise<{ id: string }>;
};

const PostPage = async ({ params }: Props) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user.id;
  const resolvedParams = await params;

  const post = await prisma.post.findUnique({
    where: { id: resolvedParams.id },
    include: {
      images: true,
      likes: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
      user: { select: { id: true, name: true, email: true, image: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const handleLike: any = async () => {
    "use server";
    if (!userId) {
      redirect("/AuthPage");
    }
    try {
      const existingLike = await prisma.like.findFirst({
        where: {
          postId: resolvedParams.id,
          userId: userId,
        },
      });

      if (existingLike) {
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });
      } else {
        await prisma.like.create({
          data: {
            postId: resolvedParams.id,
            userId: userId,
          },
        });
      }

      revalidatePath(`/post/${resolvedParams.id}`);
      return { success: true, existingLike };
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการกดถูกใจ:", error);
      return { success: false };
    }
  };

  const handleComment: any = async (formData: FormData) => {
    "use server";
    if (!userId) {
      redirect("/AuthPage");
    }
    const content = formData.get("comment") as string;
    try {
      if (content.length === 0) {
        toast.warning("กรุณากรอกข้อความก่อน");
        return;
      }
      await prisma.comment.create({
        data: {
          text: content,
          postId: post.id,
          userId: Number(userId),
          createdAt: new Date(),
        },
      });
      revalidatePath(`/post/${resolvedParams.id}`);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false };
    }
  };

  const existingLike = await prisma.like.findFirst({
    where: {
      postId: resolvedParams.id,
      userId: userId,
    },
  });

  

  return (
    <div className="w-full min-h-screen text-foreground p-6 font-sans bg-[url('/Home_1.png')] bg-cover bg-center bg-no-repeat">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-4xl font-bold text-primary">
            ร้าน {post.restaurantName}
          </h1>
          <h1 className="text-4xl font-bold text-primary">
            อาหาร {post.foodname}
          </h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="text-yellow-500 text-xl">
              {"★".repeat(post.rating)}
              {"☆".repeat(5 - post.rating)}
            </div>
            <span className="text-sm text-muted-foreground">
              ({post.rating}/5)
            </span>
            <p className="text-sm text-muted-foreground">
              โดย: <span className="font-medium">{post.user.name}</span>
            </p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            โพสต์เมื่อ:
            {format(new Date(post.createdAt), "d MMMM yyyy", { locale: th })}
          </p>
        </div>

        {post.images.length > 0 ? (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">รูปภาพ</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {post.images.map(
                (image) =>
                  image.url && (
                    <Image
                      key={image.id}
                      src={image.url}
                      alt="รูปภาพร้านอาหาร"
                      width={250}
                      height={250}
                      className="object-cover rounded-lg shadow-sm"
                    />
                  )
              )}
            </div>
          </div>
        ) : (
          <div className="mb-6 bg-muted p-6 rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">ไม่มีรูปภาพสำหรับโพสต์นี้</p>
          </div>
        )}

        <div className="bg-card p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-semibold mb-3">รายละเอียดรีวิว</h2>
          <p className="text-foreground">{post.description}</p>
          <p className="text-foreground mt-3">
            <span className="font-semibold">สถานที่:</span> {post.location}
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <form action={handleLike}>
            <button
              type="submit"
              className="flex items-center gap-1 text-muted-foreground hover:text-primary  hover:scale-110 transition-transform duration-200 ease-in-out"
            >
              {existingLike ? (
                <Icon
                  icon="iconamoon:like"
                  width="24"
                  height="24"
                  color="blue"
                />
              ) : (
                <Icon icon="iconamoon:like" width="24" height="24" />
              )}

              <span className="text-primary font-medium">
                {post.likes.length}
              </span>
            </button>
          </form>
          <button className="flex items-center gap-1 text-muted-foreground">
            💬
            <span className="text-primary font-medium">
              {post.comments?.length ?? 0}
            </span>
          </button>
        </div>

        <div className="bg-card p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">ความคิดเห็น</h2>
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 bg-background rounded-lg border border-border"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {comment.user?.image ? (
                      <img
                        src={comment.user.image}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                        {comment.user.name ? comment.user.name[0] : ""}
                      </div>
                    )}

                    <p className="text-sm font-medium">{comment.user.name}</p>
                  </div>
                  <p className="text-foreground">{comment.text}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(comment.createdAt), "d MMMM yyyy", {
                      locale: th,
                    })}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">ยังไม่มีความคิดเห็น</p>
          )}

          {session ? (
            <form action={handleComment} className="mt-6">
              <textarea
                name="comment"
                placeholder="เขียนความคิดเห็น..."
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
              <Button
                type="submit"
                className="mt-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
              >
                ส่งความคิดเห็น
              </Button>
            </form>
          ) : (
            <p className="mt-6 text-muted-foreground">
              กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostPage;
