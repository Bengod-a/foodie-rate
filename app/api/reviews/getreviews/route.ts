// import { NextResponse, NextRequest } from "next/server";
// import prisma from "../../../../lib/DB/prisma";

// export async function GET(req: NextRequest) {
//   try {
//     const post = await prisma.post.findMany({
//       include: {
//         images: true,
//         comments: true,
//         likes: true,
//         user: {
//           select: {
//             id: true,
//             name: true,
//           },
//         },
//       },
//     });

//     return NextResponse.json({ data: post }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//   }
// }


import { NextResponse } from "next/server";
import prisma from "../../../../lib/DB/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const reviews = await prisma.post.findMany({
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true } },
        images: true,
        likes: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalReviews = await prisma.post.count();
    const hasMore = page * limit < totalReviews; 

    return NextResponse.json(
      { data: reviews, hasMore },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการดึงรีวิว", error: error.message },
      { status: 500 }
    );
  }
}