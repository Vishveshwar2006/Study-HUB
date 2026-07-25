# Security Spec: Firestore Attribute-Based Access Control (ABAC)

This specification defines the validation invariants, the "Dirty Dozen" malicious payloads, and the mitigation strategies applied in our Zero-Trust Firestore Security Rule layout.

## 1. Data Invariants
- **Identity Integrity**: For student profiles and personal records, writing operations must require authorization. The logged-in User ID (`request.auth.uid`) must match the record holder's ownerId, or the operator must be verified as an Admin, Principal, or authorized staff member.
- **Verification Rule**: All standard writes require verified profile states.
- **Immutability Invariant**: Unique keys like `rollNo`, `email`, and timestamps (`createdAt`) must remain unmodified after initial creation.
- **Key Safety Guard**: No shadow or unrecognized fields can be injected during operations.
- **Value Constraints**: Student locking state, desk IP configurations, test scores, and fee payment declarations are strictly system-only or require specific higher role authentication.

---

## 2. The "Dirty Dozen" Vulnerability Payloads

### Payload 1: Role Escalation (Identity Spoofing)
- **Target**: `/students/malicious_std`
- **Payload**: Attempt to self-assign a verified teacher privilege or alter `isLocked` state.
- **Expected Action**: `PERMISSION_DENIED` - Users are locked from self-modifying privileged flags.

### Payload 2: Shadow Field Injection
- **Target**: `/contactLeads/lead_901`
- **Payload**: `{ "id": "lead_901", "name": "Fake Lead", "email": "a@b.com", "phone": "1342", "courseInterest": "Phy", "status": "New", "date": "19-Jun-2026", "hacked_field": "unauthorized_data_leak" }`
- **Expected Action**: `PERMISSION_DENIED` - Schema enforcer bans unknown parameters.

### Payload 3: Value Poisoning (Buffer Exhaustion)
- **Target**: `/securitySOSAlerts/panic_1`
- **Payload**: `{ "id": "panic_1", "location": "A very long 1MB random string representing buffer bypass", "severity": "High" }`
- **Expected Action**: `PERMISSION_DENIED` - Size enforcements ban oversized fields.

### Payload 4: Orphaned Record Creation
- **Target**: `/batches/batch_empty`
- **Payload**: Unassigned teacher association or orphaned batch enrollment without course validation.
- **Expected Action**: `PERMISSION_DENIED` - Relational lookup verifies that associated records exist.

### Payload 5: Future-Dated Timestamps
- **Target**: `/announcements/post_1`
- **Payload**: `{ "date": "2035-12-31T23:59:59Z" }` (pretending announcement from far future)
- **Expected Action**: `PERMISSION_DENIED` - Temporal enforcer mandates timestamps match `request.time`.

### Payload 6: Anonymous Query Scraping
- **Target**: `/feeInvoices`
- **Payload**: Read billing listings without checking identity properties on invoices.
- **Expected Action**: `PERMISSION_DENIED` - List rules require authentic checking boundaries.

### Payload 7: Terminal State Bypass
- **Target**: `/feeInvoices/invoice_12`
- **Payload**: Modifying a paid receipt status back to unpaid to cause service disruption.
- **Expected Action**: `PERMISSION_DENIED` - Status updates are locked once terminal conditions are satisfied.

### Payload 8: Identity Impersonation (Owner Spoofing)
- **Target**: `/supportMessages/msg_abc`
- **Payload**: `{ "senderId": "legit_user_id", "content": "Fake request", "studentId": "victim_student" }` written by someone with a different `auth.uid`.
- **Expected Action**: `PERMISSION_DENIED` - Identity rules verify sender ID equals authenticated uid.

### Payload 9: Invalid Character Primary Keys
- **Target**: `/schools/school%20hacked`
- **Payload**: Registering an illegal string inside document identification path mappings.
- **Expected Action**: `PERMISSION_DENIED` - Path validation restricts primary keys to clean regex.

### Payload 10: Unauthorized Grade Modification
- **Target**: `/testSubmissions/sub_883`
- **Payload**: A student trying to rewrite their scored mark on an exam submission.
- **Expected Action**: `PERMISSION_DENIED` - High privilege levels are mandatory for grade adjustments.

### Payload 11: Desk Hijack
- **Target**: `/computerDesks/desk_01`
- **Payload**: Changing active IP address and terminal ownership from another seat.
- **Expected Action**: `PERMISSION_DENIED` - Restricts desk allocation to proctor/teacher roles.

### Payload 12: Device Key Poisoning
- **Target**: `/batches/math_101`
- **Payload**: Injecting unbounded items into student ids array.
- **Expected Action**: `PERMISSION_DENIED` - Strictly bounds list/array size constraints.
