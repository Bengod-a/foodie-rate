import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/DB/prisma";

export async function GET(req: NextRequest, { params }: any) {
  try {
    const { id } = await params.id;

    const post = await prisma.post.findUnique({
      where: { id: id },
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


    return NextResponse.json({ post })
  } catch (error) {
    console.log(error);
  }
}
