import fs from "fs-extra";
import path from "path";
import prisma from "@/lib/prisma";
import sectionRepo from "@/app/_repo/SectionRepo";
import { capitalize } from "@/app/actions/utils";

class AssessmentRepo {
  async getAssessmentTypes() {
    return await prisma.assessmentType.findMany();
    //const filePath = path.join(process.cwd(), "data/assessment-types.json");
    //return fs.readJson(filePath);
  }

  // constructor() {
  //   this.assessmentFilePath = path.join(process.cwd(), "data/assessments.json");
  // }

  // async #readAssessments() {
  //   return fs.readJson(this.assessmentFilePath);
  // }

  // async #writeAssessments(assessments) {
  //   await fs.writeJson(this.assessmentFilePath, assessments);
  // }

  async getAssessmentById(id) {
    return await prisma.assessment.findUnique({ where: { id: +id } });
    // const assessments = await this.#readAssessments();
    // return assessments.find((a) => a.id == id);
  }

  async getAssessmentsBySection(sectionCRN) {
    return await prisma.assessment.findMany({ where: { sectionCRN } });
    // const assessments = await this.#readAssessments();
    // return assessments.filter((a) => a.sectionCRN === sectionCRN);
  }

  async countAssessmentsByType(sectionCRN, type) {
    return await prisma.assessment.count({
      where: { sectionCRN, type },
    });
    // const assessments = await this.getAssessmentsBySection(sectionCRN);
    // return assessments.filter((a) => a.type === type).length;
  }

  async countAssessmentsByDueDate(sectionCRN, dueDate) {
    return await prisma.assessment.count({
      where: { sectionCRN, dueDate },
    });
    // const assessments = await this.getAssessmentsBySection(sectionCRN);
    // return assessments.filter((a) => a.dueDate === dueDate).length;
  }

  // async #getUserAssessments(user, semesterId) {
  //   return await prisma.assessment.findMany({
  //     where: {
  //       section: {
  //         students: {
  //           some: {
  //             id: user.id,
  //           },
  //         },
  //       },
  //     },
  //   });
  //   // const userSections = await sectionRepo.getSections(user, semesterId);
  //   // const sectionCRNs = userSections.map((s) => s.crn);
  //   // const assessments = await this.#readAssessments();
  //   // return assessments.filter((a) => sectionCRNs.includes(a.sectionCRN));
  // }

  async getAssessments(user, semester, sectionCRN) {
    if (!user && (!sectionCRN || sectionCRN === "all")) return [];
    return await prisma.assessment.findMany({
      where:
        sectionCRN && sectionCRN !== "all"
          ? { sectionCRN }
          : {
              section: {
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
                semester: semester.id,
              },
            },
      orderBy: {
        sectionCRN: "asc",
      },
      include: {
        section: true,
      },
    });
    // const assessments =
    //   sectionCRN && sectionCRN !== "all"
    //     ? await this.getAssessmentsBySection(sectionCRN)
    //     : await this.#getUserAssessments(user, semesterId);

    // // Sort by section CRN
    // assessments.sort((a, b) => a.sectionCRN.localeCompare(b.sectionCRN));

    // // Enrich with section data
    // for (const assessment of assessments) {
    //   assessment.section = await sectionRepo.getSectionById(
    //     assessment.sectionCRN
    //   );
    // }

    // return assessments;
  }

  async addAssessment(assessment) {
    return await prisma.assessment.create({ data: assessment });
    // assessment.id = Date.now();
    // const assessments = await this.#readAssessments();
    // assessments.push(assessment);
    // await this.#writeAssessments(assessments);
    // return assessment;
  }

  async updateAssessment(updatedAssessment) {
    return await prisma.assessment.update({
      where: { id: updatedAssessment.id },
      data: updatedAssessment,
    });
    // const assessments = await this.#readAssessments();
    // const index = assessments.findIndex((a) => a.id === updatedAssessment.id);

    // if (index === -1) throw new Error("Assessment not found");

    // assessments[index] = updatedAssessment;
    // await this.#writeAssessments(assessments);
    // return updatedAssessment;
  }

  async deleteAssessment(id) {
    return await prisma.assessment.delete({ where: { id } });
    // const assessments = await this.#readAssessments();
    // const updatedAssessments = assessments.filter((a) => a.id !== id);
    // await this.#writeAssessments(updatedAssessments);
  }

  async generateAssessmentTitle(sectionCRN, type) {
    const count = (await this.countAssessmentsByType(sectionCRN, type)) + 1;
    return type === "project"
      ? `Project Phase ${count}`
      : `${capitalize(type)} ${count}`;
  }

  async getAssessmentSummary(user, semester) {
    console.log("semesterId", semester);
    // const assessments = await this.getAssessments(user, semesterId, "all");
    // Group assessments by sectionCRN and type then compute
    // the count and total effort hours
    // const summary = assessments.reduce((acc, assessment) => {
    //   const key = `${assessment.sectionCRN}-${assessment.type}`;

    //   if (!acc[key]) {
    //     acc[key] = {
    //       sectionCRN: assessment.sectionCRN,
    //       courseName: `${assessment.section.courseCode} - ${assessment.section.courseName}`,
    //       type: assessment.type,
    //       count: 0,
    //       effortHours: 0,
    //     };
    //   }

    //   acc[key].count += 1;
    //   acc[key].effortHours += assessment.effortHours;
    //   return acc;
    // }, {});

    const assessmentAggregates = await prisma.assessment.groupBy({
      by: ["sectionCRN", "type"],
      where: {
        section: {
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
          semester: semester.id,
        },
      },
      _count: { id: true },
      _sum: { effortHours: true },
    });
    const sections = await prisma.section.findMany({
      where: {
        crn: {
          in: [...new Set(assessmentAggregates.map((a) => a.sectionCRN))],
        },
      },
      select: {
        crn: true,
        courseCode: true,
        courseName: true,
      },
    });
    const summary = assessmentAggregates.reduce((acc, agg) => {
      const key = `${agg.sectionCRN}-${agg.type}`;
      const section = sections.find((s) => s.crn === agg.sectionCRN);
      return {
        ...acc,
        [key]: {
          sectionCRN: agg.sectionCRN,
          courseName: `${section.courseCode} - ${section.courseName}`,
          type: agg.type,
          count: agg._count.id,
          effortHours: agg._sum.effortHours || 0,
        },
      };
    }, {});

    console.log("Assessment Summary:", Object.values(summary));
    return Object.values(summary);
  }
}

export default new AssessmentRepo();
