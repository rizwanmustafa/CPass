export const isAlphaNumeric = (str: string | null): boolean => {
    if (str === null) return true

    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
};

export const hasAlphaNumeric = (str: string | null): boolean => {
    if (str === null) return true

    let containsAlpha = false
    let containsNumber = false

    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (code > 47 && code < 58) containsNumber = true // numeric (0-9)
        if ((code > 64 && code < 91) || (code > 96 && code < 123)) {
            containsAlpha = true;
        }

        if (containsAlpha && containsNumber) return true;
    }

    return containsNumber && containsAlpha;
};

export const isValidEmail = (email: string | null): boolean => {
    if (email === null) return true

    const emailRegex = /^[a-z0-9]+[._]?[a-z0-9]+[@]\w+[.]\w{2,3}$/
    return emailRegex.test(email)
}