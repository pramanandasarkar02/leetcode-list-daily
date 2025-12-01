import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json(); // { pid, dailyCount, daily }

  const dataDir = path.join(process.cwd(), "data");
  const filePath = path.join(dataDir, "problemStatus.json");

  const existing = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const filtered = existing.filter((item: any) => item.pid !== body.pid);
  filtered.push(body);

  fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));

  return NextResponse.json({ success: true, message: "Status updated" });
}
