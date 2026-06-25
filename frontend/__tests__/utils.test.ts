import { describe, it, expect } from 'vitest'
import { makeId, cls, timeAgo } from '../components/utils'
import { cn } from '../lib/utils'

describe('Frontend Utility Functions', () => {
  describe('makeId()', () => {
    it('should prepend the prefix', () => {
      const prefix = 'test-prefix-'
      const id = makeId(prefix)
      expect(id.startsWith(prefix)).toBe(true)
    })

    it('should generate a string of length prefix length plus random chars', () => {
      const prefix = 'bot-'
      const id1 = makeId(prefix)
      const id2 = makeId(prefix)
      expect(id1.length).toBeGreaterThan(prefix.length)
      expect(id1).not.toBe(id2)
    })
  })

  describe('cls()', () => {
    it('should join multiple classes', () => {
      expect(cls('class1', 'class2')).toBe('class1 class2')
    })

    it('should filter out falsy values', () => {
      expect(cls('class1', false && 'class2', null, undefined, 'class3')).toBe('class1 class3')
    })
  })

  describe('timeAgo()', () => {
    it('should return relative time for past dates', () => {
      const now = new Date()
      
      const secondsAgo = new Date(now.getTime() - 5000)
      expect(timeAgo(secondsAgo)).toContain('second')

      const hoursAgo = new Date(now.getTime() - 2 * 3600 * 1000)
      expect(timeAgo(hoursAgo)).toContain('hour')
    })
  })

  describe('cn()', () => {
    it('should merge classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    })

    it('should filter out falsy values', () => {
      expect(cn('class1', false && 'class2', null, undefined, 'class3')).toBe('class1 class3')
    })
  })
})
