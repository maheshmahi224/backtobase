# 📊 CSV Upload Guide - Flexible Column Support

## ✨ Overview

Back To Base supports **flexible CSV uploads** - you can include **any columns** you want! The system will automatically detect and store all your custom fields.

## 📝 Required Columns

Only **2 columns are required**:

| Column | Required | Description |
|--------|----------|-------------|
| `name` | ✅ Yes | Participant's full name |
| `email` | ✅ Yes | Participant's email (used for invitations) |

## 🎯 Optional Standard Columns

| Column | Description |
|--------|-------------|
| `phone` | Phone number (displayed separately in UI) |

## 🚀 Custom Columns - Add Anything!

You can add **unlimited custom columns** with any names you want:

### Examples:
- `company` - Company name
- `designation` - Job title
- `city` - Location
- `age` - Age
- `department` - Department
- `college` - Educational institution
- `year` - Year of study
- `roll_number` - Student ID
- `linkedin` - LinkedIn profile
- `registration_id` - Registration number
- `ticket_type` - VIP/General/Student
- `dietary_preference` - Veg/Non-Veg/Vegan
- ...and literally anything else!

## 📁 Sample CSV Formats

### Example 1: Corporate Event
```csv
name,email,phone,company,designation,city
John Doe,john@example.com,+1-555-0101,Tech Corp,Software Engineer,San Francisco
Jane Smith,jane@example.com,+1-555-0102,Design Co,UX Designer,New York
```

### Example 2: College Event
```csv
name,email,phone,college,year,department,roll_number
Alice Johnson,alice@university.edu,555-1234,MIT,3,Computer Science,CS2021001
Bob Williams,bob@university.edu,555-5678,Stanford,2,Mechanical Eng,ME2022045
```

### Example 3: Conference
```csv
name,email,company,ticket_type,dietary_preference,workshop
Sarah Lee,sarah@company.com,TechStart,VIP,Vegetarian,AI Workshop
Mike Chen,mike@corp.com,BigCorp,General,Non-Veg,Cloud Computing
```

### Example 4: Wedding
```csv
name,email,phone,relationship,meal_choice,plus_one
Emma Davis,emma@email.com,555-9999,Friend,Chicken,Yes
Ryan Moore,ryan@email.com,555-8888,Colleague,Vegetarian,No
```

### Example 5: Minimal (Only Required Fields)
```csv
name,email
John Doe,john@example.com
Jane Smith,jane@example.com
```

## 🎨 How It Works

### 1. **Upload CSV**
- System detects all column headers
- Extracts `name`, `email`, `phone` (if present)
- Stores all other columns in `customFields`

### 2. **Dynamic Display**
- Table automatically shows all your columns
- Column headers are automatically formatted
  - `company` → "Company"
  - `roll_number` → "Roll Number"
  - `dietary_preference` → "Dietary Preference"

### 3. **Data Storage**
```javascript
// Database structure
{
  name: "John Doe",
  email: "john@example.com",
  phone: "+1-555-0101",
  customFields: {
    company: "Tech Corp",
    designation: "Software Engineer",
    city: "San Francisco",
    age: "28"
  },
  // ... system fields (invited, checkedIn, etc.)
}
```

## ✅ Validation Rules

### Automatic Validation:
- ✅ **Email format** must be valid (contains @)
- ✅ **Duplicate detection** (same email for same event)
- ✅ **Empty row** detection
- ✅ **Required fields** (name & email must exist)

### What's NOT Validated:
- ❌ Custom column formats (stored as-is)
- ❌ Phone number format (any format accepted)
- ❌ Number vs text (all stored as strings)

## 📊 Best Practices

### ✅ Do's:
1. **Use clear column names**
   - ✅ `company`, `designation`, `city`
   - ❌ `col1`, `col2`, `data`

2. **Use lowercase with underscores**
   - ✅ `roll_number`, `phone_number`
   - ⚠️ `Roll Number` (spaces work but underscores are cleaner)

3. **Keep data consistent**
   - ✅ All rows have same columns
   - ⚠️ Some rows missing columns (will show as empty)

4. **Use UTF-8 encoding**
   - ✅ Supports international characters
   - ✅ Emojis, accents, etc.

### ❌ Don'ts:
1. **Don't use reserved field names** (these are system fields):
   - `_id`, `eventId`, `invited`, `checkedIn`, `shortlisted`
   - `token`, `emailStatus`, `source`, `createdAt`, `updatedAt`

2. **Don't use special characters in column names**
   - ❌ `email@domain`, `name#1`, `data$value`
   - ✅ `email_domain`, `name_1`, `data_value`

3. **Don't exceed reasonable limits**
   - ⚠️ 50+ columns may slow down UI
   - ✅ 5-15 columns is optimal

## 🔄 Example Use Cases

### Tech Conference
```csv
name,email,phone,company,designation,linkedin,github,tech_stack
```

### University Fest
```csv
name,email,phone,college,year,department,student_id,team_name
```

### Wedding
```csv
name,email,phone,relationship,meal_choice,plus_one,accommodation_needed
```

### Workshop
```csv
name,email,company,experience_level,laptop,programming_language
```

### Job Fair
```csv
name,email,phone,current_company,years_experience,looking_for,resume_link
```

## 🎯 Email Personalization

All custom fields can be used in email templates!

### Template Example:
```html
<p>Hi {{name}},</p>
<p>We're excited to have you from <strong>{{company}}</strong> joining us!</p>
<p>Your designation: {{designation}}</p>
<p>Event location: {{venue}}</p>
```

### Available Placeholders:
- `{{name}}` - Participant name
- `{{email}}` - Participant email
- `{{phone}}` - Phone number
- `{{eventName}}` - Event name
- `{{venue}}` - Event venue
- `{{date}}` - Event date
- `{{time}}` - Event time
- **`{{company}}`** - Any custom field!
- **`{{designation}}`** - Any custom field!
- **`{{city}}`** - Any custom field!

## 🛠️ Troubleshooting

### Issue: "Name and email are required"
**Solution**: Ensure your CSV has `name` and `email` columns (case-insensitive)

### Issue: "Participant already exists"
**Solution**: Each email can only be added once per event (prevents duplicates)

### Issue: Custom columns not showing
**Solution**: 
- Refresh the page after upload
- Check browser console for errors
- Verify CSV has headers in first row

### Issue: Special characters garbled
**Solution**: Save CSV with UTF-8 encoding
- Excel: "CSV UTF-8 (Comma delimited)"
- Google Sheets: File → Download → CSV

## 📈 Limits

| Metric | Limit | Notes |
|--------|-------|-------|
| Participants per upload | 10,000 | Practical limit |
| Custom columns | Unlimited | Recommended: 5-15 |
| Cell content length | 1000 chars | Per field |
| File size | 10 MB | CSV text file |

## 🎓 Pro Tips

1. **Test with small file first**
   - Upload 5-10 rows to verify format
   - Check table display
   - Then upload full list

2. **Export from any source**
   - Excel → Save As → CSV
   - Google Sheets → Download → CSV
   - Database → Export → CSV
   - Form responses → Download CSV

3. **Use consistent formatting**
   - Same date format across rows
   - Same phone format
   - Consistent capitalization

4. **Clean data before upload**
   - Remove extra spaces
   - Fix typos
   - Standardize values

## 📚 Resources

- **Sample CSV**: `sample-participants.csv` (included in project)
- **API Endpoint**: `POST /api/participants/upload/:eventId`
- **Frontend Component**: `EventDetails.js`

---

## 🎉 Summary

**You can now upload CSV files with ANY columns you need!**

**Required**: `name`, `email`  
**Optional**: Everything else!

The system will:
✅ Automatically detect all columns  
✅ Store all data  
✅ Display everything in the table  
✅ Make it available for email templates

**No more limitations - total flexibility!** 🚀
