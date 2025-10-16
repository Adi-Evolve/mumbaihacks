# ✅ Extension Loading Checklist

## Before Loading Extension

- [x] Icons generated (icon16.png, icon48.png, icon128.png)
- [x] UI updated to soft modern design
- [x] Server connection configured (can update later)
- [ ] Chrome browser ready

---

## Loading Steps

### 1. Open Extensions Page
- [ ] Open Chrome
- [ ] Go to: `chrome://extensions/`
- [ ] Enable **Developer mode** (toggle top-right)

### 2. Load Extension
- [ ] Click **"Load unpacked"**
- [ ] Navigate to: `C:\Users\adiin\OneDrive\Desktop\Mumbaihacks\extension`
- [ ] Click **"Select Folder"**

### 3. Verify Load
- [ ] Extension appears in list
- [ ] Shield icon visible
- [ ] No errors shown
- [ ] "Misinformation Detector" name visible

---

## Testing the UI

### Test Popup
- [ ] Click extension icon in toolbar
- [ ] Popup opens (400px wide)
- [ ] Soft purple gradient header visible
- [ ] "Ready" status card shows
- [ ] Two buttons visible (Analyze, History)
- [ ] Settings section visible
- [ ] Toggle switch works
- [ ] Dropdown works

### Check Design
- [ ] Soft purple/lavender colors
- [ ] Rounded corners (20-24px)
- [ ] Smooth shadows
- [ ] Gentle animations
- [ ] Professional appearance

---

## Server Connection (Do Later)

When ready to connect to server:

### Get Server IP
- [ ] Friend starts server on their laptop
- [ ] Friend runs `ipconfig` (Windows)
- [ ] Note the IPv4 address (e.g., 192.168.1.100)

### Update Extension
- [ ] Open `extension/background.js`
- [ ] Find line 17
- [ ] Change: `http://localhost:8000/api/v1`
- [ ] To: `http://[FRIEND_IP]:8000/api/v1`
- [ ] Save file

### Reload Extension
- [ ] Go to `chrome://extensions/`
- [ ] Click reload icon (🔄) on extension
- [ ] Test connection on a news site

---

## Troubleshooting

### Extension won't load?
1. Check you selected the `extension` folder, not parent folder
2. Make sure Developer mode is ON
3. Check console for errors (click "Errors" button)
4. Verify all files present in extension folder

### Icons missing error?
- Should be fixed! Icons generated already ✅
- If still error, check `extension/icons/` contains PNG files

### UI looks different?
- Hard refresh: Ctrl+Shift+R
- Reload extension
- Clear browser cache

### Popup won't open?
- Check extension is enabled
- Try clicking icon again
- Check for JavaScript errors
- Reload extension

---

## Expected Results

### ✅ Success Looks Like:

**Popup:**
- Soft purple gradient at top
- White background
- "Ready" message
- Two gradient buttons
- Settings card with toggle
- Professional, polished look

**Icon:**
- Shield icon visible in toolbar
- Purple gradient background
- White shield shape
- Checkmark visible (on larger sizes)

**No Errors:**
- Extension list shows no errors
- Console is clean
- Everything loads smoothly

---

## Quick Demo Test (Without Server)

1. Load extension ✓
2. Click icon → popup opens ✓
3. UI looks soft and modern ✓
4. Toggle switch works ✓
5. Dropdown changes ✓

**Server connection test comes later!**

---

## Next Steps After Loading

1. ✅ Verify extension loads
2. ✅ Check UI is soft modern design
3. 📸 Take screenshot for reference
4. 🎨 Show teammates the design
5. ⏰ Wait for server setup
6. 🔗 Connect to friend's server
7. 🧪 Test full functionality
8. 🎉 Ready for demo!

---

## Files Reference

- Extension folder: `C:\Users\adiin\OneDrive\Desktop\Mumbaihacks\extension`
- Background config: `extension/background.js` (line 17)
- Setup guide: `SETUP_GUIDE.md`
- Changes summary: `CHANGES_SUMMARY.md`
- Design guide: `UI_DESIGN_GUIDE.md`

---

**Current Status:** Ready to load! 🚀

Just go to `chrome://extensions/` and load the extension folder!
