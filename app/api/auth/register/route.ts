import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/DB/prisma";
import { hash } from "bcryptjs";
import { uploadProfile } from "../../../../lib/DB/ProfileUser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const image = formData.get("image") as File | null;

    if (!name || !email || !password) return NextResponse.json({message: 'กรุณากรอกข้อมูลให้ครบ'}, { status: 400 })

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) return NextResponse.json({ message: "Email ถูกใช้งานแล้ว" }, { status: 400 });

    const haspassword = await hash(password, 10);


    const image_url = image ? await uploadProfile(image) : undefined


    const newuser = await prisma.user.create({
      data: {
        name,
        email,
        password: haspassword,
        image: image ? image_url : undefined
      },
    });

    return NextResponse.json({data: newuser}, { status: 200 })
  } catch (error) {
    console.log(error);
  }
}
