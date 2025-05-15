import fs from "fs-extra";
import path from "path";
import prisma from "@/lib/prisma";

// Define path to semesters data file
// const semesterFilePath = path.join(process.cwd(), "data/semesters.json");

export async function getSemesters() {
  // return fs.readJson(semesterFilePath);
  return await prisma.semester.findMany();
}

export async function getDefaultSemesterId() {
  // const semesters = await getSemesters();
  // const defaultSemester = semesters.find((semester) => semester.isDefault);
  // return defaultSemester?.id || null;
  return await prisma.semester.findFirst({ where: { isDefault: true } });
}
