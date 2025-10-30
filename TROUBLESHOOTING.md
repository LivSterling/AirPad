# Troubleshooting Guide - AirPad MVP

## Issues Fixed

### ✅ Error: Cannot find module 'critters'
**Solution:** Installed missing Next.js optimization package
```bash
npm install critters --save-dev
```

### ✅ Error: Cannot find Tone.js ESM modules
**Solution:** Updated `next.config.js` to transpile Tone.js
```javascript
transpilePackages: ['tone']
```

### ✅ TypeError: Constructor errors
**Solution:** Cleaned build cache and npm cache
```bash
npm run clean
npm cache clean --force
```

---

## Current Status

The dev server should now be running at **http://localhost:3000**

### If you see errors:

1. **Check the terminal output** - Look for specific error messages
2. **Hard refresh** - Try Ctrl+Shift+R in your browser
3. **Restart dev server** - Stop (Ctrl+C) and run `npm run dev` again

### If Tone.js still has issues:

```bash
# Complete reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## Testing the App

Once the server is running successfully:

1. **Navigate to** http://localhost:3000
2. **Grant camera permissions** when prompted
3. **Position your hand** in the camera view
4. **Move your hand** - You should see hover highlights on the grid
5. **Pinch your fingers** - You should hear sounds trigger

---

## Common Issues

### Camera not working
- Check browser permissions (Chrome > Settings > Privacy > Camera)
- Ensure no other app is using the camera
- Try a different browser (Chrome recommended)

### No sound
- Check browser audio permissions
- Verify volume is up
- Check browser console for audio loading errors
- Samples should be in `public/kits/drums/`, `public/kits/piano/`, `public/kits/synth/`

### Hand tracking not detecting
- Ensure good lighting
- Keep hand in center of camera view
- Try different hand positions
- Check browser console for MediaPipe errors

### Build errors persist
```bash
# Nuclear option - complete reset
cd C:\Users\commo\Desktop\AirPad
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

---

## Browser Console Debugging

Open browser DevTools (F12) and check for:
- ✅ "AudioEngine initialized successfully"
- ✅ "HandTracker initialized successfully"
- ✅ "Loaded: drums-0" (for each sample)
- ❌ Any red errors about missing modules

---

## Performance Tips

If hand tracking is slow:
1. Close other tabs/applications
2. Use Chrome (best MediaPipe performance)
3. Ensure good lighting (reduces false positives)
4. Check CPU usage

If audio has latency:
1. Close other audio applications
2. Check browser audio settings
3. Try headphones instead of speakers

---

## Next Steps

Once everything is working:
1. Test all 9 pads in the grid
2. Test kit switching (Drums/Piano/Synth buttons)
3. Try voice commands (say "record", "stop", etc.)
4. Report any issues for Day 2 improvements

---

## Getting Help

If you encounter new errors:
1. Check the browser console (F12)
2. Check the terminal output
3. Note the exact error message
4. Check which component is failing

**All systems should be green and ready to test the hand tracking + audio triggering!**

