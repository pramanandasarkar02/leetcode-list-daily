import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();

  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "problems.json");

  const existing = JSON.parse(fs.readFileSync(filePath, "utf8"));
  existing.push(body);

  fs.writeFileSync(filePath, JSON.stringify(existing, null, 2));

  return NextResponse.json({ success: true, message: "Problem added" });
}
