# Login & Authentication System

## User Registration & Authentication

### ✅ Complete Real-World Application Flow

The system now implements a complete real-world loan management workflow:

1. **User Registration (Signup)**
   - New users can create accounts with complete personal and employment details
   - Multi-step form with validation
   - Data is securely stored in localStorage with proper persistence
   - Default role: BORROWER for new users

2. **User Login**
   - Existing users can login with credentials
   - Session persists across browser tabs and page refreshes
   - Demo credentials available for testing

3. **Loan Application**
   - Borrowers can apply for loans
   - Pre-filled with their profile data
   - All application details saved with borrower information
   - Reference number (Application ID) provided upon submission

---

## Default Test Accounts

### Borrower Account
- **Username:** `borrower`
- **Password:** `1234`
- **Role:** Borrower
- **Email:** john.doe@example.com
- **Pre-filled Details:**
  - Name: John Doe
  - Phone: +1-555-0101
  - Employment: Tech Innovations Inc (Senior Developer)
  - Monthly Income: $50,000
  - Credit Score: 750
  - Location: San Francisco, California

### Lender Account
- **Username:** `lender`
- **Password:** `1234`
- **Role:** Lender
- **Company:** Global Finance Corp

### Admin Account
- **Username:** `admin`
- **Password:** `1234`
- **Role:** Ad

### Analyst Account
- **Username:** `analyst`
- **Password:** `1234`
- **Role:** Analyst

---

## User Registration Flow

### How to Create a New Account

1. **Navigate to Signup Page**
   - Go to `/signup` or click "Create one now" on login page

2. **Step 1: Basic Information**
   - Enter Full Name
   - Email Address (must be unique)
   - Phone Number
   - Choose Username (min. 3 characters)
   - Set Password (min. 4 characters)
   - Confirm Password

3. **Step 2: Employee & Financial Details**
   - Date of Birth
   - Marital Status
   - Number of Dependents
   - Employment Type (Salaried, Self-Employed, Business, Freelance)
   - Employer Name
   - Job Designation
   - Work Experience (years)
   - Monthly Income
   - Existing Loans Status
   - Credit Score (optional)

4. **Step 3: Address Information**
   - Street Address
   - City
   - State
   - Zip Code

5. **Account Created**
   - User is automatically logged in
   - Redirected to dashboard
   - Profile data persists in localStorage

---

## Loan Application Process

### Complete Application Workflow

1. **Start Application**
   - Logged-in borrowers navigate to "Apply for Loan"
   - Personal and employment details are pre-filled from profile

2. **Step 1: Select Loan Type**
   - Choose from: Personal, Home, Auto, Education, Business
   - View interest rates and maximum amounts

3. **Step 2-4: Fill Details**
   - Loan amount and tenure
   - Personal information (pre-filled)
   - Employment details (pre-filled)
   - Financial information
   - Complete address

4. **Step 5: Review & Submit**
   - Review all entered details
   - EMI calculations displayed
   - Submit application

5. **Confirmation**
   - Success modal with Application Reference ID
   - Monthly EMI and loan details shown
   - Automatic redirect to Loan History after 3 seconds

### Data Saved in Application

When a borrower applies for a loan, the following details are saved:

```javascript
{
  borrowerId: user.id,
  borrowerName: user.name,
  borrowerEmail: user.email,
  loanType: "personal|home|auto|education|business",
  amount: 50000,
  tenure: 12,
  purpose: "...",
  emi: 4350,
  interestRate: 10.5,
  personalInfo: {
    fullName, email, phone, dob, 
    maritalStatus, dependents, 
    address, city, state, zipCode
  },
  employmentInfo: {
    employmentType, employer, designation,
    workExperience, monthlyIncome
  },
  financialInfo: {
    existingLoans, existingEMI, 
    creditCard, creditScore
  },
  status: "pending",
  applicationDate: "2026-02-24T10:30:00Z"
}
```

---

## Data Persistence

### Local Storage Structure

**Users Database:** `lms_users`
```javascript
[
  {
    id: number,
    username: string,
    password: string,
    name: string,
    email: string,
    phone: string,
    role: "BORROWER" | "LENDER" | "ADMIN" | "ANALYST",
    profile: {
      dob, maritalStatus, dependents,
      employmentType, employer, designation,
      workExperience, monthlyIncome,
      existingLoans, creditScore,
      address, city, state, zipCode,
      createdAt: ISO timestamp
    }
  }
]
```

**Current User Session:** `lms_currentUser`
- Stores the currently logged-in user (without password)
- Automatically restored on page refresh

**Application State:** `loanAppState`
- Stores all loan applications, payments, and other app data
- Linked to user profiles for complete data persistence

---

## Testing the Complete Flow

### Test Scenario 1: Create New Borrower Account

1. Navigate to `http://localhost:5173/signup`
2. Fill in all required details across 3 steps
3. Click "Create Account"
4. System creates account and auto-logs in
5. You're redirected to dashboard

### Test Scenario 2: Apply for Loan with New Account

1. From dashboard, click "Apply for Loan"
2. Observe pre-filled details from your profile
3. Adjust loan amount, tenure, purpose as needed
4. Review EMI calculations
5. Click "Submit Application"
6. View Application Reference in success modal
7. Check Loan History to see submitted application

### Test Scenario 3: Login as Demo User

1. Navigate to `http://localhost:5173/login`
2. Use credentials: `borrower` / `1234`
3. Click "Sign In"
4. View pre-existing profile data
5. Apply for loan to test with demo data

---

## Security & Best Practices

✅ **Implemented Features**
- Password validation (min. 4 characters)
- Email uniqueness validation
- Username uniqueness validation
- Persistent session via localStorage
- Form validation before submission
- User data separated from password storage

⚠️ **Production Considerations**

For deployment, implement:
- Backend authentication with secure token management
- Password hashing (bcrypt, Argon2)
- HTTPS/TLS encryption
- Secure session management
- Rate limiting on login attempts
- Email verification for new accounts
- Password reset via email
- Two-factor authentication (2FA)
- Account lockout after failed attempts
- Audit logging for sensitive operations

---

## Modifying User Accounts

To add or edit test users, edit `DEFAULT_USERS` in:
**File:** `src/context/AuthContext.jsx`

```javascript
const DEFAULT_USERS = [
  {
    id: 1,
    username: 'borrower',
    password: '1234',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0101',
    role: 'BORROWER',
    profile: {
      dob: '1990-05-15',
      maritalStatus: 'single',
      // ... other fields
    }
  },
  // Add more users here...
];
```

---

## Troubleshooting

### "Username already exists"
- Username must be unique. Try a different username.

### "Email already registered"
- Email must be unique. Use a different email address.

### Session Lost
- Clear browser cache/cookies
- Check if localStorage is enabled
- Verify browser hasn't cleared site data

### Loan Application Not Saving
- Check browser console for errors
- Ensure all required fields are filled (marked with *)
- Verify localStorage quota not exceeded

---

Last Updated: February 24, 2026

