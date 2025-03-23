import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/DB/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/Auth";
import { uploadFilepost } from "../../../lib/DB/uploadFilepost";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "ไม่ได้รับอนุญาต" }, { status: 401 });
    }

    const formData = await req.formData();
    const restaurantName = formData.get("restaurantName") as string;
    const foodname = formData.get("foodname") as string;
    const location = formData.get("location") as string;
    const ratingRaw = formData.get("rating") as string;
    const description = formData.get("description") as string;
    const images = formData.getAll("images") as File[] | null
    const userId =Number(session.user.id) as number

    if (isNaN(userId)) {
      return NextResponse.json(
        { message: "User ID ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (!restaurantName || !location || !ratingRaw || !description) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    const rating = parseFloat(ratingRaw);
    if (isNaN(rating)) {
      return NextResponse.json(
        { message: "Rating ต้องเป็นตัวเลข" },
        { status: 400 }
      );
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { message: "Rating ต้องอยู่ระหว่าง 1-5" },
        { status: 400 }
      );
    }

    const existingPost = await prisma.post.findUnique({
      where: { restaurantName },
    });

    if (existingPost) {
      return NextResponse.json(
        { message: "มีชื่อร้านนี้แล้ว" },
        { status: 400 }
      );
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!userExists) {
      return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        restaurantName,
        foodname: foodname || '',
        location,
        rating,
        description,
        userId,
      },
    });

    if (images && images.length > 0 && images[0].size > 0) {
      const imageData = [];
      for (const image of images) {
        try {
          const imageUrl = await uploadFilepost(image);
          if (imageUrl) {
            imageData.push({
              url: imageUrl,
              postId: newPost.id,
            });
          }
        } catch (uploadError: any) {
          console.error("Error uploading image:", uploadError.message);
          //   continue;
        }
      }

      if (imageData.length > 0) {
        await prisma.image.createMany({
          data: imageData,
        });
      }
    }

    return NextResponse.json(
      { message: "โพสต์รีวิวสำเร็จ", post: newPost },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating post:", {
      error: error.message,
      stack: error.stack,
      details: error,
    });
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด", error: error.message },
      { status: 500 }
    );
  }
}
