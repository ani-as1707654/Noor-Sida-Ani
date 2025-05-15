import fs from "fs-extra";
import path from "path";
import prisma from "@/lib/prisma";

class SectionRepo {
  constructor() {
    this.sectionFilePath = path.join(process.cwd(), "data/sections.json");
  }

  // async #readSections() {
  //   return await fs.readJson(this.sectionFilePath);
  // }

  async getSectionById(sectionCRN) {
    return await prisma.section.findUnique({ where: { crn: sectionCRN } });
    // const sections = await this.#readSections();
    // return sections.find((section) => section.crn === sectionCRN);
  }

  async getSections(user, semesterId) {
    console.log("SectionRepo.getSections - Semester ID:", semesterId);

    if (!user) return [];

    // const sections = await this.#readSections();
    // First filter by semester
    // const semesterSections = sections.filter(
    //   (section) => section.semester === semesterId
    // );

    // Then filter by user role

    return await prisma.section.findMany({
      where: {
        ...(user.role === "Student"
          ? {
              students: {
                some: {
                  id: user.id,
                },
              },
            }
          : user.role === "Instructor"
          ? { instructorId: user.id }
          : { program: user.program }),
        semester: semesterId,
      },
    });

    if (user.isStudent) {
      // const studentSections = semesterSections.filter((section) =>
      //   user.registeredSections.map((s) => s.crn).includes(section.crn)
      // );
      // console.log("Student Sections:", studentSections);
      // return studentSections;
      return await prisma.section.findMany({
        where: {
          students: {
            some: {
              id: user.id,
            },
          },
          semester: semesterId,
        },
      });
    }

    if (user.isInstructor) {
      // return semesterSections.filter(
      //   (section) => section.instructorId === user.id
      // );
      return await prisma.section.findMany({
        where: {
          instructorId: user.id,
          semester: semesterId,
        },
      });
    }

    if (user.isCoordinator) {
      // return semesterSections.filter(
      //   (section) => section.program === user.program
      // );
      return await prisma.section.findMany({
        where: {
          program: user.program,
          semester: semesterId,
        },
      });
    }

    return [];
  }
}

export default new SectionRepo();
