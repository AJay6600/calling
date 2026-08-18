export type ParsedCsvLead = {
  phoneNumber: string;
  fullName: string;
  email: string;
  companyName: string;
  isValid: boolean;
  validationError?: string;
  rowNumber: number;
};

export type CsvParseResult = {
  leads: ParsedCsvLead[];
  validCount: number;
  invalidCount: number;
  totalCount: number;
  errors: string[];
};

const E164_PATTERN = /^\+[1-9]\d{7,14}$/;

/**
 * Standardize phone number input into E.164 format if possible.
 */
const sanitizePhoneNumber = (raw: string): string => {
  let cleaned = raw.trim().replace(/[\s\-\(\)]/g, '');
  if (!cleaned.startsWith('+') && /^[1-9]\d{9,14}$/.test(cleaned)) {
    cleaned = `+${cleaned}`;
  }
  return cleaned;
};

/**
 * Splits a CSV line into fields respecting quoted string cells.
 */
const parseCsvLine = (line: string): string[] => {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
};

/**
 * Parses raw CSV string data into validated lead records.
 */
export const parseLeadsCsv = (csvContent: string): CsvParseResult => {
  const lines = csvContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      leads: [],
      validCount: 0,
      invalidCount: 0,
      totalCount: 0,
      errors: ['CSV file is empty.'],
    };
  }

  const headers = parseCsvLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/[^a-z0-9]/g, ''),
  );

  let phoneIdx = headers.findIndex((h) =>
    ['phone', 'phonenumber', 'contact', 'mobile', 'recipientphonenumber'].includes(
      h,
    ),
  );
  let nameIdx = headers.findIndex((h) =>
    ['name', 'fullname', 'contactname'].includes(h),
  );
  let emailIdx = headers.findIndex((h) =>
    ['email', 'emailaddress', 'mail'].includes(h),
  );
  let companyIdx = headers.findIndex((h) =>
    ['company', 'companyname', 'organization', 'org'].includes(h),
  );

  // If no explicit header match, assume column ordering: phone, name, email, company
  if (phoneIdx === -1) {
    phoneIdx = 0;
    if (headers.length > 1 && nameIdx === -1) nameIdx = 1;
    if (headers.length > 2 && emailIdx === -1) emailIdx = 2;
    if (headers.length > 3 && companyIdx === -1) companyIdx = 3;
  }

  const leads: ParsedCsvLead[] = [];
  const errors: string[] = [];
  let validCount = 0;
  let invalidCount = 0;

  // Determine whether line 0 was a header row
  const firstLineFields = parseCsvLine(lines[0]);
  const isFirstRowHeader = E164_PATTERN.test(
    sanitizePhoneNumber(firstLineFields[phoneIdx] || ''),
  )
    ? false
    : true;

  const startLineIdx = isFirstRowHeader ? 1 : 0;

  for (let i = startLineIdx; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const rawPhone = fields[phoneIdx] || '';
    const rawName = nameIdx !== -1 ? fields[nameIdx] || '' : '';
    const rawEmail = emailIdx !== -1 ? fields[emailIdx] || '' : '';
    const rawCompany = companyIdx !== -1 ? fields[companyIdx] || '' : '';

    const sanitizedPhone = sanitizePhoneNumber(rawPhone);
    const rowNum = i + 1;

    let isValid = true;
    let validationError: string | undefined;

    if (!sanitizedPhone) {
      isValid = false;
      validationError = 'Missing phone number';
    } else if (!E164_PATTERN.test(sanitizedPhone)) {
      isValid = false;
      validationError = `Invalid phone format (${sanitizedPhone}). Must be E.164 format (e.g. +919876543210)`;
    }

    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
      errors.push(`Row ${rowNum}: ${validationError}`);
    }

    leads.push({
      phoneNumber: sanitizedPhone,
      fullName: rawName,
      email: rawEmail,
      companyName: rawCompany,
      isValid,
      validationError,
      rowNumber: rowNum,
    });
  }

  return {
    leads,
    validCount,
    invalidCount,
    totalCount: leads.length,
    errors,
  };
};

/**
 * Returns sample CSV template data string.
 */
export const getSampleLeadsCsv = (): string => {
  return `phone_number,name,email,company_name
+919876543210,Rahul Sharma,rahul@example.com,Acme Corp
+919876543211,Priya Patel,priya@example.com,TechSolutions
+919876543212,Amit Kumar,amit@example.com,Global Systems`;
};
