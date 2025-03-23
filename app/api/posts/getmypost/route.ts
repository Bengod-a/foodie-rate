import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../../../lib/Auth";
import prisma from "../../../../lib/DB/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const userId = Number(session.user.id);

    const mypost = await prisma.post.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        restaurantName: true,
        foodname: true,
        rating: true,
        description: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
        likes: true,
        comments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totalPosts = await prisma.post.count({
      where: {
        userId: userId,
      },
    });
    const hasMore = page * limit < totalPosts;

    return NextResponse.json({ data: mypost, hasMore }, { status: 200 });
  } catch (error) {
    console.error(error);
  }
}