import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const dataDir = path.join(process.cwd(), "data");

  const problems = JSON.parse(
    fs.readFileSync(path.join(dataDir, "problems.json"), "utf8")
  );
  const status = JSON.parse(
    fs.readFileSync(path.join(dataDir, "problemStatus.json"), "utf8")
  );

  return NextResponse.json({ problems, status });
}
