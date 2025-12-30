/**
 * Shared Formatters
 * 
 * Standardized date and currency formatting utilities for the entire app.
 * 
 * Date Standard: MM/DD/YYYY (displayed) -> YYYY-MM-DD (stored in database)
 * Currency Standard: $X,XXX.XX format
 */

// ============================================
// DATE FORMATTING
// ============================================

/**
 * Format a date string for display (MM/DD/YYYY)
 */
export function formatDateDisplay(date: string | Date | null | undefined): string {
  if (!date) return '';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const year = d.getFullYear();
  
  return `${month}/${day}/${year}`;
}

/**
 * Parse user input to database format (YYYY-MM-DD)
 * Handles multiple input formats:
 * - MM/DD/YYYY, M/D/YYYY
 * - MM-DD-YYYY
 * - MMDDYYYY (8 digits)
 * - YYYY-MM-DD (already correct)
 */
export function parseDateInput(input: string | undefined): string | undefined {
  if (!input) return undefined;
  
  const cleaned = input.trim().replace(/\s+/g, '');
  if (!cleaned) return undefined;
  
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) {
    return cleaned;
  }
  
  // MM/DD/YYYY or M/D/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cleaned)) {
    const [m, d, y] = cleaned.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  
  // MM-DD-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(cleaned)) {
    const [m, d, y] = cleaned.split('-');
    return `${y}-${m}-${d}`;
  }
  
  // MMDDYYYY (8 digits, no separators)
  if (/^\d{8}$/.test(cleaned)) {
    const m = cleaned.substring(0, 2);
    const d = cleaned.substring(2, 4);
    const y = cleaned.substring(4, 8);
    return `${y}-${m}-${d}`;
  }
  
  // Try to parse as a date string
  const date = new Date(cleaned);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return undefined;
}

/**
 * Auto-format date input as user types (adds slashes automatically)
 * Input: raw keystroke text
 * Output: formatted string with slashes (MM/DD/YYYY)
 */
export function formatDateInput(input: string): string {
  // Remove all non-numeric characters
  const digits = input.replace(/\D/g, '');
  
  // Limit to 8 digits (MMDDYYYY)
  const limited = digits.substring(0, 8);
  
  // Add slashes at appropriate positions
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 4) {
    return `${limited.substring(0, 2)}/${limited.substring(2)}`;
  } else {
    return `${limited.substring(0, 2)}/${limited.substring(2, 4)}/${limited.substring(4)}`;
  }
}

/**
 * Validate a date input is valid
 */
export function isValidDate(input: string | undefined): boolean {
  if (!input) return false;
  const parsed = parseDateInput(input);
  if (!parsed) return false;
  
  const date = new Date(parsed);
  return !isNaN(date.getTime());
}

// ============================================
// CURRENCY FORMATTING
// ============================================

/**
 * Format a number as currency for display ($X,XXX.XX)
 */
export function formatCurrencyDisplay(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Parse currency input to a number
 * Handles: $1,234.56, 1234.56, 1234, $1234
 */
export function parseCurrencyInput(input: string | undefined): number | undefined {
  if (!input) return undefined;
  
  // Remove $ and commas, trim whitespace
  const cleaned = input.replace(/[$,\s]/g, '').trim();
  if (!cleaned) return undefined;
  
  const num = parseFloat(cleaned);
  if (isNaN(num)) return undefined;
  
  // Round to 2 decimal places
  return Math.round(num * 100) / 100;
}

/**
 * Auto-format currency input as user types
 * Keeps numbers and decimal point only, formats with $ prefix
 */
export function formatCurrencyInput(input: string): string {
  // Remove everything except digits and decimal
  let cleaned = input.replace(/[^\d.]/g, '');
  
  // Handle multiple decimals - keep only the first
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 2
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  // Add $ prefix if there's any content
  return cleaned ? `$${cleaned}` : '';
}

/**
 * Format a number for input field (no $ prefix, just the number)
 */
export function formatNumberInput(input: string): string {
  // Remove everything except digits and decimal
  let cleaned = input.replace(/[^\d.]/g, '');
  
  // Handle multiple decimals - keep only the first
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit decimal places to 2
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }
  
  return cleaned;
}

// ============================================
// PHONE FORMATTING
// ============================================

/**
 * Format phone input as user types (XXX) XXX-XXXX
 */
export function formatPhoneInput(input: string): string {
  const digits = input.replace(/\D/g, '');
  const limited = digits.substring(0, 10);
  
  if (limited.length <= 3) {
    return limited;
  } else if (limited.length <= 6) {
    return `(${limited.substring(0, 3)}) ${limited.substring(3)}`;
  } else {
    return `(${limited.substring(0, 3)}) ${limited.substring(3, 6)}-${limited.substring(6)}`;
  }
}

/**
 * Parse phone to digits only for storage
 */
export function parsePhoneInput(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const digits = input.replace(/\D/g, '');
  return digits.length >= 10 ? digits : undefined;
}
