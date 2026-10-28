export const getLocalizedName = (field: any, currentLang: string = 'uk') => {
  if (!field) return '';

  
  let data = field;
  if (typeof field === 'string') {
    try {
      data = JSON.parse(field);
    } catch (e) {
      
      return field;
    }
  }
  if (typeof data === 'object' && data !== null) {
    return data[currentLang] || data.uk || Object.values(data)[0] || '';
  }

  return String(field);
};