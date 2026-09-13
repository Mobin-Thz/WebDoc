import config from "@payload-config";
import { draftMode, headers } from "next/headers";
import { NextResponse } from "next/server";
import { getPayload } from "payload";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const path = url.searchParams.get("path");
  if (
    !process.env.PREVIEW_SECRET ||
    secret !== process.env.PREVIEW_SECRET ||
    !path?.startsWith("/") ||
    path.startsWith("//")
  ) {
    return new NextResponse("Invalid preview request", { status: 403 });
  }
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: await headers() });
  if (!user)
    return new NextResponse("Authentication required", { status: 401 });
  (await draftMode()).enable();
  return NextResponse.redirect(new URL(path, url.origin));
}
