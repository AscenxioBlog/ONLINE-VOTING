// Validate Computer Science student ID format
export const validateComputerScienceStudentId = (studentId) => {
  if (!studentId) return false;
  
  // Remove spaces and convert to uppercase
  const cleanId = studentId.replace(/\s+/g, '').toUpperCase();
  
  // Patterns for Computer Science students
  const hndPattern = /^FPI\/HND\/COM\/\d{2}\/\d+$/; // FPI/HND/COM/24/001
  const ndComPattern = /^FPI\/ND\/COM\/\d{2}\/\d+$/;  // FPI/ND/COM/24/001
  const ndPattern = /^FPI\/ND\/\d{2}\/\d+$/;         // FPI/ND/24/001
  
  return hndPattern.test(cleanId) || ndComPattern.test(cleanId) || ndPattern.test(cleanId);
};

// Extract year from student ID
export const extractYearFromStudentId = (studentId) => {
  const cleanId = studentId.replace(/\s+/g, '').toUpperCase();
  const match = cleanId.match(/\/(\d{2})\//);
  return match ? `20${match[1]}` : null;
};

// Extract program type from student ID
export const extractProgramType = (studentId) => {
  const cleanId = studentId.replace(/\s+/g, '').toUpperCase();
  if (cleanId.includes('/HND/COM/')) return 'HND Computer Science';
  if (cleanId.includes('/ND/COM/')) return 'ND Computer Science';
  if (cleanId.includes('/ND/')) return 'ND Computer Science';
  return null;
};