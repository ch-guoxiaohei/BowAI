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
}

export default Storage