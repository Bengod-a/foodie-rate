import { NextResponse } from "next/server";
import prisma from "../../../../../lib/DB/prisma";

export async function GET(request: Request, { params }: any) {
  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        posts: {
          include: {
            user: true,
            likes: true,
            comments: true,
            images: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profilePicture: user.image || null,
      posts: user.posts,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
