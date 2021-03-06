const letters = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    // "!",
    // "@",
    // "#",
    // "$",
    // "%",
    // "^",
    // "&",
    // "*",
    // "(",
    // ")",
    // "_",
    // "-",
    // "+",
    // "=",
    // "`",
    // "~",
    // "{",
    // "}",
    // "[",
    // "]",
    // "|",
    // "\\",
    // "'",
    // '"',
    // ":",
    // ";",
    // "<",
    // ",",
    // ">",
    // ".",
    // "?",
    // "/",
];

export const randomString = (length?: number) => {
    let len = 16;
    if (length) len = length;
    let rand = "";
    for (let i = 0; i < len; i++) {
        rand += letters[Math.floor(Math.random() * letters.length)];
    }
    return rand;
};

export const random = (min = 0, max = 1, whole = true) => {
    if (!whole) {
        return Math.random() * (max - min);
    }
    return Math.floor(Math.random() * (max - min));
};
