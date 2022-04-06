export const isAlphaNumeric = (str: string | null): boolean => {
  if (str === null) return true;

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (!(code > 47 && code < 58) && // numeric (0-9)
      !(code > 64 && code < 91) && // upper alpha (A-Z)
      !(code > 96 && code < 123)) { // lower alpha (a-z)
      return false;
    }
  }
  return true;
};

export const hasAlphaNumeric = (str: string | null): boolean => {
  if (str === null) return true;

  let containsAlpha = false, containsNumber = false;

  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // numeric (0-9)
    if (code > 47 && code < 58) containsNumber = true;
    // upper alpha (A-Z) || lower alpha (a-z)
    if ((code > 64 && code < 91) || (code > 96 && code < 123)) containsAlpha = true;

    if (containsAlpha && containsNumber) return true;
  }

  return false;
};

export const isValidEmail = (email: string | null): boolean => {
  if (email === null) return true; // WOW, this is a valid email! TODO: Fix this later

  const emailRegex = /^[a-z0-9]+[._]?[a-z0-9]+[@]\w+[.]\w{2,3}$/;
  return emailRegex.test(email);
};