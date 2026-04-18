import { sanitizeInput } from './helpers'

class Security {
  static sanitize(data) {
    if (typeof data === 'string') {
      return sanitizeInput(data)
    } else if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item))
    } else if (typeof data === 'object' && data !== null) {
      const sanitized = {}
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          sanitized[key] = this.sanitize(data[key])
        }
      }
      return sanitized
    }
    return data
  }

  static validateInput(input, rules = {}) {
    const errors = []
    
    if (rules.required && (input === null || input === undefined || input === '')) {
      errors.push('此项为必填项')
    }
    
    if (rules.maxLength && input && input.length > rules.maxLength) {
      errors.push(`最大长度为 ${rules.maxLength} 个字符`)
    }
    
    if (rules.minLength && input && input.length < rules.minLength) {
      errors.push(`最小长度为 ${rules.minLength} 个字符`)
    }
    
    if (rules.pattern && input && !rules.pattern.test(input)) {
      errors.push('格式不正确')
    }
    
    if (rules.type) {
      switch (rules.type) {
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          if (input && !emailRegex.test(input)) {
            errors.push('邮箱格式不正确')
          }
          break
        case 'phone':
          const phoneRegex = /^1[3-9]\d{9}$/
          if (input && !phoneRegex.test(input)) {
            errors.push('手机号格式不正确')
          }
          break
        case 'number':
          if (input && isNaN(Number(input))) {
            errors.push('必须是数字')
          }
          break
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  static escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  static preventXSS(input) {
    return this.escapeHtml(this.sanitize(input))
  }

  static hashString(str) {
    let hash = 0
    if (str.length === 0) return hash
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    
    return Math.abs(hash).toString(36)
  }

  static generateToken() {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  static validateScore(score) {
    const numScore = Number(score)
    return !isNaN(numScore) && numScore >= 0 && numScore <= 10
  }

  static validateArrowCount(count) {
    const numCount = Number(count)
    return !isNaN(numCount) && numCount >= 0 && Number.isInteger(numCount)
  }

  static validateDuration(seconds) {
    const numSeconds = Number(seconds)
    return !isNaN(numSeconds) && numSeconds >= 0 && Number.isInteger(numSeconds)
  }

  static safeParseJSON(jsonString, defaultValue = null) {
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('JSON解析失败:', error)
      return defaultValue
    }
  }

  static safeStringify(obj, defaultValue = '{}') {
    try {
      return JSON.stringify(obj)
    } catch (error) {
      console.error('JSON序列化失败:', error)
      return defaultValue
    }
  }
}

export default Security