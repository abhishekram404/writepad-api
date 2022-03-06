import { customAlphabet } from "nanoid";

export const generatePadCode = customAlphabet("abcdefghijklmnopqrstuvwxyz", 6);
