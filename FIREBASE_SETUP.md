# Firebase Database Setup Guide

## 🎯 Why Firebase?

✅ **FREE** - No credit card required (Spark Plan)  
✅ **SAFE** - Google enterprise-grade security  
✅ **SIMPLE** - No backend code needed  
✅ **FAST** - Set up in 30 minutes  
✅ **SCALABLE** - Grows with your app  

---

## 📋 5-Minute Setup

### Step 1: Create Firebase Project

1. Go to **https://console.firebase.google.com**
2. Sign in with your Google account
3. Click **"Add project"**
4. Project name: `loan-management-system`
5. Uncheck "Enable Google Analytics"
6. Click **"Create project"**
7. Wait 2-3 minutes for setup

### Step 2: Get Your Firebase Config

1. In Firebase Console, click **⚙️ Settings** (top left)
2. Select **Project Settings**
3. Scroll down to "Your apps" section
4. Click **"</>"** (Web icon)
5. App name: `loan-management`
6. Check "Also set up Firebase Hosting"
7. Click **"Register app"**
8. Copy the config object that appears

**Config looks like this:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD1234567890...",
  authDomain: "loan-management-xxxxx.firebaseapp.com",
  projectId: "loan-management-xxxxx",
  storageBucket: "loan-management-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

9. Paste this config into `src/config/firebase.js`

### Step 3: Enable Authentication

1. Left sidebar → **Authentication**
2. Click **"Get started"**
3. Click **Email/Password** provider
4. Toggle **Enable** 
5. Click **Save**
6. ✅ Done!

### Step 4: Create Firestore Database

1. Left sidebar → **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose your region (closest to you)
5. Click **"Create"**
6. ✅ Done!

### Step 5: Set Security Rules

1. In Firestore → Click **"Rules"** tab
2. Replace all code with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User collections - each user can only access their own data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    
    // Loan applications - authenticated users can read/write
    match /loanApplications/{document=**} {
      allow create: if request.auth != null;
      allow read, update: if request.auth != null && (
        resource.data.borrowerId == request.auth.uid || 
        request.auth.token.role == 'LENDER' ||
        request.auth.token.role == 'ADMIN'
      );
      allow delete: if request.auth.token.role == 'ADMIN';
    }
    
    // Payments
    match /payments/{document=**} {
      allow create, read, update: if request.auth != null;
      allow delete: if request.auth.token.role == 'ADMIN';
    }
    
    // Applications awaiting review
    match /pendingApplications/{document=**} {
      allow read: if request.auth.token.role in ['LENDER', 'ADMIN'];
      allow update: if request.auth.token.role in ['LENDER', 'ADMIN'];
    }
  }
}
```

3. Click **"Publish"**
4. ✅ Done!

---

## ✅ Installation

Run this in terminal:

```bash
cd d:\loan-management-system
npm install firebase
```

---

## 📝 Database Structure

Firebase will automatically create these collections:

### `users` Collection
```
Document ID: User's Firebase Auth UID
{
  uid: "abc123...",
  username: "borrower",
  email: "user@example.com",
  name: "John Doe",
  phone: "+1-555-0101",
  role: "BORROWER",
  profile: {
    dob: "1990-05-15",
    maritalStatus: "single",
    dependents: 1,
    employmentType: "salaried",
    employer: "Tech Corp",
    designation: "Developer",
    workExperience: 8,
    monthlyIncome: 50000,
    existingLoans: "no",
    creditScore: 750,
    address: "123 Main St",
    city: "San Francisco",
    state: "California",
    zipCode: "94102",
    createdAt: Timestamp(2026, 2, 24)
  }
}
```

### `loanApplications` Collection
```
Document ID: Auto-generated
{
  borrowerId: "abc123...",
  borrowerName: "John Doe",
  borrowerEmail: "user@example.com",
  loanType: "personal",
  amount: 50000,
  tenure: 12,
  purpose: "Buy car",
  emi: 4350,
  interestRate: 10.5,
  totalPayable: 52200,
  totalInterest: 2200,
  status: "pending",
  personalInfo: {
    fullName: "John Doe",
    email: "user@example.com",
    phone: "+1-555-0101",
    dob: "1990-05-15",
    maritalStatus: "single",
    dependents: 1
  },
  employmentInfo: {
    employmentType: "salaried",
    employer: "Tech Corp",
    designation: "Developer",
    workExperience: 8,
    monthlyIncome: 50000
  },
  financialInfo: {
    existingLoans: "no",
    existingEMI: 0,
    creditCard: "no",
    creditScore: 750
  },
  address: {
    street: "123 Main St",
    city: "San Francisco",
    state: "California",
    zipCode: "94102"
  },
  applicationDate: Timestamp(2026, 2, 24),
  submittedAt: Timestamp(2026, 2, 24)
}
```

### `payments` Collection
```
Document ID: Auto-generated
{
  borrowerId: "abc123...",
  loanId: "loan-doc-id",
  amount: 4350,
  date: Timestamp(2026, 2, 24),
  method: "Credit Card",
  status: "completed",
  type: "EMI",
  transactionId: "TXN-12345"
}
```

---

## 🔐 Free Tier Limits (More than enough!)

| Feature | Free Limit | Your Need | Status |
|---------|-----------|----------|--------|
| **Read Operations** | 50K/day | ~1K/day | ✅ OK |
| **Write Operations** | 20K/day | ~500/day | ✅ OK |
| **Delete Operations** | 20K/day | ~100/day | ✅ OK |
| **Storage** | 1GB | ~100MB | ✅ OK |
| **Auth Users** | Unlimited | 100s | ✅ OK |
| **Bandwidth** | 1GB/month | ~500MB | ✅ OK |

**Bottom line:** Free tier handles millions of operations. You're safe!

---

## 🚀 Next Steps After Setup

1. **Get your Firebase config** from Step 2 above
2. **Paste it into** `src/config/firebase.js`
3. **Run the app:** `npm run dev`
4. **Test signup** → Data appears in Firebase Console!
5. **Test loan application** → Data saved to Firestore!

---

## 🐛 Troubleshooting

### Error: "Firebase config not found"
- Make sure `src/config/firebase.js` exists
- Check that firebaseConfig has all 6 values

### Error: "Permission denied"
- Might be security rules issue
- Go to Firestore → Rules → Make sure published
- Try this simplified version:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Data not appearing in Firebase
- Check browser console for errors (F12)
- Verify Firebase is initialized correctly
- Check Firestore rules allow the operation

### "createUserWithEmailAndPassword is not a function"
- Make sure you installed: `npm install firebase`
- Restart the dev server: `npm run dev`

---

## 📚 Learning Resources

- Firebase Docs: https://firebase.google.com/docs
- Firestore Tutorial: https://firebase.google.com/docs/firestore
- Firebase Auth: https://firebase.google.com/docs/auth
- React + Firebase: https://www.youtube.com/results?search_query=react+firebase

---

## 💡 Pro Tips

1. **Use Firebase Console** to view your data in real-time (super helpful for debugging)
2. **Never share your Firebase config** - it's public, that's fine
3. **API keys are limited** - Firebase uses security rules for protection
4. **Timestamp vs Date** - Always use `new Date()` in code, Firebase converts automatically
5. **Test often** - Create test users and loan applications in Firebase Console

---

## 😊 You're Ready!

That's literally all you need:
- ✅ Firebase project created
- ✅ Auth enabled
- ✅ Firestore database created
- ✅ Config file updated
- ✅ npm package installed

**Next: Update your code to use Firebase (I'll help with that!)**

---

Last Updated: February 24, 2026
