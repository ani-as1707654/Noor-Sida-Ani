-- CreateTable
CREATE TABLE "Assessment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sectionCRN" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "dueDate" TEXT NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effortHours" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    CONSTRAINT "Assessment_sectionCRN_fkey" FOREIGN KEY ("sectionCRN") REFERENCES "Section" ("crn") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Assessment_type_fkey" FOREIGN KEY ("type") REFERENCES "AssessmentType" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sectionCRN" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "replyToCommentId" INTEGER,
    CONSTRAINT "Comment_sectionCRN_fkey" FOREIGN KEY ("sectionCRN") REFERENCES "Section" ("crn") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_replyToCommentId_fkey" FOREIGN KEY ("replyToCommentId") REFERENCES "Comment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL
);
