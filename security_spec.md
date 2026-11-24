# Security Specification – EDU TEST AI MULTI-SCHOOL (Multi-Tenant Security Rules & Backend Authorization)

## I. 9 Core Security Principles (Nguyên tắc Bảo mật Đa trường)
1. **Deny by Default**: Both Firestore (`match /{document=**}`) and Cloud Storage (`match /{allPaths=**}`) reject all reads and writes unless explicitly granted.
2. **UID Authentication (`isSignedIn`)**: Every request must have a valid Firebase Authentication `request.auth.uid` and `request.auth.token.email_verified == true`.
3. **Membership Verification (`hasActiveMembership`)**: Every school-scoped operation verifies an active membership record in `/schools/{schoolId}/memberships/{uid}` or `/platformMemberships/{uid}_{schoolId}` with `status == 'ACTIVE'`. Revoking or locking a membership immediately revokes all access to that school's subcollections.
4. **School Lifecycle Status Verification (`isSchoolActive`)**: All operational reads and writes under `/schools/{schoolId}/...` verify that `/schools/{schoolId}.data.status == 'ACTIVE'`. Suspended (`SUSPENDED`) or archived (`ARCHIVED`) schools block operational mutations.
5. **Role Verification (`hasRoleInSchool`)**: Validates school-specific roles (`TEACHER`, `HEAD_OF_DEPARTMENT`, `PEER_REVIEWER`, `VICE_PRINCIPAL`, `PRINCIPAL`, `SCHOOL_ADMIN`).
6. **Functional Permission Verification (`hasFunctionalPermission`)**: Checks granular permissions (`CREATE_QUESTION`, `CREATE_MATRIX`, `CREATE_SPECIFICATION`, `CREATE_EXAM`, `REVIEW_EXAM`, `APPROVE_EXAM`, `ANALYZE_RESULTS`) on the user's membership for that specific `schoolId`.
7. **Subject & Grade Scope Verification (`hasSubjectAndGradeScope`)**: Validates that the target document's `subject` and `grade` belong to the teacher's `allowedSubjectsCsv` and `allowedGradesCsv` within that specific school.
8. **Dossier Access & Confidential Exam Guard (`canAccessDossier` & `canReadConfidentialExamData`)**: Secret exams (`SECRET_EXAM` / `CONFIDENTIAL_EXAM`) can only be read by the author or explicitly assigned exam council members. Neither `SUPER_ADMIN` nor `SCHOOL_ADMIN` can read secret exams by default. Approved/locked dossiers (`APPROVED`, `PUBLISHED`, `LOCKED`, `ARCHIVED`) are immutable from client updates.
9. **Zero Trust for Client `schoolId`**: Rules and backend endpoints never trust a `schoolId` payload parameter without matching it against the resource path `schoolId` AND verifying server-side membership for `request.auth.uid`.

## II. 10 Protected Firestore Collections (`/schools/{schoolId}/...`)
1. `schools` (`/schools/{schoolId}`)
2. `users` (`/users/{userId}` & `/schools/{schoolId}/users/{userId}`)
3. `memberships` (`/schools/{schoolId}/memberships/{userId}` & `/platformMemberships/{membershipId}`)
4. `permissions` (`/schools/{schoolId}/permissions/{permissionId}`)
5. `questions` (`/schools/{schoolId}/questions/{questionId}` & `/shared_question_repository/{sharedId}`)
6. `matrices` (`/schools/{schoolId}/matrices/{matrixId}` & `/schools/{schoolId}/specifications/{specificationId}`)
7. `exams` (`/schools/{schoolId}/exams/{examId}`)
8. `workflows` (`/schools/{schoolId}/workflows/{workflowId}` & `/schools/{schoolId}/examWorkflows/{workflowId}`)
9. `approvals` (`/schools/{schoolId}/approvals/{approvalId}`)
10. `results` (`/schools/{schoolId}/results/{resultId}` & `/schools/{schoolId}/examResults/{resultId}`)

## III. Storage Isolation (`schools/{schoolId}/exams/{examId}/...`)
- All exam and assessment files are isolated under `schools/{schoolId}/exams/{examId}/{fileName}` and `{schoolId}/{module}/{documentId}/{versionId}/{filename}`.
- Only authenticated members with active membership in `schoolId` and authorized dossier clearance can read or write.
- Confidential exams (`CONFIDENTIAL_EXAM`, `SECRET_ANSWER_KEY`) strictly enforce `publicUrlAllowed == 'false'` and forbid public URL generation or unauthenticated direct access.

## IV. 10 Mandatory Security Test Scenarios (Emulator & Rule Evaluation Suite)
1. **Unauthenticated User**: Read/write Firestore or Storage without valid `auth.uid` -> `PERMISSION_DENIED`.
2. **Teacher of School A Reads School B**: Teacher with active membership in `sch-tieu-hoc-a` queries `/schools/sch-thcs-b/questions/...` -> `PERMISSION_DENIED`.
3. **School Admin A Modifies School B**: School Admin of `sch-tieu-hoc-a` attempts to update `/schools/sch-thcs-b` or its memberships/permissions -> `PERMISSION_DENIED`.
4. **Teacher Self-Privilege Escalation**: Teacher attempts to update their own `roles` to `SCHOOL_ADMIN`/`SUPER_ADMIN` or write to `/schools/{schoolId}/permissions/...` -> `PERMISSION_DENIED`.
5. **Unauthorized User Reads Confidential Exam**: Teacher or unassigned user attempts `GET /schools/{schoolId}/exams/{secretExamId}` where `securityClassification == 'SECRET_EXAM'` -> `PERMISSION_DENIED`.
6. **User Modifies Approved Dossier**: Teacher or HOD attempts `UPDATE` on a question, matrix, or exam whose `status == 'APPROVED'` -> `PERMISSION_DENIED`.
7. **Multi-School User Context Switch**: Teacher belonging to both School A (Grade 5 Math) and School B (Grade 6 KHTN) switches schools; attempting to create a Grade 6 KHTN exam in School A or use School A permissions in School B -> `PERMISSION_DENIED` (while authorized actions in the active school succeed).
8. **Revoked / Locked Membership Access**: User whose membership `status` is changed to `'LOCKED'` or `'REVOKED'` attempts to read or write in that school -> `PERMISSION_DENIED`.
9. **Super Admin Reads Confidential Exam Without Clearance**: `SUPER_ADMIN` (`canReadConfidentialExam == false`) attempts to read `SECRET_EXAM` content -> `PERMISSION_DENIED`.
10. **Direct Storage Access & Public URL on Secret Exam**: Direct unauthenticated/cross-school access to `schools/{schoolId}/exams/{examId}/de-chinh-thuc.pdf` or uploading a secret exam with `publicUrlAllowed == 'true'` -> `PERMISSION_DENIED`.
