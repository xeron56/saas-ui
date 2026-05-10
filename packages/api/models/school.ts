/* tslint:disable */
/* eslint-disable */

import { BlobBlobFile } from './blob-blob-file';
import { OperationBooleanFilterOperators } from './operation-boolean-filter-operators';
import { OperationDateFilterOperators } from './operation-date-filter-operators';
import { OperationStringFilterOperation } from './operation-string-filter-operation';

export interface V1AcademicSession {
  id?: string;
  code?: string;
  name?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  leftLogo?: BlobBlobFile;
  rightLogo?: BlobBlobFile;
  sign?: BlobBlobFile;
  backgroundImage?: BlobBlobFile;
}

export interface V1CreateAcademicSessionRequest {
  code: string;
  name: string;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}

export interface V1UpdateAcademicSession {
  id: string;
  code?: string;
  name?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  isActive?: boolean;
}

export interface AcademicSessionServiceUpdateAcademicSessionRequest {
  session?: V1UpdateAcademicSession;
  updateMask?: string;
}

export interface V1AcademicSessionFilter {
  id?: OperationStringFilterOperation;
  code?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
}

export interface V1ListAcademicSessionRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1AcademicSessionFilter;
}

export interface V1ListAcademicSessionReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1AcademicSession>;
}

export interface V1DeleteAcademicSessionReply {
  id?: string;
  code?: string;
}

export interface V1HolidayType {
  id?: string;
  name?: string;
  isDefault?: boolean;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateHolidayTypeRequest {
  name: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface V1UpdateHolidayType {
  id: string;
  name?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface HolidayTypeServiceUpdateHolidayTypeRequest {
  holidayType?: V1UpdateHolidayType;
  updateMask?: string;
}

export interface V1HolidayTypeFilter {
  id?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
  isDefault?: OperationBooleanFilterOperators;
  isActive?: OperationBooleanFilterOperators;
}

export interface V1ListHolidayTypeRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1HolidayTypeFilter;
}

export interface V1ListHolidayTypeReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1HolidayType>;
}

export interface V1DeleteHolidayTypeReply {
  id?: string;
  name?: string;
}

export interface V1SchoolHoliday {
  id?: string;
  academicSessionId?: string;
  holidayTypeId?: string;
  fromDate?: string | null;
  toDate?: string | null;
  description?: string;
  frontSite?: boolean;
  color?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateSchoolHolidayRequest {
  academicSessionId: string;
  holidayTypeId: string;
  fromDate: string | null;
  toDate: string | null;
  description: string;
  frontSite?: boolean;
  color?: string;
}

export interface V1UpdateSchoolHoliday {
  id: string;
  academicSessionId?: string;
  holidayTypeId?: string;
  fromDate?: string | null;
  toDate?: string | null;
  description?: string;
  frontSite?: boolean;
  color?: string;
}

export interface SchoolHolidayServiceUpdateSchoolHolidayRequest {
  holiday?: V1UpdateSchoolHoliday;
  updateMask?: string;
}

export interface V1SchoolHolidayFilter {
  id?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  holidayTypeId?: OperationStringFilterOperation;
  fromDate?: OperationDateFilterOperators;
  toDate?: OperationDateFilterOperators;
  frontSite?: OperationBooleanFilterOperators;
}

export interface V1ListSchoolHolidayRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1SchoolHolidayFilter;
}

export interface V1ListSchoolHolidayReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1SchoolHoliday>;
}

export interface V1DeleteSchoolHolidayReply {
  id?: string;
  description?: string;
}

export interface V1Class {
  id?: string;
  code?: string;
  name?: string;
  sequence?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateClassRequest {
  code: string;
  name: string;
  sequence?: number;
}

export interface V1UpdateClass {
  id: string;
  code?: string;
  name?: string;
  sequence?: number;
}

export interface ClassServiceUpdateClassRequest {
  class?: V1UpdateClass;
  updateMask?: string;
}

export interface V1ClassFilter {
  id?: OperationStringFilterOperation;
  code?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
}

export interface V1ListClassRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1ClassFilter;
}

export interface V1ListClassReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1Class>;
}

export interface V1DeleteClassReply {
  id?: string;
  code?: string;
}

export interface V1Section {
  id?: string;
  code?: string;
  name?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateSectionRequest {
  code: string;
  name: string;
}

export interface V1UpdateSection {
  id: string;
  code?: string;
  name?: string;
}

export interface SectionServiceUpdateSectionRequest {
  section?: V1UpdateSection;
  updateMask?: string;
}

export interface V1SectionFilter {
  id?: OperationStringFilterOperation;
  code?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
}

export interface V1ListSectionRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1SectionFilter;
}

export interface V1ListSectionReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1Section>;
}

export interface V1DeleteSectionReply {
  id?: string;
  code?: string;
}

export interface V1ClassSection {
  id?: string;
  academicSessionId?: string;
  classId?: string;
  sectionId?: string;
  code?: string;
  capacity?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateClassSectionRequest {
  academicSessionId: string;
  classId: string;
  sectionId: string;
  code?: string;
  capacity?: number;
}

export interface V1UpdateClassSection {
  id: string;
  academicSessionId?: string;
  classId?: string;
  sectionId?: string;
  code?: string;
  capacity?: number;
}

export interface ClassSectionServiceUpdateClassSectionRequest {
  classSection?: V1UpdateClassSection;
  updateMask?: string;
}

export interface V1ClassSectionFilter {
  id?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  classId?: OperationStringFilterOperation;
  sectionId?: OperationStringFilterOperation;
  code?: OperationStringFilterOperation;
}

export interface V1ListClassSectionRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1ClassSectionFilter;
}

export interface V1ListClassSectionReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1ClassSection>;
}

export interface V1DeleteClassSectionReply {
  id?: string;
  code?: string;
}

export interface V1Subject {
  id?: string;
  name?: string;
  code?: string;
  type?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateSubjectRequest {
  name: string;
  code?: string;
  type: string;
}

export interface V1UpdateSubject {
  id: string;
  name?: string;
  code?: string;
  type?: string;
}

export interface SubjectServiceUpdateSubjectRequest {
  subject?: V1UpdateSubject;
  updateMask?: string;
}

export interface V1SubjectFilter {
  id?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
  code?: OperationStringFilterOperation;
  type?: OperationStringFilterOperation;
}

export interface V1ListSubjectRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1SubjectFilter;
}

export interface V1ListSubjectReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1Subject>;
}

export interface V1DeleteSubjectReply {
  id?: string;
  name?: string;
}

export interface V1SubjectGroup {
  id?: string;
  academicSessionId?: string;
  name?: string;
  description?: string;
  subjectIds?: Array<string>;
  classSectionIds?: Array<string>;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateSubjectGroupRequest {
  academicSessionId: string;
  name: string;
  description?: string;
  subjectIds: Array<string>;
  classSectionIds: Array<string>;
}

export interface V1UpdateSubjectGroup {
  id: string;
  academicSessionId?: string;
  name?: string;
  description?: string;
  subjectIds?: Array<string>;
  classSectionIds?: Array<string>;
}

export interface SubjectGroupServiceUpdateSubjectGroupRequest {
  subjectGroup?: V1UpdateSubjectGroup;
  updateMask?: string;
}

export interface V1SubjectGroupFilter {
  id?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
}

export interface V1ListSubjectGroupRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1SubjectGroupFilter;
}

export interface V1ListSubjectGroupReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1SubjectGroup>;
}

export interface V1DeleteSubjectGroupReply {
  id?: string;
  name?: string;
}

export interface V1SubjectGroupStudent {
  subjectGroupStudentId?: string;
  studentEnrollmentId?: string;
  studentId?: string;
  admissionNo?: string;
  rollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  assigned?: boolean;
}

export interface V1ListSubjectGroupStudentsReply {
  subjectGroupId?: string;
  classSectionId?: string;
  items?: Array<V1SubjectGroupStudent>;
}

export interface V1AssignSubjectGroupStudentsRequest {
  subjectGroupId: string;
  classSectionId: string;
  studentEnrollmentIds: Array<string>;
}

export interface V1SubjectTimetable {
  id?: string;
  academicSessionId?: string;
  classSectionId?: string;
  subjectGroupId?: string;
  subjectId?: string;
  staffId?: string;
  day?: string;
  timeFrom?: string;
  timeTo?: string;
  startTime?: string;
  endTime?: string;
  roomNo?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateSubjectTimetableRequest {
  academicSessionId: string;
  classSectionId: string;
  subjectGroupId: string;
  subjectId: string;
  staffId: string;
  day: string;
  timeFrom: string;
  timeTo: string;
  roomNo?: string;
}

export interface V1UpdateSubjectTimetable {
  id: string;
  academicSessionId?: string;
  classSectionId?: string;
  subjectGroupId?: string;
  subjectId?: string;
  staffId?: string;
  day?: string;
  timeFrom?: string;
  timeTo?: string;
  roomNo?: string;
}

export interface SubjectTimetableServiceUpdateSubjectTimetableRequest {
  timetable?: V1UpdateSubjectTimetable;
  updateMask?: string;
}

export interface V1SubjectTimetableFilter {
  id?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  classSectionId?: OperationStringFilterOperation;
  subjectGroupId?: OperationStringFilterOperation;
  subjectId?: OperationStringFilterOperation;
  staffId?: OperationStringFilterOperation;
  day?: OperationStringFilterOperation;
}

export interface V1ListSubjectTimetableRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1SubjectTimetableFilter;
}

export interface V1ListSubjectTimetableReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1SubjectTimetable>;
}

export interface V1DeleteSubjectTimetableReply {
  id?: string;
  day?: string;
  timeFrom?: string;
  timeTo?: string;
}

export interface V1Homework {
  id?: string;
  academicSessionId?: string;
  classSectionId?: string;
  subjectGroupId?: string;
  subjectId?: string;
  staffId?: string;
  title?: string;
  description?: string;
  homeworkDate?: string | null;
  submitDate?: string | null;
  maxMarks?: number;
  visibleToStudent?: boolean;
  file?: BlobBlobFile;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateHomeworkRequest {
  academicSessionId: string;
  classSectionId: string;
  subjectGroupId: string;
  subjectId: string;
  staffId: string;
  title: string;
  description?: string;
  homeworkDate: string | null;
  submitDate: string | null;
  maxMarks?: number;
  visibleToStudent?: boolean;
}

export interface V1UpdateHomework {
  id: string;
  academicSessionId?: string;
  classSectionId?: string;
  subjectGroupId?: string;
  subjectId?: string;
  staffId?: string;
  title?: string;
  description?: string;
  homeworkDate?: string | null;
  submitDate?: string | null;
  maxMarks?: number;
  visibleToStudent?: boolean;
}

export interface HomeworkServiceUpdateHomeworkRequest {
  homework?: V1UpdateHomework;
  updateMask?: string;
}

export interface V1HomeworkFilter {
  id?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  classSectionId?: OperationStringFilterOperation;
  subjectGroupId?: OperationStringFilterOperation;
  subjectId?: OperationStringFilterOperation;
  staffId?: OperationStringFilterOperation;
  homeworkDate?: OperationDateFilterOperators;
  submitDate?: OperationDateFilterOperators;
  visibleToStudent?: OperationBooleanFilterOperators;
}

export interface V1ListHomeworkRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1HomeworkFilter;
}

export interface V1ListHomeworkReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1Homework>;
}

export interface V1ListMyHomeworkRequest {
  pageOffset?: number;
  pageSize?: number;
}

export interface V1ListMyHomeworkReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1MyHomework>;
}

export interface V1MyHomework {
  homework?: V1Homework;
  student?: V1HomeworkStudent;
}

export interface V1DeleteHomeworkReply {
  id?: string;
  title?: string;
}

export interface V1ListHomeworkStudentRequest {
  homeworkId: string;
}

export interface V1ListHomeworkStudentReply {
  homeworkId?: string;
  items?: Array<V1HomeworkStudent>;
}

export interface V1HomeworkStudent {
  studentId?: string;
  studentEnrollmentId?: string;
  admissionNo?: string;
  rollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  submission?: V1HomeworkSubmission;
  evaluation?: V1HomeworkEvaluation;
}

export interface V1SubmitHomeworkRequest {
  homeworkId: string;
  studentEnrollmentId: string;
  message: string;
}

export interface V1SubmitMyHomeworkRequest {
  studentId: string;
  homeworkId: string;
  message: string;
}

export interface V1HomeworkSubmission {
  id?: string;
  homeworkId?: string;
  studentEnrollmentId?: string;
  studentId?: string;
  message?: string;
  file?: BlobBlobFile;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1DeleteHomeworkSubmissionReply {
  id?: string;
}

export interface V1SaveHomeworkEvaluationsRequest {
  homeworkId: string;
  staffId: string;
  evaluationDate: string | null;
  items?: Array<V1HomeworkEvaluationInput>;
}

export interface V1HomeworkEvaluationInput {
  studentEnrollmentId: string;
  marks?: number;
  note?: string;
  status?: string;
}

export interface V1HomeworkEvaluation {
  id?: string;
  homeworkId?: string;
  studentEnrollmentId?: string;
  studentId?: string;
  staffId?: string;
  marks?: number;
  note?: string;
  evaluationDate?: string | null;
  status?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1DailyAssignment {
  id?: string;
  studentEnrollmentId?: string;
  studentId?: string;
  subjectGroupId?: string;
  subjectId?: string;
  title?: string;
  description?: string;
  assignmentDate?: string | null;
  evaluatedByStaffId?: string;
  evaluationDate?: string | null;
  remark?: string;
  file?: BlobBlobFile;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateDailyAssignmentRequest {
  studentEnrollmentId: string;
  subjectGroupId: string;
  subjectId: string;
  title: string;
  description?: string;
  assignmentDate: string | null;
}

export interface V1UpdateDailyAssignment {
  id: string;
  studentEnrollmentId?: string;
  subjectGroupId?: string;
  subjectId?: string;
  title?: string;
  description?: string;
  assignmentDate?: string | null;
}

export interface DailyAssignmentServiceUpdateDailyAssignmentRequest {
  assignment?: V1UpdateDailyAssignment;
  updateMask?: string;
}

export interface V1EvaluateDailyAssignmentRequest {
  id: string;
  staffId: string;
  evaluationDate: string | null;
  remark?: string;
}

export interface V1DailyAssignmentFilter {
  id?: OperationStringFilterOperation;
  studentEnrollmentId?: OperationStringFilterOperation;
  subjectGroupId?: OperationStringFilterOperation;
  subjectId?: OperationStringFilterOperation;
  evaluatedByStaffId?: OperationStringFilterOperation;
  assignmentDate?: OperationDateFilterOperators;
  evaluationDate?: OperationDateFilterOperators;
}

export interface V1ListDailyAssignmentRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1DailyAssignmentFilter;
}

export interface V1ListDailyAssignmentReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1DailyAssignment>;
}

export interface V1ListMyDailyAssignmentRequest {
  pageOffset?: number;
  pageSize?: number;
}

export interface V1ListMyDailyAssignmentReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1DailyAssignment>;
}

export interface V1ListMyDailyAssignmentOptionsRequest {}

export interface V1ListMyDailyAssignmentOptionsReply {
  students?: Array<V1MyDailyAssignmentStudentOptions>;
}

export interface V1MyDailyAssignmentStudentOptions {
  studentId?: string;
  studentEnrollmentId?: string;
  admissionNo?: string;
  rollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  subjectGroups?: Array<V1MyDailyAssignmentSubjectGroupOption>;
}

export interface V1MyDailyAssignmentSubjectGroupOption {
  subjectGroupId?: string;
  name?: string;
  subjects?: Array<V1MyDailyAssignmentSubjectOption>;
}

export interface V1MyDailyAssignmentSubjectOption {
  subjectId?: string;
  name?: string;
  code?: string;
  type?: string;
}

export interface V1CreateMyDailyAssignmentRequest {
  studentId: string;
  subjectGroupId: string;
  subjectId: string;
  title: string;
  description?: string;
  assignmentDate: string | null;
}

export interface V1UpdateMyDailyAssignmentRequest {
  id: string;
  subjectGroupId: string;
  subjectId: string;
  title: string;
  description?: string;
  assignmentDate: string | null;
  updateMask?: string;
}

export interface V1DeleteMyDailyAssignmentRequest {
  id: string;
}

export interface V1DeleteDailyAssignmentReply {
  id?: string;
  title?: string;
}

export interface V1ExamGroup {
  id?: string;
  name?: string;
  examType?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateExamGroupRequest {
  name: string;
  examType: string;
  description?: string;
  isActive?: boolean;
}

export interface V1UpdateExamGroup {
  id: string;
  name: string;
  examType: string;
  description?: string;
  isActive?: boolean;
}

export interface ExamGroupServiceUpdateExamGroupRequest {
  examGroup?: V1UpdateExamGroup;
  updateMask?: string;
}

export interface V1ExamGroupFilter {
  id?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
  examType?: OperationStringFilterOperation;
  isActive?: OperationBooleanFilterOperators;
}

export interface V1ListExamGroupRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1ExamGroupFilter;
}

export interface V1ListExamGroupReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1ExamGroup>;
}

export interface V1DeleteExamGroupReply {
  id?: string;
  name?: string;
}

export interface V1ExamGrade {
  id?: string;
  examType?: string;
  name?: string;
  point?: number;
  markFrom?: number;
  markUpto?: number;
  description?: string;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateExamGradeRequest {
  examType: string;
  name: string;
  point?: number;
  markFrom?: number;
  markUpto?: number;
  description?: string;
  isActive?: boolean;
}

export interface V1UpdateExamGrade {
  id: string;
  examType: string;
  name: string;
  point?: number;
  markFrom?: number;
  markUpto?: number;
  description?: string;
  isActive?: boolean;
}

export interface ExamGradeServiceUpdateExamGradeRequest {
  examGrade?: V1UpdateExamGrade;
  updateMask?: string;
}

export interface V1ExamGradeFilter {
  id?: OperationStringFilterOperation;
  examType?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
  isActive?: OperationBooleanFilterOperators;
}

export interface V1ListExamGradeRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1ExamGradeFilter;
}

export interface V1ListExamGradeReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1ExamGrade>;
}

export interface V1DeleteExamGradeReply {
  id?: string;
  name?: string;
}

export interface V1MarkDivision {
  id?: string;
  name?: string;
  percentageFrom?: number;
  percentageTo?: number;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateMarkDivisionRequest {
  name: string;
  percentageFrom?: number;
  percentageTo?: number;
  isActive?: boolean;
}

export interface V1UpdateMarkDivision {
  id: string;
  name: string;
  percentageFrom?: number;
  percentageTo?: number;
  isActive?: boolean;
}

export interface MarkDivisionServiceUpdateMarkDivisionRequest {
  markDivision?: V1UpdateMarkDivision;
  updateMask?: string;
}

export interface V1MarkDivisionFilter {
  id?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
  isActive?: OperationBooleanFilterOperators;
}

export interface V1ListMarkDivisionRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1MarkDivisionFilter;
}

export interface V1ListMarkDivisionReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1MarkDivision>;
}

export interface V1DeleteMarkDivisionReply {
  id?: string;
  name?: string;
}

export interface V1ExamAdmitCardTemplate {
  id?: string;
  template?: string;
  heading?: string;
  title?: string;
  examName?: string;
  schoolName?: string;
  examCenter?: string;
  contentFooter?: string;
  showName?: boolean;
  showFatherName?: boolean;
  showMotherName?: boolean;
  showDob?: boolean;
  showAdmissionNo?: boolean;
  showRollNo?: boolean;
  showAddress?: boolean;
  showGender?: boolean;
  showPhoto?: boolean;
  showClass?: boolean;
  showSection?: boolean;
  leftLogo?: BlobBlobFile;
  rightLogo?: BlobBlobFile;
  sign?: BlobBlobFile;
  backgroundImage?: BlobBlobFile;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateExamAdmitCardTemplateRequest {
  template: string;
  heading?: string;
  title?: string;
  examName?: string;
  schoolName?: string;
  examCenter?: string;
  contentFooter?: string;
  showName?: boolean;
  showFatherName?: boolean;
  showMotherName?: boolean;
  showDob?: boolean;
  showAdmissionNo?: boolean;
  showRollNo?: boolean;
  showAddress?: boolean;
  showGender?: boolean;
  showPhoto?: boolean;
  showClass?: boolean;
  showSection?: boolean;
  isActive?: boolean;
}

export interface V1UpdateExamAdmitCardTemplate {
  id: string;
  template: string;
  heading?: string;
  title?: string;
  examName?: string;
  schoolName?: string;
  examCenter?: string;
  contentFooter?: string;
  showName?: boolean;
  showFatherName?: boolean;
  showMotherName?: boolean;
  showDob?: boolean;
  showAdmissionNo?: boolean;
  showRollNo?: boolean;
  showAddress?: boolean;
  showGender?: boolean;
  showPhoto?: boolean;
  showClass?: boolean;
  showSection?: boolean;
  isActive?: boolean;
}

export interface ExamAdmitCardTemplateServiceUpdateExamAdmitCardTemplateRequest {
  template?: V1UpdateExamAdmitCardTemplate;
  updateMask?: string;
}

export interface V1ExamAdmitCardTemplateFilter {
  id?: OperationStringFilterOperation;
  template?: OperationStringFilterOperation;
  isActive?: OperationBooleanFilterOperators;
}

export interface V1ListExamAdmitCardTemplateRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1ExamAdmitCardTemplateFilter;
}

export interface V1ListExamAdmitCardTemplateReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1ExamAdmitCardTemplate>;
}

export interface V1DeleteExamAdmitCardTemplateReply {
  id?: string;
  template?: string;
}

export interface V1ActivateExamAdmitCardTemplateRequest {
  id: string;
}

export interface V1ExamMarksheetTemplate {
  id?: string;
  template?: string;
  heading?: string;
  title?: string;
  examName?: string;
  schoolName?: string;
  examCenter?: string;
  showExamSession?: boolean;
  showName?: boolean;
  showFatherName?: boolean;
  showMotherName?: boolean;
  showDob?: boolean;
  showAdmissionNo?: boolean;
  showRollNo?: boolean;
  showPhoto?: boolean;
  showDivision?: boolean;
  showRank?: boolean;
  showCustomField?: boolean;
  date?: string;
  showClass?: boolean;
  showTeacherRemark?: boolean;
  showSection?: boolean;
  content?: string;
  contentFooter?: string;
  headerImage?: string;
  leftLogo?: string;
  rightLogo?: string;
  leftSign?: string;
  middleSign?: string;
  rightSign?: string;
  backgroundImage?: string;
  headerImageFile?: BlobBlobFile;
  leftLogoFile?: BlobBlobFile;
  rightLogoFile?: BlobBlobFile;
  leftSignFile?: BlobBlobFile;
  middleSignFile?: BlobBlobFile;
  rightSignFile?: BlobBlobFile;
  backgroundImageFile?: BlobBlobFile;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateExamMarksheetTemplateRequest {
  template: string;
  heading?: string;
  title?: string;
  examName?: string;
  schoolName?: string;
  examCenter?: string;
  showExamSession?: boolean;
  showName?: boolean;
  showFatherName?: boolean;
  showMotherName?: boolean;
  showDob?: boolean;
  showAdmissionNo?: boolean;
  showRollNo?: boolean;
  showPhoto?: boolean;
  showDivision?: boolean;
  showRank?: boolean;
  showCustomField?: boolean;
  date?: string;
  showClass?: boolean;
  showTeacherRemark?: boolean;
  showSection?: boolean;
  content?: string;
  contentFooter?: string;
  headerImage?: string;
  leftLogo?: string;
  rightLogo?: string;
  leftSign?: string;
  middleSign?: string;
  rightSign?: string;
  backgroundImage?: string;
}

export interface V1UpdateExamMarksheetTemplate {
  id: string;
  template: string;
  heading?: string;
  title?: string;
  examName?: string;
  schoolName?: string;
  examCenter?: string;
  showExamSession?: boolean;
  showName?: boolean;
  showFatherName?: boolean;
  showMotherName?: boolean;
  showDob?: boolean;
  showAdmissionNo?: boolean;
  showRollNo?: boolean;
  showPhoto?: boolean;
  showDivision?: boolean;
  showRank?: boolean;
  showCustomField?: boolean;
  date?: string;
  showClass?: boolean;
  showTeacherRemark?: boolean;
  showSection?: boolean;
  content?: string;
  contentFooter?: string;
  headerImage?: string;
  leftLogo?: string;
  rightLogo?: string;
  leftSign?: string;
  middleSign?: string;
  rightSign?: string;
  backgroundImage?: string;
}

export interface ExamMarksheetTemplateServiceUpdateExamMarksheetTemplateRequest {
  template?: V1UpdateExamMarksheetTemplate;
  updateMask?: string;
}

export interface V1ExamMarksheetTemplateFilter {
  id?: OperationStringFilterOperation;
  template?: OperationStringFilterOperation;
}

export interface V1ListExamMarksheetTemplateRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1ExamMarksheetTemplateFilter;
}

export interface V1ListExamMarksheetTemplateReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1ExamMarksheetTemplate>;
}

export interface V1DeleteExamMarksheetTemplateReply {
  id?: string;
  template?: string;
}

export interface V1Exam {
  id?: string;
  examGroupId?: string;
  academicSessionId?: string;
  name?: string;
  passingPercentage?: number;
  dateFrom?: string | null;
  dateTo?: string | null;
  useExamRollNo?: boolean;
  isPublish?: boolean;
  isRankGenerated?: boolean;
  isActive?: boolean;
  description?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateExamRequest {
  examGroupId: string;
  academicSessionId: string;
  name: string;
  passingPercentage?: number;
  dateFrom?: string | null;
  dateTo?: string | null;
  useExamRollNo?: boolean;
  isPublish?: boolean;
  isActive?: boolean;
  description?: string;
  isRankGenerated?: boolean;
}

export interface V1UpdateExam {
  id: string;
  examGroupId: string;
  academicSessionId: string;
  name: string;
  passingPercentage?: number;
  dateFrom?: string | null;
  dateTo?: string | null;
  useExamRollNo?: boolean;
  isPublish?: boolean;
  isActive?: boolean;
  description?: string;
  isRankGenerated?: boolean;
}

export interface ExamServiceUpdateExamRequest {
  exam?: V1UpdateExam;
  updateMask?: string;
}

export interface V1ExamFilter {
  id?: OperationStringFilterOperation;
  examGroupId?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
  isPublish?: OperationBooleanFilterOperators;
  isActive?: OperationBooleanFilterOperators;
}

export interface V1ListExamRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1ExamFilter;
}

export interface V1ListExamReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1Exam>;
}

export interface V1DeleteExamReply {
  id?: string;
  name?: string;
}

export interface V1ExamSubject {
  id?: string;
  examId?: string;
  subjectId?: string;
  examDate?: string | null;
  timeFrom?: string;
  duration?: string;
  roomNo?: string;
  maxMarks?: number;
  minMarks?: number;
  creditHours?: number;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateExamSubjectRequest {
  examId: string;
  subjectId: string;
  examDate: string | null;
  timeFrom: string;
  duration: string;
  roomNo: string;
  maxMarks?: number;
  minMarks?: number;
  creditHours?: number;
  isActive?: boolean;
}

export interface V1UpdateExamSubject {
  id: string;
  examId: string;
  subjectId: string;
  examDate: string | null;
  timeFrom: string;
  duration: string;
  roomNo: string;
  maxMarks?: number;
  minMarks?: number;
  creditHours?: number;
  isActive?: boolean;
}

export interface ExamSubjectServiceUpdateExamSubjectRequest {
  examSubject?: V1UpdateExamSubject;
  updateMask?: string;
}

export interface V1ExamSubjectFilter {
  id?: OperationStringFilterOperation;
  examId?: OperationStringFilterOperation;
  subjectId?: OperationStringFilterOperation;
  examDate?: OperationDateFilterOperators;
  isActive?: OperationBooleanFilterOperators;
}

export interface V1ListExamSubjectRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1ExamSubjectFilter;
}

export interface V1ListExamSubjectReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1ExamSubject>;
}

export interface V1DeleteExamSubjectReply {
  id?: string;
  examId?: string;
  subjectId?: string;
}

export interface V1ExamStudentSelection {
  studentEnrollmentId: string;
  examRollNo?: string;
  teacherRemark?: string;
  rank?: number;
  isActive?: boolean;
}

export interface V1SaveExamStudentsRequest {
  examId: string;
  classSectionId: string;
  students?: Array<V1ExamStudentSelection>;
}

export interface V1GenerateExamRanksRequest {
  examId: string;
  classSectionId: string;
}

export interface V1ExamRankReportSubject {
  examSubjectId?: string;
  subjectId?: string;
  subjectName?: string;
  subjectCode?: string;
  maxMarks?: number;
  minMarks?: number;
  creditHours?: number;
  examDate?: string | null;
  timeFrom?: string;
  duration?: string;
  roomNo?: string;
}

export interface V1ExamRankReportSubjectResult {
  examSubjectId?: string;
  subjectId?: string;
  marks?: number;
  attendance?: string;
  note?: string;
  marked?: boolean;
  isActive?: boolean;
  isPassed?: boolean;
  gradeName?: string;
  gradePoint?: number;
}

export interface V1ExamRankReportItem {
  examStudentId?: string;
  studentEnrollmentId?: string;
  studentId?: string;
  admissionNo?: string;
  rollNo?: string;
  examRollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fatherName?: string;
  category?: string;
  gender?: string;
  rank?: number;
  totalMarks?: number;
  obtainedMarks?: number;
  percentage?: number;
  isPassed?: boolean;
  qualityPoint?: number;
  gradeName?: string;
  subjectResults?: Array<V1ExamRankReportSubjectResult>;
  teacherRemark?: string;
  divisionName?: string;
}

export interface V1ExamRankReportReply {
  examId?: string;
  classSectionId?: string;
  examName?: string;
  examType?: string;
  isRankGenerated?: boolean;
  useExamRollNo?: boolean;
  passingPercentage?: number;
  subjects?: Array<V1ExamRankReportSubject>;
  items?: Array<V1ExamRankReportItem>;
}

export interface V1ExamStudentMarksheetReportReply {
  examId?: string;
  classSectionId?: string;
  examName?: string;
  examType?: string;
  isRankGenerated?: boolean;
  useExamRollNo?: boolean;
  passingPercentage?: number;
  subjects?: Array<V1ExamRankReportSubject>;
  item?: V1ExamRankReportItem;
}

export interface V1ExamStudentAdmitCardReportReply {
  examId?: string;
  classSectionId?: string;
  examName?: string;
  examType?: string;
  useExamRollNo?: boolean;
  subjects?: Array<V1ExamRankReportSubject>;
  item?: V1ExamRankReportItem;
  template?: V1ExamAdmitCardTemplate;
}

export interface V1ListMyPublishedExamResultCardsRequest {
  pageOffset?: number;
  pageSize?: number;
}

export interface V1ListMyPublishedExamAdmitCardsRequest {
  pageOffset?: number;
  pageSize?: number;
}

export interface V1GetMyPublishedExamAdmitCardRequest {
  studentId: string;
  examId: string;
}

export interface V1ListMyPublishedExamResultCardsReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1ExamResultCardSummary>;
}

export interface V1GetMyPublishedExamResultCardRequest {
  studentId: string;
  examId: string;
}

export interface V1ListPublishedExamResultCardsByAdmissionNoRequest {
  admissionNo?: string;
  pageOffset?: number;
  pageSize?: number;
}

export interface V1GetPublishedExamResultCardByAdmissionNoRequest {
  admissionNo?: string;
  examId?: string;
}

export interface V1ExamResultCardSummary {
  examStudentId?: string;
  examId?: string;
  classSectionId?: string;
  examName?: string;
  examType?: string;
  isRankGenerated?: boolean;
  useExamRollNo?: boolean;
  studentId?: string;
  admissionNo?: string;
  rollNo?: string;
  examRollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  rank?: number;
  obtainedMarks?: number;
  totalMarks?: number;
  percentage?: number;
  isPassed?: boolean;
  gradeName?: string;
  divisionName?: string;
}

export interface V1ExamStudentRosterItem {
  examStudentId?: string;
  studentEnrollmentId?: string;
  studentId?: string;
  admissionNo?: string;
  rollNo?: string;
  examRollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  assigned?: boolean;
  teacherRemark?: string;
  rank?: number;
  isActive?: boolean;
  fatherName?: string;
  category?: string;
  gender?: string;
}

export interface V1ExamStudentsReply {
  examId?: string;
  classSectionId?: string;
  items?: Array<V1ExamStudentRosterItem>;
}

export interface V1UpdateExamStudent {
  id: string;
  examRollNo?: string;
  teacherRemark?: string;
  rank?: number;
  isActive?: boolean;
}

export interface ExamStudentServiceUpdateExamStudentRequest {
  examStudent?: V1UpdateExamStudent;
  updateMask?: string;
}

export interface V1DeleteExamStudentReply {
  id?: string;
  examId?: string;
  studentEnrollmentId?: string;
}

export interface V1ExamStudentFilter {
  id?: OperationStringFilterOperation;
  examId?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  classSectionId?: OperationStringFilterOperation;
  studentEnrollmentId?: OperationStringFilterOperation;
  studentId?: OperationStringFilterOperation;
  isActive?: OperationBooleanFilterOperators;
}

export interface V1ListExamStudentRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1ExamStudentFilter;
}

export interface V1ListExamStudentReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1ExamStudent>;
}

export interface V1ExamStudent {
  id?: string;
  examId?: string;
  academicSessionId?: string;
  classSectionId?: string;
  studentEnrollmentId?: string;
  studentId?: string;
  examRollNo?: string;
  teacherRemark?: string;
  rank?: number;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1ExamSubjectMarkInput {
  examStudentId: string;
  marks?: number;
  attendance?: string;
  note?: string;
  isActive?: boolean;
}

export interface V1SaveExamSubjectMarksRequest {
  examSubjectId: string;
  classSectionId: string;
  staffId?: string;
  markedAt?: string | null;
  marks?: Array<V1ExamSubjectMarkInput>;
}

export interface V1ExamSubjectMarkItem {
  examMarkId?: string;
  examStudentId?: string;
  studentEnrollmentId?: string;
  studentId?: string;
  admissionNo?: string;
  rollNo?: string;
  examRollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fatherName?: string;
  category?: string;
  gender?: string;
  marks?: number;
  attendance?: string;
  note?: string;
  staffId?: string;
  markedAt?: string | null;
  isActive?: boolean;
  isPassed?: boolean;
  marked?: boolean;
}

export interface V1ExamSubjectMarksReply {
  examSubjectId?: string;
  examId?: string;
  classSectionId?: string;
  maxMarks?: number;
  minMarks?: number;
  items?: Array<V1ExamSubjectMarkItem>;
}

export interface V1StudentCategory {
  id?: string;
  name?: string;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateStudentCategoryRequest {
  name: string;
  isActive?: boolean;
}

export interface V1UpdateStudentCategory {
  id: string;
  name?: string;
  isActive?: boolean;
}

export interface StudentCategoryServiceUpdateStudentCategoryRequest {
  category?: V1UpdateStudentCategory;
  updateMask?: string;
}

export interface V1StudentCategoryFilter {
  id?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
}

export interface V1ListStudentCategoryRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentCategoryFilter;
}

export interface V1ListStudentCategoryReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentCategory>;
}

export interface V1DeleteStudentCategoryReply {
  id?: string;
  name?: string;
}

export interface V1StudentHouse {
  id?: string;
  name?: string;
  description?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateStudentHouseRequest {
  name: string;
  description?: string;
}

export interface V1UpdateStudentHouse {
  id: string;
  name?: string;
  description?: string;
}

export interface StudentHouseServiceUpdateStudentHouseRequest {
  house?: V1UpdateStudentHouse;
  updateMask?: string;
}

export interface V1StudentHouseFilter {
  id?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
}

export interface V1ListStudentHouseRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentHouseFilter;
}

export interface V1ListStudentHouseReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentHouse>;
}

export interface V1DeleteStudentHouseReply {
  id?: string;
  name?: string;
}

export interface V1DisableReason {
  id?: string;
  reason?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateDisableReasonRequest {
  reason: string;
}

export interface V1UpdateDisableReason {
  id: string;
  reason?: string;
}

export interface DisableReasonServiceUpdateDisableReasonRequest {
  reason?: V1UpdateDisableReason;
  updateMask?: string;
}

export interface V1DisableReasonFilter {
  id?: OperationStringFilterOperation;
  reason?: OperationStringFilterOperation;
}

export interface V1ListDisableReasonRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1DisableReasonFilter;
}

export interface V1ListDisableReasonReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1DisableReason>;
}

export interface V1DeleteDisableReasonReply {
  id?: string;
  reason?: string;
}

export interface V1TransportRoute {
  id?: string;
  routeTitle?: string;
  noOfVehicle?: number;
  note?: string;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateTransportRouteRequest {
  routeTitle: string;
  noOfVehicle?: number;
  note?: string;
  isActive?: boolean;
}

export interface V1UpdateTransportRoute {
  id: string;
  routeTitle?: string;
  noOfVehicle?: number;
  note?: string;
  isActive?: boolean;
}

export interface TransportRouteServiceUpdateTransportRouteRequest {
  route?: V1UpdateTransportRoute;
  updateMask?: string;
}

export interface V1TransportRouteFilter {
  id?: OperationStringFilterOperation;
  routeTitle?: OperationStringFilterOperation;
}

export interface V1ListTransportRouteRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1TransportRouteFilter;
}

export interface V1ListTransportRouteReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1TransportRoute>;
}

export interface V1DeleteTransportRouteReply {
  id?: string;
  routeTitle?: string;
}

export interface V1PickupPoint {
  id?: string;
  name?: string;
  latitude?: string;
  longitude?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreatePickupPointRequest {
  name: string;
  latitude?: string;
  longitude?: string;
}

export interface V1UpdatePickupPoint {
  id: string;
  name?: string;
  latitude?: string;
  longitude?: string;
}

export interface PickupPointServiceUpdatePickupPointRequest {
  point?: V1UpdatePickupPoint;
  updateMask?: string;
}

export interface V1PickupPointFilter {
  id?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
}

export interface V1ListPickupPointRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1PickupPointFilter;
}

export interface V1ListPickupPointReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1PickupPoint>;
}

export interface V1DeletePickupPointReply {
  id?: string;
  name?: string;
}

export interface V1RoutePickupPoint {
  id?: string;
  academicSessionId?: string;
  transportRouteId?: string;
  pickupPointId?: string;
  fees?: number;
  destinationDistance?: number;
  pickupTime?: string;
  orderNumber?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateRoutePickupPointRequest {
  academicSessionId: string;
  transportRouteId: string;
  pickupPointId: string;
  fees?: number;
  destinationDistance?: number;
  pickupTime?: string;
  orderNumber?: number;
}

export interface V1UpdateRoutePickupPoint {
  id: string;
  academicSessionId?: string;
  transportRouteId?: string;
  pickupPointId?: string;
  fees?: number;
  destinationDistance?: number;
  pickupTime?: string;
  orderNumber?: number;
}

export interface RoutePickupPointServiceUpdateRoutePickupPointRequest {
  point?: V1UpdateRoutePickupPoint;
  updateMask?: string;
}

export interface V1RoutePickupPointFilter {
  id?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  transportRouteId?: OperationStringFilterOperation;
  pickupPointId?: OperationStringFilterOperation;
}

export interface V1ListRoutePickupPointRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1RoutePickupPointFilter;
}

export interface V1ListRoutePickupPointReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1RoutePickupPoint>;
}

export interface V1DeleteRoutePickupPointReply {
  id?: string;
  transportRouteId?: string;
  pickupPointId?: string;
}

export interface V1Vehicle {
  id?: string;
  vehicleNo?: string;
  vehicleModel?: string;
  vehiclePhoto?: string;
  manufactureYear?: string;
  registrationNumber?: string;
  chasisNumber?: string;
  maxSeatingCapacity?: string;
  driverName?: string;
  driverLicence?: string;
  driverContact?: string;
  note?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateVehicleRequest {
  vehicleNo: string;
  vehicleModel?: string;
  vehiclePhoto?: string;
  manufactureYear?: string;
  registrationNumber?: string;
  chasisNumber?: string;
  maxSeatingCapacity?: string;
  driverName?: string;
  driverLicence?: string;
  driverContact?: string;
  note?: string;
}

export interface V1UpdateVehicle {
  id: string;
  vehicleNo?: string;
  vehicleModel?: string;
  vehiclePhoto?: string;
  manufactureYear?: string;
  registrationNumber?: string;
  chasisNumber?: string;
  maxSeatingCapacity?: string;
  driverName?: string;
  driverLicence?: string;
  driverContact?: string;
  note?: string;
}

export interface VehicleServiceUpdateVehicleRequest {
  vehicle?: V1UpdateVehicle;
  updateMask?: string;
}

export interface V1VehicleFilter {
  id?: OperationStringFilterOperation;
  vehicleNo?: OperationStringFilterOperation;
  driverName?: OperationStringFilterOperation;
}

export interface V1ListVehicleRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1VehicleFilter;
}

export interface V1ListVehicleReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1Vehicle>;
}

export interface V1DeleteVehicleReply {
  id?: string;
  vehicleNo?: string;
}

export interface V1VehicleRoute {
  id?: string;
  transportRouteId?: string;
  vehicleId?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateVehicleRouteRequest {
  transportRouteId: string;
  vehicleId: string;
}

export interface V1UpdateVehicleRoute {
  id: string;
  transportRouteId?: string;
  vehicleId?: string;
}

export interface VehicleRouteServiceUpdateVehicleRouteRequest {
  vehicleRoute?: V1UpdateVehicleRoute;
  updateMask?: string;
}

export interface V1VehicleRouteFilter {
  id?: OperationStringFilterOperation;
  transportRouteId?: OperationStringFilterOperation;
  vehicleId?: OperationStringFilterOperation;
}

export interface V1ListVehicleRouteRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1VehicleRouteFilter;
}

export interface V1ListVehicleRouteReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1VehicleRoute>;
}

export interface V1DeleteVehicleRouteReply {
  id?: string;
  transportRouteId?: string;
  vehicleId?: string;
}

export interface V1TransportFeeMaster {
  id?: string;
  academicSessionId?: string;
  month?: string;
  dueDate?: string | null;
  fineType?: string;
  finePercentage?: number;
  fineAmount?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateTransportFeeMasterRequest {
  academicSessionId: string;
  month: string;
  dueDate?: string | null;
  fineType?: string;
  finePercentage?: number;
  fineAmount?: number;
}

export interface V1UpdateTransportFeeMaster {
  id: string;
  academicSessionId?: string;
  month?: string;
  dueDate?: string | null;
  fineType?: string;
  finePercentage?: number;
  fineAmount?: number;
}

export interface TransportFeeMasterServiceUpdateTransportFeeMasterRequest {
  feeMaster?: V1UpdateTransportFeeMaster;
  updateMask?: string;
}

export interface V1TransportFeeMasterFilter {
  id?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  month?: OperationStringFilterOperation;
}

export interface V1ListTransportFeeMasterRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1TransportFeeMasterFilter;
}

export interface V1ListTransportFeeMasterReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1TransportFeeMaster>;
}

export interface V1DeleteTransportFeeMasterReply {
  id?: string;
  academicSessionId?: string;
  month?: string;
}

export interface V1StudentTransportFee {
  id?: string;
  studentEnrollmentId?: string;
  routePickupPointId?: string;
  transportFeeMasterId?: string;
  generatedBy?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateStudentTransportFeeRequest {
  studentEnrollmentId: string;
  routePickupPointId: string;
  transportFeeMasterId: string;
  generatedBy?: string;
}

export interface V1UpdateStudentTransportFee {
  id: string;
  studentEnrollmentId?: string;
  routePickupPointId?: string;
  transportFeeMasterId?: string;
  generatedBy?: string;
}

export interface StudentTransportFeeServiceUpdateStudentTransportFeeRequest {
  studentFee?: V1UpdateStudentTransportFee;
  updateMask?: string;
}

export interface V1StudentTransportFeeFilter {
  id?: OperationStringFilterOperation;
  studentEnrollmentId?: OperationStringFilterOperation;
  routePickupPointId?: OperationStringFilterOperation;
  transportFeeMasterId?: OperationStringFilterOperation;
}

export interface V1ListStudentTransportFeeRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentTransportFeeFilter;
}

export interface V1ListStudentTransportFeeReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentTransportFee>;
}

export interface V1DeleteStudentTransportFeeReply {
  id?: string;
  studentEnrollmentId?: string;
  routePickupPointId?: string;
  transportFeeMasterId?: string;
}

export interface V1ReplaceStudentTransportFeesRequest {
  studentEnrollmentId: string;
  routePickupPointId: string;
  transportFeeMasterIds?: Array<string>;
  generatedBy?: string;
}

export interface V1StudentTransportDueFilter {
  id?: OperationStringFilterOperation;
  studentEnrollmentId?: OperationStringFilterOperation;
  routePickupPointId?: OperationStringFilterOperation;
  transportFeeMasterId?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
}

export interface V1ListStudentTransportDueRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentTransportDueFilter;
  asOf?: string | null;
}

export interface V1ListMyStudentTransportDueRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentTransportDueFilter;
  asOf?: string | null;
  studentId?: string;
}

export interface V1ListStudentTransportDueReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentTransportDue>;
}

export interface V1GetStudentTransportReconciliationSnapshotRequest {
  filter?: V1StudentTransportDueFilter;
  asOf?: string | null;
}

export interface V1StudentTransportReconciliationSummary {
  count?: number;
  totalDueAmount?: number;
  paidAmount?: number;
  discountAmount?: number;
  fineDueAmount?: number;
  totalBalanceAmount?: number;
}

export interface V1StudentTransportReconciliationSnapshot {
  asOf?: string | null;
  summary?: V1StudentTransportReconciliationSummary;
  items?: Array<V1StudentTransportDue>;
}

export interface V1StudentTransportDue {
  id?: string;
  studentEnrollmentId?: string;
  routePickupPointId?: string;
  transportFeeMasterId?: string;
  academicSessionId?: string;
  transportRouteId?: string;
  pickupPointId?: string;
  month?: string;
  dueDate?: string | null;
  amount?: number;
  fineType?: string;
  finePercentage?: number;
  fineAmount?: number;
  fineDueAmount?: number;
  totalDueAmount?: number;
  paidAmount?: number;
  discountAmount?: number;
  paidFineAmount?: number;
  balanceAmount?: number;
  fineBalanceAmount?: number;
  totalBalanceAmount?: number;
  paymentStatus?: string;
  lastPaidAt?: string | null;
  generatedBy?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateStudentTransportPaymentRequest {
  studentTransportFeeId: string;
  amount?: number;
  discountAmount?: number;
  fineAmount?: number;
  paymentMode: string;
  collectedAt?: string | null;
  collectedBy?: string;
  note?: string;
  referenceNo?: string;
}

export interface V1DeleteStudentTransportPaymentReply {
  id?: string;
  studentTransportFeeId?: string;
}

export interface V1StudentTransportPaymentFilter {
  id?: OperationStringFilterOperation;
  studentTransportFeeId?: OperationStringFilterOperation;
}

export interface V1ListStudentTransportPaymentRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentTransportPaymentFilter;
}

export interface V1ListMyStudentTransportPaymentRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentTransportPaymentFilter;
  studentId?: string;
}

export interface V1ListStudentTransportPaymentReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentTransportPayment>;
}

export interface V1StudentTransportPayment {
  id?: string;
  studentTransportFeeId?: string;
  amount?: number;
  discountAmount?: number;
  fineAmount?: number;
  paymentMode?: string;
  collectedAt?: string | null;
  collectedBy?: string;
  note?: string;
  referenceNo?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1FeeGroup {
  id?: string;
  name?: string;
  description?: string;
  nature?: string;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateFeeGroupRequest {
  name: string;
  description?: string;
  nature?: string;
  isActive?: boolean;
}

export interface V1UpdateFeeGroup {
  id: string;
  name?: string;
  description?: string;
  nature?: string;
  isActive?: boolean;
}

export interface FeeGroupServiceUpdateFeeGroupRequest {
  group?: V1UpdateFeeGroup;
  updateMask?: string;
}

export interface V1FeeGroupFilter {
  id?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
}

export interface V1ListFeeGroupRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1FeeGroupFilter;
}

export interface V1ListFeeGroupReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1FeeGroup>;
}

export interface V1DeleteFeeGroupReply {
  id?: string;
  name?: string;
}

export interface V1FeeType {
  id?: string;
  feeGroupId?: string;
  name?: string;
  code?: string;
  description?: string;
  nature?: string;
  isSystem?: boolean;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateFeeTypeRequest {
  feeGroupId: string;
  name: string;
  code?: string;
  description?: string;
  nature?: string;
  isSystem?: boolean;
  isActive?: boolean;
}

export interface V1UpdateFeeType {
  id: string;
  feeGroupId?: string;
  name?: string;
  code?: string;
  description?: string;
  nature?: string;
  isSystem?: boolean;
  isActive?: boolean;
}

export interface FeeTypeServiceUpdateFeeTypeRequest {
  feeType?: V1UpdateFeeType;
  updateMask?: string;
}

export interface V1FeeTypeFilter {
  id?: OperationStringFilterOperation;
  feeGroupId?: OperationStringFilterOperation;
  code?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
}

export interface V1ListFeeTypeRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1FeeTypeFilter;
}

export interface V1ListFeeTypeReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1FeeType>;
}

export interface V1DeleteFeeTypeReply {
  id?: string;
  name?: string;
  code?: string;
}

export interface V1FeeMaster {
  id?: string;
  academicSessionId?: string;
  feeGroupId?: string;
  feeTypeId?: string;
  amount?: number;
  dueDate?: string | null;
  fineType?: string;
  finePercentage?: number;
  fineAmount?: number;
  finePerDay?: number;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateFeeMasterRequest {
  academicSessionId: string;
  feeGroupId: string;
  feeTypeId: string;
  amount?: number;
  dueDate?: string | null;
  fineType?: string;
  finePercentage?: number;
  fineAmount?: number;
  finePerDay?: number;
  isActive?: boolean;
}

export interface V1UpdateFeeMaster {
  id: string;
  academicSessionId?: string;
  feeGroupId?: string;
  feeTypeId?: string;
  amount?: number;
  dueDate?: string | null;
  fineType?: string;
  finePercentage?: number;
  fineAmount?: number;
  finePerDay?: number;
  isActive?: boolean;
}

export interface FeeMasterServiceUpdateFeeMasterRequest {
  feeMaster?: V1UpdateFeeMaster;
  updateMask?: string;
}

export interface V1FeeMasterFilter {
  id?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  feeGroupId?: OperationStringFilterOperation;
  feeTypeId?: OperationStringFilterOperation;
}

export interface V1ListFeeMasterRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1FeeMasterFilter;
}

export interface V1ListFeeMasterReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1FeeMaster>;
}

export interface V1DeleteFeeMasterReply {
  id?: string;
  feeGroupId?: string;
  feeTypeId?: string;
}

export interface V1StudentFee {
  id?: string;
  studentEnrollmentId?: string;
  feeMasterId?: string;
  generatedBy?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateStudentFeeRequest {
  studentEnrollmentId: string;
  feeMasterId: string;
  generatedBy?: string;
}

export interface V1UpdateStudentFee {
  id: string;
  studentEnrollmentId?: string;
  feeMasterId?: string;
  generatedBy?: string;
}

export interface StudentFeeServiceUpdateStudentFeeRequest {
  studentFee?: V1UpdateStudentFee;
  updateMask?: string;
}

export interface V1StudentFeeFilter {
  id?: OperationStringFilterOperation;
  studentEnrollmentId?: OperationStringFilterOperation;
  feeMasterId?: OperationStringFilterOperation;
}

export interface V1ListStudentFeeRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentFeeFilter;
}

export interface V1ListStudentFeeReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentFee>;
}

export interface V1DeleteStudentFeeReply {
  id?: string;
  studentEnrollmentId?: string;
  feeMasterId?: string;
}

export interface V1ReplaceStudentFeesRequest {
  studentEnrollmentId: string;
  feeMasterIds?: Array<string>;
  generatedBy?: string;
}

export interface V1StudentFeeDueFilter {
  id?: OperationStringFilterOperation;
  studentEnrollmentId?: OperationStringFilterOperation;
  feeMasterId?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
  feeGroupId?: OperationStringFilterOperation;
  feeTypeId?: OperationStringFilterOperation;
}

export interface V1ListStudentFeeDueRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentFeeDueFilter;
  asOf?: string | null;
}

export interface V1ListMyStudentFeeDueRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentFeeDueFilter;
  asOf?: string | null;
  studentId?: string;
}

export interface V1ListStudentFeeDueReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentFeeDue>;
}

export interface V1GetStudentFeeReconciliationSnapshotRequest {
	filter?: V1StudentFeeDueFilter;
	asOf?: string | null;
}

export interface V1StudentFeeReconciliationSummary {
  count?: number;
  totalDueAmount?: number;
  paidAmount?: number;
  discountAmount?: number;
  fineDueAmount?: number;
  totalBalanceAmount?: number;
}

export interface V1StudentFeeReconciliationSnapshot {
	asOf?: string | null;
	summary?: V1StudentFeeReconciliationSummary;
	items?: Array<V1StudentFeeDue>;
}

export interface V1StudentFeeDue {
  id?: string;
  studentEnrollmentId?: string;
  feeMasterId?: string;
  academicSessionId?: string;
  feeGroupId?: string;
  feeTypeId?: string;
  amount?: number;
  dueDate?: string | null;
  fineType?: string;
  finePercentage?: number;
  fineAmount?: number;
  finePerDay?: number;
  fineDueAmount?: number;
  totalDueAmount?: number;
  paidAmount?: number;
  discountAmount?: number;
  paidFineAmount?: number;
  balanceAmount?: number;
  fineBalanceAmount?: number;
  totalBalanceAmount?: number;
  paymentStatus?: string;
  lastPaidAt?: string | null;
  generatedBy?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateStudentFeePaymentRequest {
  studentFeeId: string;
  amount?: number;
  discountAmount?: number;
  fineAmount?: number;
  paymentMode: string;
  collectedAt?: string | null;
  collectedBy?: string;
  referenceNo?: string;
  note?: string;
}

export interface V1DeleteStudentFeePaymentReply {
  id?: string;
  studentFeeId?: string;
}

export interface V1StudentFeePaymentFilter {
  id?: OperationStringFilterOperation;
  studentFeeId?: OperationStringFilterOperation;
}

export interface V1ListStudentFeePaymentRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentFeePaymentFilter;
}

export interface V1ListMyStudentFeePaymentRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentFeePaymentFilter;
  studentId?: string;
}

export interface V1ListStudentFeePaymentReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentFeePayment>;
}

export interface V1StudentFeePayment {
  id?: string;
  studentFeeId?: string;
  amount?: number;
  discountAmount?: number;
  fineAmount?: number;
  paymentMode?: string;
  collectedAt?: string | null;
  collectedBy?: string;
  referenceNo?: string;
  note?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1Hostel {
  id?: string;
  hostelName?: string;
  type?: string;
  address?: string;
  intake?: number;
  description?: string;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateHostelRequest {
  hostelName: string;
  type?: string;
  address?: string;
  intake?: number;
  description?: string;
  isActive?: boolean;
}

export interface V1UpdateHostel {
  id: string;
  hostelName?: string;
  type?: string;
  address?: string;
  intake?: number;
  description?: string;
  isActive?: boolean;
}

export interface HostelServiceUpdateHostelRequest {
  hostel?: V1UpdateHostel;
  updateMask?: string;
}

export interface V1HostelFilter {
  id?: OperationStringFilterOperation;
  hostelName?: OperationStringFilterOperation;
}

export interface V1ListHostelRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1HostelFilter;
}

export interface V1ListHostelReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1Hostel>;
}

export interface V1DeleteHostelReply {
  id?: string;
  hostelName?: string;
}

export interface V1RoomType {
  id?: string;
  roomType?: string;
  description?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateRoomTypeRequest {
  roomType: string;
  description?: string;
}

export interface V1UpdateRoomType {
  id: string;
  roomType?: string;
  description?: string;
}

export interface RoomTypeServiceUpdateRoomTypeRequest {
  roomType?: V1UpdateRoomType;
  updateMask?: string;
}

export interface V1RoomTypeFilter {
  id?: OperationStringFilterOperation;
  roomType?: OperationStringFilterOperation;
}

export interface V1ListRoomTypeRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1RoomTypeFilter;
}

export interface V1ListRoomTypeReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1RoomType>;
}

export interface V1DeleteRoomTypeReply {
  id?: string;
  roomType?: string;
}

export interface V1HostelRoom {
  id?: string;
  hostelId?: string;
  roomTypeId?: string;
  roomNo?: string;
  noOfBed?: number;
  costPerBed?: number;
  title?: string;
  description?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateHostelRoomRequest {
  hostelId: string;
  roomTypeId: string;
  roomNo: string;
  noOfBed?: number;
  costPerBed?: number;
  title?: string;
  description?: string;
}

export interface V1UpdateHostelRoom {
  id: string;
  hostelId?: string;
  roomTypeId?: string;
  roomNo?: string;
  noOfBed?: number;
  costPerBed?: number;
  title?: string;
  description?: string;
}

export interface HostelRoomServiceUpdateHostelRoomRequest {
  room?: V1UpdateHostelRoom;
  updateMask?: string;
}

export interface V1HostelRoomFilter {
  id?: OperationStringFilterOperation;
  hostelId?: OperationStringFilterOperation;
  roomTypeId?: OperationStringFilterOperation;
  roomNo?: OperationStringFilterOperation;
}

export interface V1ListHostelRoomRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1HostelRoomFilter;
}

export interface V1ListHostelRoomReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1HostelRoom>;
}

export interface V1DeleteHostelRoomReply {
  id?: string;
  roomNo?: string;
}

export interface V1StudentSettings {
  admission?: V1StudentAdmissionSettings;
  onlineAdmissionFields?: Array<V1StudentFieldSetting>;
  studentEditFields?: Array<V1StudentFieldSetting>;
}

export interface V1StudentAdmissionSettings {
  id?: string;
  autoGenerateAdmissionNo?: boolean;
  admissionNoPrefix?: string;
  admissionNoStartFrom?: string;
  admissionNoDigits?: number;
  admissionNoSequenceInitialized?: boolean;
  allowMultiClassStudent?: boolean;
  onlineAdmissionEnabled?: boolean;
  onlineAdmissionPaymentEnabled?: boolean;
  onlineAdmissionAmount?: number;
  onlineAdmissionInstruction?: string;
  onlineAdmissionConditions?: string;
  studentProfileEditEnabled?: boolean;
  publicExamResultEnabled?: boolean;
  admitCardDownloadEnabled?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1UpdateStudentSettingsRequest {
  admission: V1UpdateStudentAdmissionSettings;
  onlineAdmissionFields?: Array<V1UpdateStudentFieldSetting>;
  studentEditFields?: Array<V1UpdateStudentFieldSetting>;
  updateMask?: string;
}

export interface V1UpdateStudentAdmissionSettings {
  autoGenerateAdmissionNo?: boolean;
  admissionNoPrefix?: string;
  admissionNoStartFrom?: string;
  admissionNoDigits?: number;
  admissionNoSequenceInitialized?: boolean;
  allowMultiClassStudent?: boolean;
  onlineAdmissionEnabled?: boolean;
  onlineAdmissionPaymentEnabled?: boolean;
  onlineAdmissionAmount?: number;
  onlineAdmissionInstruction?: string;
  onlineAdmissionConditions?: string;
  studentProfileEditEnabled?: boolean;
  publicExamResultEnabled?: boolean;
  admitCardDownloadEnabled?: boolean;
}

export interface V1StudentFieldSetting {
  id?: string;
  kind?: 'STUDENT_FIELD_SETTING_KIND_UNSPECIFIED' | 'STUDENT_FIELD_SETTING_KIND_ONLINE_ADMISSION' | 'STUDENT_FIELD_SETTING_KIND_STUDENT_EDIT';
  fieldKey?: string;
  enabled?: boolean;
  sequence?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1UpdateStudentFieldSetting {
  fieldKey: string;
  enabled?: boolean;
  sequence?: number;
}

export interface V1StudentEnrollment {
  id?: string;
  studentId?: string;
  classSectionId?: string;
  rollNo?: string;
  isActive?: boolean;
  routePickupPointId?: string;
  vehicleRouteId?: string;
  hostelRoomId?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1Student {
  id?: string;
  admissionNo?: string;
  rollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  dob?: string | null;
  admissionDate?: string | null;
  mobileNo?: string;
  email?: string;
  categoryId?: string;
  houseId?: string;
  familyId?: string;
  guardianIs?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianOccupation?: string;
  guardianAddress?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  motherOccupation?: string;
  currentAddress?: string;
  permanentAddress?: string;
  isActive?: boolean;
  disableReasonId?: string;
  disableNote?: string;
  disabledAt?: string | null;
  enrollment?: V1StudentEnrollment;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1CreateStudentRequest {
  admissionNo: string;
  rollNo?: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  dob?: string | null;
  admissionDate?: string | null;
  mobileNo?: string;
  email?: string;
  categoryId?: string;
  houseId?: string;
  siblingStudentId?: string;
  routePickupPointId?: string;
  vehicleRouteId?: string;
  hostelRoomId?: string;
  guardianIs?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianOccupation?: string;
  guardianAddress?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  motherOccupation?: string;
  currentAddress?: string;
  permanentAddress?: string;
  classSectionId: string;
}

export interface V1UpdateStudent {
  id: string;
  admissionNo?: string;
  rollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  dob?: string | null;
  admissionDate?: string | null;
  mobileNo?: string;
  email?: string;
  categoryId?: string;
  houseId?: string;
  siblingStudentId?: string;
  clearSiblings?: boolean;
  routePickupPointId?: string;
  vehicleRouteId?: string;
  hostelRoomId?: string;
  guardianIs?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianPhone?: string;
  guardianEmail?: string;
  guardianOccupation?: string;
  guardianAddress?: string;
  fatherName?: string;
  fatherPhone?: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  motherOccupation?: string;
  currentAddress?: string;
  permanentAddress?: string;
  classSectionId?: string;
  isActive?: boolean;
  disableReasonId?: string;
  disableNote?: string;
  disabledAt?: string | null;
}

export interface StudentServiceUpdateStudentRequest {
  student?: V1UpdateStudent;
  updateMask?: string;
}

export interface V1StudentFilter {
  id?: OperationStringFilterOperation;
  admissionNo?: OperationStringFilterOperation;
  firstName?: OperationStringFilterOperation;
  lastName?: OperationStringFilterOperation;
  classSectionId?: OperationStringFilterOperation;
}

export interface V1ListStudentRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentFilter;
}

export interface V1ListStudentReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1Student>;
}

export interface V1ListStudentSiblingReply {
  studentId?: string;
  items?: Array<V1Student>;
}

export interface V1DeleteStudentReply {
  id?: string;
  admissionNo?: string;
}

export interface V1StudentUserLink {
  id?: string;
  studentId?: string;
  userId?: string;
  relation?: string;
  isPrimary?: boolean;
  canLogin?: boolean;
  sourceParentId?: string;
  note?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  student?: V1Student;
}

export interface V1StudentUserLinkFilter {
  id?: OperationStringFilterOperation;
  studentId?: OperationStringFilterOperation;
  userId?: OperationStringFilterOperation;
  relation?: OperationStringFilterOperation;
}

export interface V1ListStudentUserLinkRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentUserLinkFilter;
}

export interface V1ListStudentUserLinkReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentUserLink>;
}

export interface V1CreateStudentUserLinkRequest {
  studentId: string;
  userId: string;
  relation?: string;
  isPrimary?: boolean;
  canLogin?: boolean;
  sourceParentId?: string;
  note?: string;
}

export interface V1UpdateStudentUserLink {
  id: string;
  studentId?: string;
  userId?: string;
  relation?: string;
  isPrimary?: boolean;
  canLogin?: boolean;
  sourceParentId?: string;
  note?: string;
}

export interface StudentUserLinkServiceUpdateStudentUserLinkRequest {
  link?: V1UpdateStudentUserLink;
  updateMask?: string;
}

export interface V1DeleteStudentUserLinkReply {
  id?: string;
  studentId?: string;
  userId?: string;
}

export interface V1DisableStudentRequest {
  id: string;
  disableReasonId: string;
  disableNote?: string;
  disabledAt?: string | null;
}

export interface V1ReactivateStudentRequest {
  id: string;
}

export type V1StudentAttendanceStatus =
  | 'STUDENT_ATTENDANCE_STATUS_UNSPECIFIED'
  | 'STUDENT_ATTENDANCE_STATUS_PRESENT'
  | 'STUDENT_ATTENDANCE_STATUS_LATE_WITH_EXCUSE'
  | 'STUDENT_ATTENDANCE_STATUS_LATE'
  | 'STUDENT_ATTENDANCE_STATUS_ABSENT'
  | 'STUDENT_ATTENDANCE_STATUS_HOLIDAY'
  | 'STUDENT_ATTENDANCE_STATUS_HALF_DAY'
  | 'STUDENT_ATTENDANCE_STATUS_HALF_DAY_SECOND_SHIFT';

export type V1StudentAttendanceSource =
  | 'STUDENT_ATTENDANCE_SOURCE_UNSPECIFIED'
  | 'STUDENT_ATTENDANCE_SOURCE_MANUAL'
  | 'STUDENT_ATTENDANCE_SOURCE_QRCODE'
  | 'STUDENT_ATTENDANCE_SOURCE_BIOMETRIC';

export interface V1StudentDailyAttendanceMark {
  studentEnrollmentId: string;
  status: V1StudentAttendanceStatus;
  remark?: string;
  inTime?: string;
  outTime?: string;
  source?: V1StudentAttendanceSource;
  biometricDeviceData?: string;
  userAgent?: string;
}

export interface V1SaveStudentDailyAttendanceRequest {
  classSectionId: string;
  attendanceDate: string | null;
  items?: Array<V1StudentDailyAttendanceMark>;
}

export interface V1StudentDailyAttendanceItem {
  attendanceId?: string;
  studentId?: string;
  studentEnrollmentId?: string;
  admissionNo?: string;
  rollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  status?: V1StudentAttendanceStatus;
  remark?: string;
  inTime?: string;
  outTime?: string;
  source?: V1StudentAttendanceSource;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1StudentDailyAttendanceReply {
  classSectionId?: string;
  attendanceDate?: string | null;
  items?: Array<V1StudentDailyAttendanceItem>;
}

export interface V1StudentMonthlyAttendanceReportItem {
  studentId?: string;
  studentEnrollmentId?: string;
  admissionNo?: string;
  rollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  totalMarked?: number;
  present?: number;
  lateWithExcuse?: number;
  late?: number;
  absent?: number;
  holiday?: number;
  halfDay?: number;
  halfDaySecondShift?: number;
  presentPercentage?: number;
}

export interface V1StudentMonthlyAttendanceReportReply {
  classSectionId?: string;
  fromDate?: string | null;
  toDate?: string | null;
  items?: Array<V1StudentMonthlyAttendanceReportItem>;
}

export interface V1StudentSubjectAttendancePeriod {
  subjectTimetableId?: string;
  subjectId?: string;
  staffId?: string;
  day?: string;
  timeFrom?: string;
  timeTo?: string;
  roomNo?: string;
}

export interface V1StudentSubjectAttendanceDateReportMark {
  subjectTimetableId?: string;
  attendanceId?: string;
  status?: V1StudentAttendanceStatus;
  remark?: string;
  source?: V1StudentAttendanceSource;
}

export interface V1StudentSubjectAttendanceDateReportItem {
  studentId?: string;
  studentEnrollmentId?: string;
  admissionNo?: string;
  rollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  marks?: Array<V1StudentSubjectAttendanceDateReportMark>;
}

export interface V1StudentSubjectAttendanceDateReportReply {
  classSectionId?: string;
  attendanceDate?: string | null;
  day?: string;
  periods?: Array<V1StudentSubjectAttendancePeriod>;
  items?: Array<V1StudentSubjectAttendanceDateReportItem>;
}

export interface V1StudentSubjectAttendanceMark {
  studentEnrollmentId: string;
  status: V1StudentAttendanceStatus;
  remark?: string;
  source?: V1StudentAttendanceSource;
  biometricDeviceData?: string;
  userAgent?: string;
}

export interface V1SaveStudentSubjectAttendanceRequest {
  subjectTimetableId: string;
  attendanceDate: string | null;
  items?: Array<V1StudentSubjectAttendanceMark>;
}

export interface V1StudentSubjectAttendanceItem {
  attendanceId?: string;
  studentId?: string;
  studentEnrollmentId?: string;
  admissionNo?: string;
  rollNo?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  status?: V1StudentAttendanceStatus;
  remark?: string;
  source?: V1StudentAttendanceSource;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1StudentSubjectAttendanceReply {
  subjectTimetableId?: string;
  classSectionId?: string;
  subjectId?: string;
  staffId?: string;
  day?: string;
  timeFrom?: string;
  timeTo?: string;
  attendanceDate?: string | null;
  items?: Array<V1StudentSubjectAttendanceItem>;
}

export interface V1CreateStaffRequest {
  employeeId: string;
  firstName: string;
  lastName?: string;
  roleName: string;
  gender?: string;
  dob?: string | null;
  dateOfJoining?: string | null;
  contactNo?: string;
  email?: string;
  qualification?: string;
  workExperience?: string;
  localAddress?: string;
  permanentAddress?: string;
  note?: string;
  userId?: string;
}

export interface V1UpdateStaff {
  id: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  roleName?: string;
  gender?: string;
  dob?: string | null;
  dateOfJoining?: string | null;
  contactNo?: string;
  email?: string;
  qualification?: string;
  workExperience?: string;
  localAddress?: string;
  permanentAddress?: string;
  note?: string;
  userId?: string;
  isActive?: boolean;
}

export interface StaffServiceUpdateStaffRequest {
  staff?: V1UpdateStaff;
  updateMask?: string;
}

export interface V1DeleteStaffReply {
  id?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
}

export interface V1StaffFilter {
  id?: OperationStringFilterOperation;
  employeeId?: OperationStringFilterOperation;
  firstName?: OperationStringFilterOperation;
  lastName?: OperationStringFilterOperation;
  roleName?: OperationStringFilterOperation;
  isActive?: OperationBooleanFilterOperators;
}

export interface V1ListStaffRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StaffFilter;
}

export interface V1ListStaffReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1Staff>;
}

export interface V1StaffRole {
  name?: string;
}

export interface V1ListStaffRoleReply {
  items?: Array<V1StaffRole>;
}

export interface V1Staff {
  id?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  roleName?: string;
  gender?: string;
  dob?: string | null;
  dateOfJoining?: string | null;
  contactNo?: string;
  email?: string;
  qualification?: string;
  workExperience?: string;
  localAddress?: string;
  permanentAddress?: string;
  note?: string;
  userId?: string;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type V1StaffAttendanceStatus =
  | 'STAFF_ATTENDANCE_STATUS_UNSPECIFIED'
  | 'STAFF_ATTENDANCE_STATUS_PRESENT'
  | 'STAFF_ATTENDANCE_STATUS_LATE'
  | 'STAFF_ATTENDANCE_STATUS_ABSENT'
  | 'STAFF_ATTENDANCE_STATUS_HALF_DAY'
  | 'STAFF_ATTENDANCE_STATUS_HOLIDAY'
  | 'STAFF_ATTENDANCE_STATUS_HALF_DAY_SECOND_SHIFT';

export type V1StaffAttendanceSource =
  | 'STAFF_ATTENDANCE_SOURCE_UNSPECIFIED'
  | 'STAFF_ATTENDANCE_SOURCE_MANUAL'
  | 'STAFF_ATTENDANCE_SOURCE_QRCODE'
  | 'STAFF_ATTENDANCE_SOURCE_BIOMETRIC';

export interface V1StaffDailyAttendanceMark {
  staffId: string;
  status: V1StaffAttendanceStatus;
  remark?: string;
  inTime?: string;
  outTime?: string;
  source?: V1StaffAttendanceSource;
  biometricDeviceData?: string;
  userAgent?: string;
}

export interface V1SaveStaffDailyAttendanceRequest {
  attendanceDate: string | null;
  roleName?: string;
  items?: Array<V1StaffDailyAttendanceMark>;
}

export interface V1StaffDailyAttendanceItem {
  attendanceId?: string;
  staffId?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  roleName?: string;
  status?: V1StaffAttendanceStatus;
  remark?: string;
  inTime?: string;
  outTime?: string;
  source?: V1StaffAttendanceSource;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1StaffDailyAttendanceReply {
  attendanceDate?: string | null;
  roleName?: string;
  items?: Array<V1StaffDailyAttendanceItem>;
}

export interface V1StaffMonthlyAttendanceReportItem {
  staffId?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  roleName?: string;
  totalMarked?: number;
  present?: number;
  late?: number;
  absent?: number;
  halfDay?: number;
  holiday?: number;
  halfDaySecondShift?: number;
  presentPercentage?: number;
}

export interface V1StaffMonthlyAttendanceReportReply {
  fromDate?: string | null;
  toDate?: string | null;
  roleName?: string;
  items?: Array<V1StaffMonthlyAttendanceReportItem>;
}

export interface V1StaffAttendanceScheduleFilter {
  id?: OperationStringFilterOperation;
  roleName?: OperationStringFilterOperation;
  status?: OperationStringFilterOperation;
}

export interface V1ListStaffAttendanceScheduleRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StaffAttendanceScheduleFilter;
}

export interface V1StaffAttendanceScheduleInput {
  roleName: string;
  status: V1StaffAttendanceStatus;
  entryTimeFrom: string;
  entryTimeTo: string;
  totalInstituteHour: string;
}

export interface V1SaveStaffAttendanceSchedulesRequest {
  roleNames?: Array<string>;
  items?: Array<V1StaffAttendanceScheduleInput>;
}

export interface V1ListStaffAttendanceScheduleReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StaffAttendanceSchedule>;
}

export interface V1StaffAttendanceSchedule {
  id?: string;
  roleName?: string;
  status?: V1StaffAttendanceStatus;
  entryTimeFrom?: string;
  entryTimeTo?: string;
  totalInstituteHour?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1StaffLeaveTypeFilter {
  id?: OperationStringFilterOperation;
  name?: OperationStringFilterOperation;
  isActive?: OperationBooleanFilterOperators;
}

export interface V1ListStaffLeaveTypeRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StaffLeaveTypeFilter;
}

export interface V1ListStaffLeaveTypeReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StaffLeaveType>;
}

export interface V1CreateStaffLeaveTypeRequest {
  name: string;
  isActive?: boolean;
}

export interface V1UpdateStaffLeaveType {
  id: string;
  name: string;
  isActive?: boolean;
}

export interface StaffLeaveTypeServiceUpdateStaffLeaveTypeRequest {
  leaveType?: V1UpdateStaffLeaveType;
  updateMask?: string;
}

export interface V1DeleteStaffLeaveTypeReply {
  id?: string;
  name?: string;
}

export interface V1StaffLeaveType {
  id?: string;
  name?: string;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1StaffLeaveAllocationFilter {
  id?: OperationStringFilterOperation;
  staffId?: OperationStringFilterOperation;
  roleName?: OperationStringFilterOperation;
  leaveTypeId?: OperationStringFilterOperation;
  academicSessionId?: OperationStringFilterOperation;
}

export interface V1ListStaffLeaveAllocationRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StaffLeaveAllocationFilter;
}

export interface V1ListStaffLeaveAllocationReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StaffLeaveAllocation>;
}

export interface V1CreateStaffLeaveAllocationRequest {
  staffId: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  academicSessionId?: string;
  allotedLeave?: number;
}

export interface V1UpdateStaffLeaveAllocation {
  id: string;
  staffId?: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  academicSessionId?: string;
  allotedLeave?: number;
}

export interface StaffLeaveAllocationServiceUpdateStaffLeaveAllocationRequest {
  allocation?: V1UpdateStaffLeaveAllocation;
  updateMask?: string;
}

export interface V1DeleteStaffLeaveAllocationReply {
  id?: string;
  staffId?: string;
  leaveTypeId?: string;
}

export interface V1StaffLeaveAllocation {
  id?: string;
  staffId?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  roleName?: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  academicSessionId?: string;
  academicSessionCode?: string;
  academicSessionName?: string;
  allotedLeave?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type V1StaffLeaveStatus =
  | 'STAFF_LEAVE_STATUS_UNSPECIFIED'
  | 'STAFF_LEAVE_STATUS_PENDING'
  | 'STAFF_LEAVE_STATUS_APPROVED'
  | 'STAFF_LEAVE_STATUS_DISAPPROVED';

export interface V1StaffLeaveFilter {
  id?: OperationStringFilterOperation;
  staffId?: OperationStringFilterOperation;
  roleName?: OperationStringFilterOperation;
  leaveTypeId?: OperationStringFilterOperation;
  status?: V1StaffLeaveStatus;
  academicSessionId?: OperationStringFilterOperation;
}

export interface V1ListStaffLeaveRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StaffLeaveFilter;
}

export interface V1ListStaffLeaveReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StaffLeave>;
}

export interface V1CreateStaffLeaveRequest {
  staffId: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  leaveFrom: string | null;
  leaveTo: string | null;
  applyDate: string | null;
  leaveDays?: number;
  employeeRemark?: string;
  adminRemark?: string;
  appliedByStaffId?: string;
  halfDayLeave?: string;
  academicSessionId?: string;
}

export interface V1UpdateStaffLeave {
  id: string;
  staffId?: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  leaveFrom?: string | null;
  leaveTo?: string | null;
  applyDate?: string | null;
  leaveDays?: number;
  employeeRemark?: string;
  adminRemark?: string;
  appliedByStaffId?: string;
  halfDayLeave?: string;
  academicSessionId?: string;
}

export interface StaffLeaveServiceUpdateStaffLeaveRequest {
  leave?: V1UpdateStaffLeave;
  updateMask?: string;
}

export interface V1UpdateStaffLeaveStatusRequest {
  id: string;
  status: V1StaffLeaveStatus;
  adminRemark?: string;
  approvedByStaffId?: string;
  approvedAt?: string | null;
}

export interface V1DeleteStaffLeaveReply {
  id?: string;
  staffId?: string;
}

export interface V1StaffLeave {
  id?: string;
  staffId?: string;
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  roleName?: string;
  leaveTypeId?: string;
  leaveTypeName?: string;
  leaveFrom?: string | null;
  leaveTo?: string | null;
  applyDate?: string | null;
  leaveDays?: number;
  employeeRemark?: string;
  adminRemark?: string;
  status?: V1StaffLeaveStatus;
  appliedByStaffId?: string;
  approvedByStaffId?: string;
  approvedAt?: string | null;
  halfDayLeave?: string;
  file?: BlobBlobFile;
  createdAt?: string | null;
  updatedAt?: string | null;
  academicSessionId?: string;
  academicSessionCode?: string;
  academicSessionName?: string;
}

export interface V1StudentDocumentFilter {
  id?: OperationStringFilterOperation;
  studentId?: OperationStringFilterOperation;
  title?: OperationStringFilterOperation;
}

export interface V1ListStudentDocumentRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentDocumentFilter;
}

export interface V1ListMyStudentDocumentRequest {
  pageOffset?: number;
  pageSize?: number;
  studentId?: string;
}

export interface V1ListStudentDocumentReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentDocument>;
}

export interface V1DeleteStudentDocumentReply {
  id?: string;
  studentId?: string;
  title?: string;
}

export interface V1StudentDocument {
  id?: string;
  studentId?: string;
  title?: string;
  file?: BlobBlobFile;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface V1StudentTimelineFilter {
  id?: OperationStringFilterOperation;
  studentId?: OperationStringFilterOperation;
  title?: OperationStringFilterOperation;
  timelineDate?: OperationDateFilterOperators;
  visibleToStudent?: OperationBooleanFilterOperators;
}

export interface V1ListStudentTimelineRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentTimelineFilter;
}

export interface V1ListMyStudentTimelineRequest {
  pageOffset?: number;
  pageSize?: number;
  studentId?: string;
}

export interface V1ListStudentTimelineReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentTimeline>;
}

export interface V1CreateStudentTimelineRequest {
  studentId: string;
  title: string;
  timelineDate: string | null;
  description?: string;
  visibleToStudent?: boolean;
}

export interface V1UpdateStudentTimeline {
  id: string;
  title?: string;
  timelineDate?: string | null;
  description?: string;
  visibleToStudent?: boolean;
}

export interface StudentTimelineServiceUpdateStudentTimelineRequest {
  timeline?: V1UpdateStudentTimeline;
  updateMask?: string;
}

export interface V1DeleteStudentTimelineReply {
  id?: string;
  studentId?: string;
  title?: string;
}

export interface V1StudentTimeline {
  id?: string;
  studentId?: string;
  title?: string;
  timelineDate?: string | null;
  description?: string;
  visibleToStudent?: boolean;
  file?: BlobBlobFile;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type V1StudentLeaveStatus =
  | 'STUDENT_LEAVE_STATUS_UNSPECIFIED'
  | 'STUDENT_LEAVE_STATUS_PENDING'
  | 'STUDENT_LEAVE_STATUS_APPROVED'
  | 'STUDENT_LEAVE_STATUS_DISAPPROVED';

export interface V1StudentLeaveFilter {
  id?: OperationStringFilterOperation;
  studentEnrollmentId?: OperationStringFilterOperation;
  classSectionId?: OperationStringFilterOperation;
  status?: V1StudentLeaveStatus;
}

export interface V1ListStudentLeaveRequest {
  pageOffset?: number;
  pageSize?: number;
  search?: string;
  sort?: Array<string>;
  fields?: string;
  filter?: V1StudentLeaveFilter;
}

export interface V1ListStudentLeaveReply {
  totalSize?: number;
  filterSize?: number;
  items?: Array<V1StudentLeave>;
}

export interface V1CreateStudentLeaveRequest {
  studentEnrollmentId: string;
  fromDate: string | null;
  toDate: string | null;
  applyDate: string | null;
  reason?: string;
  requestType?: string;
}

export interface V1UpdateStudentLeave {
  id: string;
  studentEnrollmentId?: string;
  fromDate?: string | null;
  toDate?: string | null;
  applyDate?: string | null;
  reason?: string;
  requestType?: string;
}

export interface StudentLeaveServiceUpdateStudentLeaveRequest {
  leave?: V1UpdateStudentLeave;
  updateMask?: string;
}

export interface V1UpdateStudentLeaveStatusRequest {
  id: string;
  status: V1StudentLeaveStatus;
  approvedByStaffId?: string;
  approvedAt?: string | null;
}

export interface V1DeleteStudentLeaveReply {
  id?: string;
  studentEnrollmentId?: string;
}

export interface V1StudentLeave {
  id?: string;
  studentEnrollmentId?: string;
  classSectionId?: string;
  fromDate?: string | null;
  toDate?: string | null;
  applyDate?: string | null;
  status?: V1StudentLeaveStatus;
  reason?: string;
  approvedByStaffId?: string;
  approvedAt?: string | null;
  requestType?: string;
  file?: BlobBlobFile;
  createdAt?: string | null;
  updatedAt?: string | null;
}
