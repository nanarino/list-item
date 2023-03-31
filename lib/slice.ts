import { SliceRangeError, SliceTypeError } from './error'
import type { slice as _slice } from './types'
const { max, min } = Math


class slice implements _slice {
  start: number | null
  stop: number | null
  step: number | null
  constructor(...args: (number | null | undefined)[]) {
    if (args.length === 1) {
      this.start = null
      this.stop = args[0] ?? null
      this.step = null
    } else {
      this.start = args[0] ?? null
      this.stop = args[1] ?? null
      if (args[2] === 0) {
        throw new SliceRangeError(`slice step cannot be zero`)
      }
      this.step = args[2] ?? null
    }
  }
  static from(o: Partial<_slice>) {
    return new slice(o.start, o.stop, o.step)
  }
}

function _getitem<T>(arr: T[], indices: ConstructorParameters<typeof slice> | Partial<_slice> | number): T | T[] {
  if (!Array.isArray(arr)) {
    throw new SliceTypeError(`the 'getitem' only apply to 'list' object`)
  }
  if (typeof indices === "object") {
    const __s = Array.isArray(indices) ? new slice(...indices) : slice.from(indices)
    __s.step ||= 1
    let isReverse = (__s.step < 0)
    if (__s.start === null) {
      __s.start = (isReverse ? (arr.length - 1) : 0)
    } else {
      if (__s.start < 0) __s.start += arr.length
      __s.start = max(0, min(__s.start, arr.length - 1))
    }
    if (__s.stop === null) {
      __s.stop = (isReverse ? 0 : arr.length)
    } else {
      if (__s.stop < 0) __s.stop += arr.length
      __s.stop = max(0, min(isReverse ? (__s.stop + 1) : __s.stop, arr.length))
    }
    const items: T[] = []
    for (let index = __s.start; isReverse !== index < __s.stop; index += __s.step) {
      items.push(arr[index])
    }
    return items
  } else {
    if (!Number.isInteger(indices)) {
      throw new SliceTypeError(`list indices must be integers or slices`)
    }
    let __i = indices
    if (__i < 0) __i += arr.length
    if (__i < 0 || __i >= arr.length) {
      throw new SliceRangeError(`list index out of range`)
    }
    return arr[__i]
  }
}

export const getitem: (typeof _getitem) = (...args) => {
  try {
    return _getitem(...args)
  } catch (error) {
    if (Error.captureStackTrace) {
      if ((error instanceof SliceRangeError) || (error instanceof SliceTypeError)) {
        Error.captureStackTrace(error, getitem)
      }
    }
    throw error
  }
}

function _setitem<T>(arr: T[], indices: ConstructorParameters<typeof slice> | Partial<_slice> | number, value: T | T[]): void {
  if (!Array.isArray(arr)) {
    throw new SliceTypeError(`the 'setitem' only apply to 'list' object`)
  }
  if (typeof indices === "object") {
    const __s = Array.isArray(indices) ? new slice(...indices) : slice.from(indices)
    __s.step ||= 1
    let isReverse = (__s.step < 0)
    if (__s.start === null) {
      __s.start = (isReverse ? (arr.length - 1) : 0)
    } else {
      if (__s.start < 0) __s.start += arr.length
      __s.start = max(0, min(__s.start, arr.length - 1))
    }
    if (__s.stop === null) {
      __s.stop = (isReverse ? 0 : arr.length)
    } else {
      if (__s.stop < 0) __s.stop += arr.length
      __s.stop = max(0, min(isReverse ? (__s.stop + 1) : __s.stop, arr.length))
    }
    const __i: number[] = []
    for (let index = __s.start; isReverse !== index < __s.stop; index += __s.step) {
      __i.push(index)
    }
    let newItems: T[]
    if (__s.step !== 1) {
      if (Array.isArray(value)) {
        newItems = value
      } else {
        throw new SliceTypeError(`must assign list to extended slice`)
      }
      if (newItems.length !== __i.length) {
        throw new SliceRangeError(`attempt to assign sequence of size ${newItems.length} to extended slice of size ${__i.length}`)
      }
      for (const [i, v] of Object.entries(newItems)) {
        arr[__i[+i]] = v
      }
    } else {
      if (Array.isArray(value)) {
        newItems = value
      } else {
        throw new SliceTypeError(`can only assign a list`)
      }
      arr.splice(__s.start, __i.length, ...newItems)
    }

  } else {
    if (!Number.isInteger(indices)) {
      throw new SliceTypeError(`list indices must be integers or slices`)
    }
    let __i = indices
    if (__i < 0) __i += arr.length
    if (__i < 0 || __i >= arr.length) {
      throw new SliceRangeError(`list index out of range`)
    }
    arr[__i] = value as T
  }
}

export const setitem: (typeof _setitem) = (...args) => {
  try {
    return _setitem(...args)
  } catch (error) {
    if (Error.captureStackTrace) {
      if ((error instanceof SliceRangeError) || (error instanceof SliceTypeError)) {
        Error.captureStackTrace(error, setitem)
      }
    }
    throw error
  }
}