import { db } from "@/db";

export async function GET(request: Request, props: { params: Promise<{ email: string }> }) {
  const params = await props.params;
  const user = await db.user.findUnique({
    where: {
      email: params.email,
    },
  });

  if (user) {
    return Response.json({ name: user.name, image: user.image });
  }
  return Response.json({
    name: "unknown",
    image:
      "https://img.freepik.com/premium-vector/man-avatar-profile-picture-vector-illustration_268834-538.jpg",
  });
}
