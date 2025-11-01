# ✅ Participant Selection & Bulk Actions Guide

## 🎯 Overview

You can now **select participants** with checkboxes and perform bulk actions like sending invitations and adding to shortlist!

## ✨ New Features

### 1. **Checkbox Selection**
- ✅ Select individual participants
- ✅ Select all participants with one click
- ✅ Visual feedback for selected rows

### 2. **Bulk Actions**
- ✅ **Invite Selected** - Send invitations to checked participants only
- ✅ **Add to Shortlist** - Move checked participants to shortlist panel

### 3. **Smart UI**
- ✅ Action buttons appear only when participants are selected
- ✅ Shows count of selected participants
- ✅ Clears selection after action completes

---

## 📋 How to Use

### Step 1: Select Participants

#### Option A: Select Individual Participants
1. Go to **Event Details** page
2. Check the boxes next to participants you want to select
3. Selection count appears in the header

#### Option B: Select All Participants
1. Click the checkbox in the table header
2. All participants will be selected
3. Click again to deselect all

### Step 2: Perform Bulk Actions

Once participants are selected, you'll see action buttons:

#### **Invite Selected**
```
[✉️ Invite Selected (5)]
```
- Sends invitation emails to selected participants
- Uses the default email template
- Marks participants as "invited"
- Shows progress toast notification

#### **Add to Shortlist**
```
[⭐ Add to Shortlist (5)]
```
- Adds selected participants to shortlist
- They appear in the "Shortlisted" tab
- Can send confirmation emails from there
- Shows success notification

---

## 🎨 Visual Guide

### Before Selection
```
┌─────────────────────────────────────────┐
│ Participants (20)                       │
├─────────────────────────────────────────┤
│ ☐ | Name | Email | Phone | ... | ✅❌⭐ │
│ ☐ | John | ...   | ...   | ... | ✅❌❌ │
│ ☐ | Jane | ...   | ...   | ... | ⏳❌❌ │
└─────────────────────────────────────────┘
```

### After Selection (5 participants)
```
┌─────────────────────────────────────────┐
│ Participants (20)                       │
│                  [Invite Selected (5)]  │
│                  [Add to Shortlist (5)] │
├─────────────────────────────────────────┤
│ ☑ | Name | Email | Phone | ... | ✅❌⭐ │
│ ☑ | John | ...   | ...   | ... | ✅❌❌ │
│ ☑ | Jane | ...   | ...   | ... | ⏳❌❌ │
│ ☐ | Mike | ...   | ...   | ... | ⏳❌❌ │
└─────────────────────────────────────────┘
```

---

## 🔄 Workflow Examples

### Workflow 1: Send Invitations to Specific Participants
1. **Upload CSV** with all participants
2. **Review the list** - check who to invite
3. **Select participants** - check boxes for people you want to invite
4. **Click "Invite Selected"** - sends emails immediately
5. **View results** - selected participants marked as "invited"

### Workflow 2: Create Shortlist and Send Confirmations
1. **Check-in happens** - participants attend the event
2. **Review checked-in participants**
3. **Select the best ones** - check boxes
4. **Click "Add to Shortlist"**
5. **Go to "Shortlisted" tab**
6. **Send confirmation emails** from there

### Workflow 3: Selective Invitation Strategy
1. **Upload 100 participants**
2. **Filter by criteria** (e.g., company, city)
3. **Select specific group** (e.g., all from "Tech Corp")
4. **Invite selected group first**
5. **Wait for responses**
6. **Invite next group**

---

## 🎯 Use Cases

### Corporate Event
**Scenario**: Invite VIPs first, then regular attendees
- Select VIPs → Invite Selected
- Wait 24 hours
- Select remaining → Invite Selected

### College Fest
**Scenario**: Shortlist winners after event
- Event happens
- Check who attended (Checked In)
- Select winners → Add to Shortlist
- Send prize confirmation emails

### Conference
**Scenario**: Staggered invitations by ticket type
- Select VIP ticket holders → Invite Selected
- Select Early Bird → Invite Selected
- Select General → Invite Selected

### Wedding
**Scenario**: Family first, then friends
- Select family members → Invite Selected
- Check RSVPs
- Select friends → Invite Selected

---

## 💡 Pro Tips

### Tip 1: Use Select All Wisely
```
✅ DO: Select All when you want to invite everyone
❌ DON'T: Select All then manually deselect many (tedious)
```

### Tip 2: Selection Persists
- Selection stays until you perform an action
- Actions clear the selection automatically
- You can change selection before clicking action button

### Tip 3: Check Status First
```
Before selecting, check the status columns:
- Invited: ✅ = Already invited, ⏳ = Not invited yet
- Checked In: ✅ = Attended, ❌ = Not attended
- Shortlisted: ⭐ = Already shortlisted, ❌ = Not shortlisted
```

### Tip 4: Combine with Filters (Future Feature)
```
Once filters are added, you can:
1. Filter by company
2. Select all filtered results
3. Invite selected group
```

---

## 📊 What Happens Behind the Scenes

### When You Click "Invite Selected"

```javascript
1. System collects all checked participant IDs
2. Validates that at least one is selected
3. Generates personalized emails for each
4. Sends emails in batches (100 per batch)
5. Marks participants as "invited"
6. Updates event statistics
7. Clears checkbox selection
8. Shows success notification
```

### When You Click "Add to Shortlist"

```javascript
1. System collects all checked participant IDs
2. Validates that at least one is selected
3. Updates database: shortlisted = true
4. Participants appear in "Shortlisted" tab
5. Updates event statistics
6. Clears checkbox selection
7. Shows success notification
```

---

## 🔒 Permissions & Validation

### Who Can Use This?
- ✅ Event creator
- ✅ Admin users
- ❌ Other users (will see 403 error)

### Validations
- ⚠️ At least 1 participant must be selected
- ⚠️ Selected participants must belong to the event
- ⚠️ Email sending respects rate limits (100 emails per 10 seconds)

---

## 🐛 Troubleshooting

### Issue: "Please select participants to invite"
**Cause**: No checkboxes are checked
**Solution**: Check at least one participant checkbox

### Issue: Action buttons don't appear
**Cause**: No participants selected yet
**Solution**: Click a checkbox - buttons will appear automatically

### Issue: Selection cleared after page refresh
**Cause**: Selection is not persisted (by design)
**Solution**: Make selections and perform actions in same session

### Issue: "Invite Selected" sends to all
**Cause**: Accidentally clicked "Select All" checkbox
**Solution**: 
1. Uncheck "Select All"
2. Manually select desired participants
3. Verify count in button before clicking

---

## 📈 Limits & Performance

| Action | Limit | Notes |
|--------|-------|-------|
| Participants per selection | 1000 | Practical limit |
| Emails per invitation | 500/day | Gmail free tier limit |
| Batch size | 100 | Automatic batching |
| Selection persistence | Session only | Cleared on refresh |

---

## 🎓 Best Practices

### ✅ Do's

1. **Review before selecting**
   - Check participant status
   - Verify email addresses
   - Confirm details are correct

2. **Use descriptive selections**
   - Select by criteria (company, city, etc.)
   - Group logically
   - Document your selection strategy

3. **Test with small groups first**
   - Select 5-10 participants
   - Send test invitations
   - Verify emails are received
   - Then select larger groups

4. **Track your progress**
   - Note who was invited when
   - Check "Invited" column for status
   - Monitor email delivery

### ❌ Don'ts

1. **Don't spam participants**
   - Check if already invited before selecting
   - Don't send duplicate invitations
   - Respect unsubscribe requests

2. **Don't select randomly**
   - Have a clear selection criteria
   - Document your selection logic
   - Be intentional

3. **Don't ignore limits**
   - Stay within 500 emails/day (Gmail)
   - Don't try to send too many at once
   - Respect rate limits

---

## 🚀 Future Enhancements

Planned features for future versions:

- 📝 **Filters & Search** - Filter before selecting
- 📋 **Saved Selections** - Save selection for later use
- 🏷️ **Tags** - Tag participants and select by tag
- 📊 **Advanced Filters** - Filter by multiple criteria
- 📧 **Preview Before Send** - Preview emails before sending
- ⏰ **Scheduled Sending** - Schedule invitations for later
- 📱 **Mobile Optimization** - Better checkbox experience on mobile

---

## 📚 Related Documentation

- [CSV Upload Guide](./CSV_UPLOAD_GUIDE.md) - Upload participants
- [Email Guide](./GMAIL_OAUTH_SETUP.md) - Setup email sending
- [Architecture](./ARCHITECTURE.md) - System design

---

## ✅ Summary

**New Capabilities:**
- ☑️ Select individual or all participants
- ✉️ Send invitations to selected only
- ⭐ Add selected to shortlist
- 🎯 More control over your event management

**Benefits:**
- 🎯 Targeted invitations
- ⏱️ Staggered sending strategy
- 📊 Better tracking
- 🚀 More efficient workflow

---

**You now have full control over who receives invitations and who gets shortlisted!** 🎉
