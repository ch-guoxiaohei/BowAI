class Storage {
  static get(key) {
    return new Promise((resolve, reject) => {
      try {
        const data = uni.getStorageSync(key)
        resolve(data)
      } catch (error) {
        reject(error)
      }
    })
  }

  static set(key, value) {
    return new Promise((resolve, reject) => {
      try {
        uni.setStorageSync(key, value)
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  static remove(key) {
    return new Promise((resolve, reject) => {
      try {
        uni.removeStorageSync(key)
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  static clear() {
    return new Promise((resolve, reject) => {
      try {
        uni.clearStorageSync()
        resolve(true)
      } catch (error) {
        reject(error)
      }
    })
  }

  static getInfo() {
    return new Promise((resolve, reject) => {
      try {
        const info = uni.getStorageInfoSync()
        resolve(info)
      } catch (error) {
        reject(error)
      }
    })
  }

  static async getPaginated(key, page = 1, pageSize = 20) {
    try {
      const data = await Storage.get(key)
      if (!data || !Array.isArray(data)) {
        return { data: [], total: 0, page, pageSize, totalPages: 0 }
      }

      const total = data.length
      const totalPages = Math.ceil(total / pageSize)
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedData = data.slice(startIndex, endIndex)

      return {
        data: paginatedData,
        total,
        page,
        pageSize,
        totalPages
      }
    } catch (error) {
      console.error('分页获取数据失败:', error)
      return { data: [], total: 0, page, pageSize, totalPages: 0 }
    }
  }

  static async addWithLimit(key, newItem, maxItems = 100) {
    try {
      const data = await Storage.get(key) || []
      data.unshift(newItem)

      if (data.length > maxItems) {
        const removedItems = data.splice(maxItems)
        await Storage.set(key, data)
        return { success: true, data, removedItems, trimmed: true }
      }

      await Storage.set(key, data)
      return { success: true, data, trimmed: false }
    } catch (error) {
      console.error('添加数据失败:', error)
      return { success: false, error: error.message }
    }
  }

  static async getRecent(key, count = 10) {
    try {
      const data = await Storage.get(key)
      if (!data || !Array.isArray(data)) {
        return []
      }
      return data.slice(0, count)
    } catch (error) {
      console.error('获取最近数据失败:', error)
      return []
    }
  }

  static async getStorageSize() {
    try {
      const info = await Storage.getInfo()
      return {
        currentSize: info.currentSize,
        limitSize: info.limitSize,
        usagePercentage: ((info.currentSize / info.limitSize) * 100).toFixed(2)
      }
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return null
    }
  }

  static async archiveOldData(key, archiveKey, daysToKeep = 90) {
    try {
      const data = await Storage.get(key)
      if (!data || !Array.isArray(data)) {
        return { success: true, archived: 0, remaining: 0 }
      }

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const activeData = []
      const archivedData = []

      data.forEach(item => {
        const itemDate = new Date(item.startTime || item.date)
        if (itemDate < cutoffDate) {
          archivedData.push(item)
        } else {
          activeData.push(item)
        }
      })

      await Storage.set(key, activeData)

      const existingArchive = await Storage.get(archiveKey) || []
      const updatedArchive = [...archivedData, ...existingArchive]
      await Storage.set(archiveKey, updatedArchive)

      return {
        success: true,
        archived: archivedData.length,
        remaining: activeData.length
      }
    } catch (error) {
      console.error('归档旧数据失败:', error)
      return { success: false, error: error.message }
    }
  }
}

export default Storage