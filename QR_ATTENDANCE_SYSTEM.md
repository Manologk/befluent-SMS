# QR Code Attendance System Implementation Plan

## Core Features

### 1. QR Code Scanning System
- Implement QR code reader using `react-qr-reader`
- Handle successful scans and errors
- Provide feedback to users during scanning

### 2. Attendance Management
- Mark attendance as present upon successful QR scan
- Record timestamp of attendance
- Store attendance history

### 3. Lesson & Subscription Management
- Deduct from remaining lessons
- Update subscription balance
- Handle edge cases (no remaining lessons, expired subscription)

### 4. Database Integration
- Create necessary database schema updates
- Implement API endpoints
- Handle data validation and error cases

## Implementation Checklist

### Frontend Tasks
- [ ] 1. Install and set up QR code scanning library
- [ ] 2. Create QR Scanner component
- [ ] 3. Implement scan result handling
- [ ] 4. Add loading states and user feedback
- [ ] 5. Create attendance confirmation UI
- [ ] 6. Add error handling and messages
- [ ] 7. Update student dashboard to show latest attendance
- [ ] 8. Following the endpoints, show students and parents from the database


### Backend Tasks
- [] 1. Create/Update database schema for:
    - Attendance records
    - Lesson tracking
    - Subscription balance
- [ ] 2. Implement new API endpoints:
    - POST /api/attendance/mark
    - GET /api/student/lessons-remaining
    - GET /api/student/subscription-balance
- [ ] 3. Add business logic for:
    - Attendance validation
    - Lesson deduction
    - Subscription balance update

### Testing Tasks
- [ ] 1. Test QR code scanning
- [ ] 2. Test attendance marking
- [ ] 3. Test lesson deduction
- [ ] 4. Test subscription balance updates
- [ ] 5. Test error scenarios

## Implementation Flow
1. Set up the QR code scanning component
2. Implement the attendance marking endpoint
3. Add lesson and subscription deduction logic
4. Tie everything together with proper error handling and UI feedback

## Technical Considerations

### 1. QR Code Format
- Standard format for QR codes
- Include student ID and possibly timestamp/session ID

### 2. Security
- Implement validation to prevent duplicate scans
- Add authentication checks
- Prevent QR code reuse

### 3. Error Handling
- Invalid QR codes
- Network issues
- No remaining lessons
- Expired subscription

## API Endpoints

### Attendance Marking
```
POST /api/attendance/mark
{
    "studentId": string,
    "timestamp": DateTime,
    "qrCode": string
}
```

### Student Lesson Status
```
GET /api/student/lessons-remaining/{studentId}
GET /api/student/subscription-balance/{studentId}
```

## Database Schema Updates

### Attendance Records
- student_id (FK)
- timestamp
- status
- qr_code_used
- lesson_deducted
- subscription_updated

### Student Balance
- remaining_lessons
- subscription_balance
- last_attendance
- subscription_status
