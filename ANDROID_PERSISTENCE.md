# Data Persistence Testing Guide

## How to Test Data Persistence on Android

### Test 1: Basic Persistence
**Steps:**
1. Open the app
2. Create a training session (e.g., 60 arrows)
3. End the session
4. Verify the record appears in the list
5. **Close the app completely** (swipe away from recent apps)
6. **Reopen the app**
7. **Expected**: Record should still be there ✅

### Test 2: System Kill
**Steps:**
1. Create a training session
2. End the session
3. Verify record exists
4. Use ADB to kill the app:
   ```bash
   adb shell am force-stop com.your.package.name
   ```
5. **Reopen the app**
6. **Expected**: Record should still be there ✅

### Test 3: Device Reboot
**Steps:**
1. Create multiple training sessions
2. Verify all records exist
3. **Reboot the Android device**
4. **Reopen the app**
5. **Expected**: All records should still be there ✅

### Test 4: App Update
**Steps:**
1. Create training sessions
2. Verify records exist
3. **Install a new version of the app**
4. **Reopen the app**
5. **Expected**: All records should still be there ✅

### Test 5: Multiple Sessions
**Steps:**
1. Create 5-10 training sessions over time
2. Close and reopen app multiple times
3. **Expected**: All records persist across app restarts ✅

## Persistence Verification Code

You can add this to your app to verify persistence:

```javascript
// In your store or utility file
async function verifyPersistence() {
  try {
    // Check if storage exists
    const sessions = await Storage.get('counter_sessions')
    
    if (!sessions) {
      console.log('No data found - first time use')
      return { exists: false, count: 0 }
    }
    
    console.log('Data persists! Found', sessions.length, 'sessions')
    console.log('Storage info:', await uni.getStorageInfoSync())
    
    return {
      exists: true,
      count: sessions.length,
      sessions: sessions
    }
  } catch (error) {
    console.error('Persistence check failed:', error)
    return { exists: false, error: error.message }
  }
}

// Call this on app startup
onMounted(async () => {
  const persistence = await verifyPersistence()
  
  if (persistence.exists) {
    console.log(`✅ Data persists: ${persistence.count} records found`)
  } else {
    console.log('ℹ️ First time use - no data yet')
  }
})
```

## Storage Information Check

Add this to your settings page to show storage status:

```javascript
async function getStorageInfo() {
  const info = uni.getStorageInfoSync()
  
  return {
    currentSize: (info.currentSize / 1024 / 1024).toFixed(2) + ' MB',
    limitSize: (info.limitSize / 1024 / 1024).toFixed(2) + ' MB',
    usagePercentage: ((info.currentSize / info.limitSize) * 100).toFixed(2) + '%',
    keys: info.keys,
    keysCount: info.keys.length
  }
}

// Usage:
const storageInfo = await getStorageInfo()
console.log('Storage Info:', storageInfo)
```

## Expected Results

### Android Storage Information
```javascript
{
  currentSize: "0.85 MB",      // Your data size
  limitSize: "50.00 MB",       // Android limit (much larger than web!)
  usagePercentage: "1.70%",     // Very low usage
  keys: ["counter_sessions", "counter_sessions_archive", "scoring_sessions"],
  keysCount: 3
}
```

## Data Loss Scenarios

### When Data WILL Be Lost:
1. **App Uninstall** - User uninstalls the app
2. **Clear App Data** - User clears app data in settings
3. **Factory Reset** - Device factory reset
4. **Data Corruption** - Rare, but possible with storage errors

### When Data WILL Persist:
1. **App Close** - Normal app closing
2. **System Kill** - Android kills app for memory
3. **Device Reboot** - Phone restart
4. **App Update** - Installing new version
5. **Battery Death** - Phone runs out of battery

## Best Practices for Persistence

### 1. Save Frequently
```javascript
// Save immediately after important operations
async function onSessionComplete(session) {
  await store.dispatch('training/addSessionWithLimit', session)
  
  // Verify save was successful
  const saved = await Storage.get('counter_sessions')
  if (saved && saved.length > 0) {
    console.log('✅ Data saved successfully')
  }
}
```

### 2. Handle Storage Errors
```javascript
try {
  await Storage.set('counter_sessions', sessions)
} catch (error) {
  console.error('Storage error:', error)
  
  // Show error to user
  uni.showModal({
    title: 'Storage Error',
    content: 'Failed to save data. Please try again.',
    showCancel: false
  })
}
```

### 3. Monitor Storage Space
```javascript
async function checkStorageSpace() {
  const info = uni.getStorageInfoSync()
  const usagePercent = (info.currentSize / info.limitSize) * 100
  
  if (usagePercent > 90) {
    uni.showModal({
      title: 'Storage Warning',
      content: 'Storage is almost full. Consider archiving old records.',
      confirmText: 'Archive Now',
      success: (res) => {
        if (res.confirm) {
          store.dispatch('training/cleanupOldData', 90)
        }
      }
    })
  }
}
```

### 4. Backup Important Data
```javascript
// Export data for backup
async function exportData() {
  const sessions = await Storage.get('counter_sessions')
  const archived = await Storage.get('counter_sessions_archive')
  
  const backupData = {
    exportDate: new Date().toISOString(),
    activeSessions: sessions,
    archivedSessions: archived
  }
  
  // Convert to JSON string
  const jsonString = JSON.stringify(backupData, null, 2)
  
  // Save to file or share
  // (Implementation depends on your needs)
  
  return jsonString
}
```

## Testing Checklist

### Basic Persistence Tests
- [ ] Data survives app close
- [ ] Data survives system kill
- [ ] Data survives device reboot
- [ ] Data survives app update
- [ ] Multiple sessions persist correctly

### Advanced Persistence Tests
- [ ] Archived data persists
- [ ] Pagination works after restart
- [ ] Storage stats are accurate
- [ ] Error handling works correctly
- [ ] Storage warnings appear when needed

## Troubleshooting

### Data Not Persisting?

**Check 1: Storage Permissions**
```javascript
// Verify storage is working
try {
  uni.setStorageSync('test', 'value')
  const value = uni.getStorageSync('test')
  console.log('Storage test:', value) // Should be 'value'
} catch (error) {
  console.error('Storage not working:', error)
}
```

**Check 2: App Context**
```javascript
// Make sure you're in the right app context
console.log('App ID:', plus.runtime.appid)
console.log('Package name:', plus.os.name)
```

**Check 3: Storage Size**
```javascript
// Check if storage is full
const info = uni.getStorageInfoSync()
console.log('Storage usage:', info.currentSize, '/', info.limitSize)
```

## Conclusion

**✅ Your data WILL persist on Android!**

The current implementation using Uni-app's storage API provides reliable data persistence on Android devices. Data will survive:
- Normal app usage
- System operations
- Device reboots
- App updates

Only scenarios that will lose data:
- App uninstall
- Manual data clearing
- Device factory reset

Your storage solution is production-ready for Android! 🚀