import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs-extra";

const basePath = path.join(process.cwd(), "data");

async function main() {
  const prisma = new PrismaClient();
  await prisma.assessmentType.deleteMany();

  try {
    await seedAssessmentTypes(prisma);
    await seedNonStudentUsers(prisma);
    await seedSections(prisma);
    await seedStudents(prisma);
    await seedAssessments(prisma);
    await seedComments(prisma);
    await seedSemesters(prisma);
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedAssessmentTypes(prisma) {
  const dataFilePath = path.join(basePath, "assessment-types.json");
  const assessmentTypes = await fs.readJSON(dataFilePath);
  for (const type of assessmentTypes) {
    console.log("Creating assessment type:", type);
    await prisma.assessmentType.create({ data: type });
  }
}

async function seedNonStudentUsers(prisma) {
  const dataFilePath = path.join(basePath, "users.json");
  const users = await fs.readJSON(dataFilePath);
  const nonStudentUsers = users.filter((user) => user.role !== "Student");
  for (const user of nonStudentUsers) {
    delete user.registeredSections;
    console.log("Creating user:", user);
    // Only create if user doesn't exist in DB
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
}

async function seedSections(prisma) {
  const sectionsFilePath = path.join(basePath, "sections.json");
  const sections = await fs.readJSON(sectionsFilePath);
  for (const section of sections) {
    console.log("Creating section:", section);
    // Only create if section doesn't exist in DB
    await prisma.section.upsert({
      where: { crn: section.crn },
      update: {},
      create: section,
    });
  }
}

async function seedStudents(prisma) {
  const dataFilePath = path.join(basePath, "users.json");
  const users = await fs.readJSON(dataFilePath);
  const students = users.filter((user) => user.role == "Student");
  for (const student of students) {
    console.log("Creating student:", student);
    const { registeredSections, ...userData } = student;
    // If student doesn't exist in DB, create student
    // and connect sections
    await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        ...userData,
        registeredSections: {
          connect: registeredSections, // Connect sections by CRN
        },
      },
    });
  }
}

async function seedAssessments(prisma) {
  const assessmentsFilePath = path.join(basePath, "assessments.json");
  const assessments = await fs.readJSON(assessmentsFilePath);
  for (const assessment of assessments) {
    console.log("Creating assessments:", assessment);
    // Only create if section doesn't exist in DB
    await prisma.assessment.upsert({
      where: { id: assessment.id },
      update: {},
      create: assessment,
    });
  }
}

async function seedComments(prisma) {
  const commentsFilePath = path.join(basePath, "comments.json");
  const comments = await fs.readJSON(commentsFilePath);
  for (const comment of comments) {
    console.log("Creating comments:", comment);
    // Only create if section doesn't exist in DB
    await prisma.comment.upsert({
      where: { id: comment.id },
      update: {},
      create: {
        ...comment,
        createdDate: comment.createdDate + "T00:00:00.000Z",
      },
    });
  }
}

async function seedSemesters(prisma) {
  const semestersFilePath = path.join(basePath, "semesters.json");
  const semesters = await fs.readJSON(semestersFilePath);
  for (const semester of semesters) {
    console.log("Creating semesters:", semester);
    // Only create if section doesn't exist in DB
    await prisma.semester.upsert({
      where: { id: semester.id },
      update: {},
      create: semester,
    });
  }
}

await main();
