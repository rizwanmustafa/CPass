from string import ascii_lowercase, ascii_uppercase, ascii_lowercase, digits, punctuation
from secrets import choice, randbelow


def generate_password(length: int, uppercase: bool, lowercase: bool, numbers: bool, specials: bool) -> str:
    if uppercase == lowercase == numbers == specials == False:
        return None

    password: str = ""
    last_char: str = None
    second_last_char: str = None

    while True:
        if len(password) == length:
            containsUppercase = False
            containsLowercase = False
            containsNumbers = False
            containsSpecials = False

            for char in password:
                if char.isupper():
                    containsUppercase = True
                elif char.islower():
                    containsLowercase = True
                elif char.isnumeric():
                    containsNumbers = True
                else:
                    containsSpecials = True

            if containsUppercase == uppercase and containsLowercase == lowercase and containsNumbers == numbers and containsSpecials == specials:
                return password
            else:
                password = ""

        # Add random character to password string
        charType: int = randbelow(4)

        random_char = choice(ascii_uppercase) if charType == 0 and uppercase else choice(ascii_lowercase) if charType == 1 and lowercase else choice(
            digits) if charType == 2 and numbers else choice(punctuation) if specials else None

        char_repeated = False if last_char == None or not last_char == random_char or not second_last_char == random_char else True

        if random_char and not char_repeated:
            password += random_char
            second_last_char = last_char
            last_char = second_last_char
