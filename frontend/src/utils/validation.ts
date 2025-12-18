/**
 * Validation utilities for the Blog Config Tool
 * Requirements: 4.1, 4.2, 4.3
 */

// ============================================
// Date Validation (Requirement 4.1)
// ============================================

/**
 * ISO 8601 date pattern: YYYY-MM-DD
 */
const ISO_DATE_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])$/

/**
 * ISO 8601 datetime pattern: YYYY-MM-DDTHH:mm:ss or with timezone
 */
const ISO_DATETIME_PATTERN = /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:[+-](?:[01]\d|2[0-3]):[0-5]\d|Z)?$/

/**
 * Validates that a date string matches ISO 8601 format
 * Accepts: YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss+HH:mm
 * 
 * @param dateString - The date string to validate
 * @returns true if the date string is valid ISO 8601 format
 */
export function isValidDateFormat(dateString: string): boolean {
  if (typeof dateString !== 'string' || dateString.length === 0) {
    return false
  }
  
  // Check if it matches date-only format
  if (ISO_DATE_PATTERN.test(dateString)) {
    return isValidDateValues(dateString.substring(0, 10))
  }
  
  // Check if it matches datetime format
  if (ISO_DATETIME_PATTERN.test(dateString)) {
    return isValidDateValues(dateString.substring(0, 10))
  }
  
  return false
}

/**
 * Validates that the date values are actually valid (e.g., no Feb 30)
 */
function isValidDateValues(dateStr: string): boolean {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}


// ============================================
// Required Field Validation (Requirement 4.2)
// ============================================

export interface ValidationResult {
  valid: boolean
  emptyFields: string[]
}

/**
 * Validates that all required fields have non-empty values
 * 
 * @param data - Object containing field values
 * @param requiredFields - Array of field names that are required
 * @returns ValidationResult with valid status and list of empty fields
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  requiredFields: string[]
): ValidationResult {
  const emptyFields: string[] = []
  
  for (const field of requiredFields) {
    const value = data[field]
    
    if (isEmptyValue(value)) {
      emptyFields.push(field)
    }
  }
  
  return {
    valid: emptyFields.length === 0,
    emptyFields,
  }
}

/**
 * Checks if a value is considered empty
 */
function isEmptyValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true
  }
  
  if (typeof value === 'string') {
    return value.trim().length === 0
  }
  
  if (Array.isArray(value)) {
    return value.length === 0
  }
  
  return false
}

// ============================================
// Filename Validation (Requirement 4.3)
// ============================================

/**
 * Pattern for valid URL-safe filenames
 * Only allows alphanumeric characters and hyphens
 */
const VALID_FILENAME_PATTERN = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/

/**
 * Pattern for invalid characters in filenames
 */
const INVALID_FILENAME_CHARS = /[^a-zA-Z0-9\-]/g

/**
 * Validates that a filename contains only URL-safe characters
 * 
 * @param filename - The filename to validate (without extension)
 * @returns true if the filename is valid
 */
export function isValidFilename(filename: string): boolean {
  if (typeof filename !== 'string' || filename.length === 0) {
    return false
  }
  
  return VALID_FILENAME_PATTERN.test(filename)
}

/**
 * Returns a list of invalid characters found in a filename
 * 
 * @param filename - The filename to check
 * @returns Array of invalid characters found
 */
export function getInvalidFilenameChars(filename: string): string[] {
  if (typeof filename !== 'string') {
    return []
  }
  
  const matches = filename.match(INVALID_FILENAME_CHARS)
  return matches ? [...new Set(matches)] : []
}
