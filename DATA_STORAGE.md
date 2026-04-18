# Data Storage and Large Dataset Handling

## Current Storage Implementation

### Storage Technology
- **Platform**: Uni-app local storage
- **API**: `uni.getStorageSync()` / `uni.setStorageSync()`
- **Storage Limit**: Typically 10MB per app
- **Data Format**: JSON strings
- **Persistence**: Permanent until app is uninstalled

### Current Data Structure

#### Training Sessions
```javascript
{
  id: "1713356400000",
  startTime: "2026-04-17 14:00:00",
  endTime: "2026-04-17 14:30:00",
  arrowCount: 60,
  duration: 1800
}
```

#### Storage Keys
- Active sessions: `counter_sessions`
- Archived sessions: `counter_sessions_archive`
- Scoring sessions: `scoring_sessions`

## Large Dataset Handling Strategy

### 1. **Automatic Limit and Archiving**

**Configuration:**
- **Maximum active records**: 100 sessions
- **Archive key**: `counter_sessions_archive`
- **Auto-archive trigger**: When adding 101st record

**Implementation:**
```javascript
async addSessionWithLimit({ commit, dispatch }, session) {
  const data = await Storage.get(TRAINING_STORAGE_KEY) || []
  data.unshift(session)

  let trimmed = false
  let removedItems = []

  if (data.length > MAX_SESSIONS) {
    removedItems = data.splice(MAX_SESSIONS)
    trimmed = true
  }

  await Storage.set(TRAINING_STORAGE_KEY, data)

  if (removedItems.length > 0) {
    await dispatch('archiveSessions', removedItems)
  }

  return { success: true, data, trimmed, removedCount: removedItems.length }
}
```

**User Feedback:**
- Toast notification when records are archived
- Shows count of archived records

### 2. **Pagination System**

**Configuration:**
- **Default page size**: 20 records per page
- **Dynamic pagination**: Based on total records
- **Pagination controls**: First, Previous, Next, Last

**Implementation:**
```javascript
async loadPaginatedSessions({ commit }, page = 1, pageSize = 20) {
  const data = await Storage.get(TRAINING_STORAGE_KEY) || []
  const total = data.length
  const totalPages = Math.ceil(total / pageSize)
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedData = data.slice(startIndex, endIndex)

  commit('SET_PAGINATED_SESSIONS', {
    data: paginatedData,
    page,
    pageSize,
    total,
    totalPages
  })
}
```

**Benefits:**
- Reduces memory usage
- Faster page loads
- Better user experience with large datasets

### 3. **Date-Based Cleanup**

**Configuration:**
- **Default retention period**: 90 days
- **Customizable**: User can specify days to keep
- **Automatic archiving**: Old records moved to archive

**Implementation:**
```javascript
async cleanupOldData({ dispatch }, daysToKeep = 90) {
  const data = await Storage.get(TRAINING_STORAGE_KEY) || []
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

  const activeData = []
  const archivedData = []

  data.forEach(item => {
    const itemDate = new Date(item.startTime)
    if (itemDate < cutoffDate) {
      archivedData.push(item)
    } else {
      activeData.push(item)
    }
  })

  await Storage.set(TRAINING_STORAGE_KEY, activeData)

  if (archivedData.length > 0) {
    await dispatch('archiveSessions', archivedData)
  }

  return {
    success: true,
    archived: archivedData.length,
    remaining: activeData.length
  }
}
```

### 4. **Storage Monitoring**

**Features:**
- Real-time storage usage tracking
- Percentage calculation
- Active vs archived record counts
- Storage limits awareness

**Implementation:**
```javascript
async getStorageStats() {
  const info = await Storage.getInfo()
  const sessions = await Storage.get(TRAINING_STORAGE_KEY) || []
  const archived = await Storage.get(TRAINING_ARCHIVE_KEY) || []

  return {
    success: true,
    currentSize: info.currentSize,
    limitSize: info.limitSize,
    usagePercentage: ((info.currentSize / info.limitSize) * 100).toFixed(2),
    activeSessions: sessions.length,
    archivedSessions: archived.length,
    totalSessions: sessions.length + archived.length
  }
}
```

## Performance Optimization

### Memory Management
1. **Lazy Loading**: Load only current page data
2. **Data Caching**: Cache frequently accessed data
3. **Garbage Collection**: Remove unnecessary data from memory

### Storage Optimization
1. **Data Compression**: Use efficient data structures
2. **Selective Loading**: Load only required fields
3. **Indexing**: Maintain sorted data for faster access

### User Experience
1. **Progressive Loading**: Show data as it loads
2. **Loading Indicators**: Visual feedback during operations
3. **Error Handling**: Graceful degradation on storage errors

## Usage Examples

### Scenario 1: Normal Usage (< 100 records)
- All records stored in `counter_sessions`
- No pagination needed
- Fast access to all data

### Scenario 2: Heavy Usage (100-500 records)
- Latest 100 records in `counter_sessions`
- Older records in `counter_sessions_archive`
- Pagination enabled (5 pages of 20 records each)
- User can navigate between pages

### Scenario 3: Very Heavy Usage (500+ records)
- Latest 100 records active
- Archive contains 400+ records
- Pagination for active records
- Periodic cleanup recommended
- Storage monitoring alerts

## API Reference

### Store Actions

#### `loadPaginatedSessions(page, pageSize)`
Load sessions with pagination
- `page`: Current page number (default: 1)
- `pageSize`: Records per page (default: 20)

#### `addSessionWithLimit(session)`
Add session with automatic limit enforcement
- `session`: Session object to add
- Returns: `{ success, data, trimmed, removedCount }`

#### `archiveSessions(sessions)`
Archive sessions to separate storage
- `sessions`: Array of sessions to archive
- Returns: `{ success, archivedCount }`

#### `loadArchivedSessions()`
Load all archived sessions
- Returns: `{ success, data }`

#### `deleteArchivedSession(sessionId)`
Delete a specific archived session
- `sessionId`: ID of session to delete
- Returns: `{ success }`

#### `getStorageStats()`
Get storage usage statistics
- Returns: `{ success, currentSize, limitSize, usagePercentage, activeSessions, archivedSessions, totalSessions }`

#### `cleanupOldData(daysToKeep)`
Archive records older than specified days
- `daysToKeep`: Number of days to keep (default: 90)
- Returns: `{ success, archived, remaining }`

### Store Getters

#### `pagination`
Current pagination state
```javascript
{
  page: 1,
  pageSize: 20,
  total: 100,
  totalPages: 5
}
```

#### `hasMorePages`
Check if there are more pages available

#### `isFirstPage`
Check if currently on first page

#### `isLastPage`
Check if currently on last page

## Best Practices

1. **Regular Cleanup**: Run cleanup periodically (e.g., monthly)
2. **Monitor Storage**: Check storage stats regularly
3. **User Communication**: Inform users about archiving
4. **Backup Strategy**: Consider cloud backup for important data
5. **Performance Testing**: Test with large datasets

## Future Enhancements

1. **Cloud Sync**: Sync data to cloud storage
2. **Export/Import**: Allow users to export/import data
3. **Advanced Search**: Search within archived records
4. **Data Analytics**: Provide insights from historical data
5. **Compression**: Implement data compression for storage