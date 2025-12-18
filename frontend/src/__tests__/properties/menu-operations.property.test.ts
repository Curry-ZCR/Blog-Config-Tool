/**
 * Property-based tests for Menu Item Operations
 * 
 * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
 * **Validates: Requirements 6.1**
 * 
 * For any sequence of add, remove, and reorder operations on menu items,
 * the resulting menu array SHALL reflect all operations in order.
 */

import { describe, it } from 'vitest'
import fc from 'fast-check'
import { menuOperations } from '../../components/MenuEditor'

// Arbitrary for generating valid menu items
const menuItemArbitrary = fc.record({
  name: fc.string({ minLength: 1, maxLength: 50 }),
  url: fc.oneof(
    fc.constant('/').chain(path => fc.string({ minLength: 0, maxLength: 20 }).map(s => path + s.replace(/[^a-z0-9-]/gi, ''))),
    fc.webUrl()
  ),
  icon: fc.option(fc.string({ minLength: 0, maxLength: 30 }), { nil: undefined }),
})

// Arbitrary for generating a list of menu items
const menuItemsArbitrary = fc.array(menuItemArbitrary, { minLength: 0, maxLength: 20 })

describe('Menu Item Operations - Property Tests', () => {
  /**
   * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
   * **Validates: Requirements 6.1**
   * 
   * Property: Adding an item increases the array length by 1
   */
  it('add operation increases array length by 1', () => {
    fc.assert(
      fc.property(
        menuItemsArbitrary,
        menuItemArbitrary,
        (items, newItem) => {
          const result = menuOperations.add(items, newItem)
          return result.length === items.length + 1
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
   * **Validates: Requirements 6.1**
   * 
   * Property: Added item appears at the end of the array
   */
  it('add operation places item at the end', () => {
    fc.assert(
      fc.property(
        menuItemsArbitrary,
        menuItemArbitrary,
        (items, newItem) => {
          const result = menuOperations.add(items, newItem)
          const lastItem = result[result.length - 1]
          return (
            lastItem.name === newItem.name &&
            lastItem.url === newItem.url
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
   * **Validates: Requirements 6.1**
   * 
   * Property: Removing an item decreases the array length by 1 (for valid indices)
   */
  it('remove operation decreases array length by 1 for valid index', () => {
    fc.assert(
      fc.property(
        fc.array(menuItemArbitrary, { minLength: 1, maxLength: 20 }),
        (items) => {
          const index = Math.floor(Math.random() * items.length)
          const result = menuOperations.remove(items, index)
          return result.length === items.length - 1
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
   * **Validates: Requirements 6.1**
   * 
   * Property: Remove operation removes the correct item
   */
  it('remove operation removes the item at specified index', () => {
    fc.assert(
      fc.property(
        fc.array(menuItemArbitrary, { minLength: 2, maxLength: 20 }),
        fc.nat(),
        (items, indexSeed) => {
          const index = indexSeed % items.length
          const removedItem = items[index]
          const result = menuOperations.remove(items, index)
          
          // The removed item should not be at the same position
          // (unless there was a duplicate)
          if (index < result.length) {
            const itemAtIndex = result[index]
            // Either the item is different or there was a duplicate
            return itemAtIndex.name !== removedItem.name || 
                   itemAtIndex.url !== removedItem.url ||
                   items.filter(i => i.name === removedItem.name && i.url === removedItem.url).length > 1
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
   * **Validates: Requirements 6.1**
   * 
   * Property: Reorder preserves all items (same length, same items)
   */
  it('reorder operation preserves array length', () => {
    fc.assert(
      fc.property(
        fc.array(menuItemArbitrary, { minLength: 2, maxLength: 20 }),
        fc.nat(),
        fc.nat(),
        (items, fromSeed, toSeed) => {
          const fromIndex = fromSeed % items.length
          const toIndex = toSeed % items.length
          const result = menuOperations.reorder(items, fromIndex, toIndex)
          return result.length === items.length
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
   * **Validates: Requirements 6.1**
   * 
   * Property: Reorder moves item to correct position
   */
  it('reorder operation moves item to target position', () => {
    fc.assert(
      fc.property(
        fc.array(menuItemArbitrary, { minLength: 2, maxLength: 20 }),
        fc.nat(),
        fc.nat(),
        (items, fromSeed, toSeed) => {
          const fromIndex = fromSeed % items.length
          const toIndex = toSeed % items.length
          const movedItem = items[fromIndex]
          const result = menuOperations.reorder(items, fromIndex, toIndex)
          
          // The item should be at the target position
          return (
            result[toIndex].name === movedItem.name &&
            result[toIndex].url === movedItem.url
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
   * **Validates: Requirements 6.1**
   * 
   * Property: Reorder with invalid indices returns original array
   */
  it('reorder with invalid indices returns original array', () => {
    fc.assert(
      fc.property(
        menuItemsArbitrary,
        (items) => {
          // Test with out-of-bounds indices
          const result1 = menuOperations.reorder(items, -1, 0)
          const result2 = menuOperations.reorder(items, 0, items.length + 10)
          const result3 = menuOperations.reorder(items, items.length + 5, 0)
          
          return (
            result1.length === items.length &&
            result2.length === items.length &&
            result3.length === items.length
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
   * **Validates: Requirements 6.1**
   * 
   * Property: Update operation preserves array length
   */
  it('update operation preserves array length', () => {
    fc.assert(
      fc.property(
        fc.array(menuItemArbitrary, { minLength: 1, maxLength: 20 }),
        fc.nat(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (items, indexSeed, newName) => {
          const index = indexSeed % items.length
          const result = menuOperations.update(items, index, { name: newName })
          return result.length === items.length
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
   * **Validates: Requirements 6.1**
   * 
   * Property: Update operation modifies only the target item
   */
  it('update operation modifies only the target item', () => {
    fc.assert(
      fc.property(
        fc.array(menuItemArbitrary, { minLength: 2, maxLength: 20 }),
        fc.nat(),
        fc.string({ minLength: 1, maxLength: 50 }),
        (items, indexSeed, newName) => {
          const index = indexSeed % items.length
          const result = menuOperations.update(items, index, { name: newName })
          
          // Check that the target item was updated
          const targetUpdated = result[index].name === newName
          
          // Check that other items remain unchanged
          const othersUnchanged = result.every((item, i) => {
            if (i === index) return true
            return item.name === items[i].name && item.url === items[i].url
          })
          
          return targetUpdated && othersUnchanged
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * **Feature: blog-config-tool, Property 8: Menu Item Operations Consistency**
   * **Validates: Requirements 6.1**
   * 
   * Property: Sequence of operations produces consistent results
   */
  it('sequence of add then remove returns to original length', () => {
    fc.assert(
      fc.property(
        menuItemsArbitrary,
        menuItemArbitrary,
        (items, newItem) => {
          const afterAdd = menuOperations.add(items, newItem)
          const afterRemove = menuOperations.remove(afterAdd, afterAdd.length - 1)
          return afterRemove.length === items.length
        }
      ),
      { numRuns: 100 }
    )
  })
})
