import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: NextRequest) {
    const openIdConfig = await auth.api.getOpenIdConfig();
    return NextResponse.json(openIdConfig);
}