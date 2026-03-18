export const RESET = "\x1b[0m";
export const BRIGHT = "\x1b[1m";
export const DIM = "\x1b[2m";
export const UNDERSCORE = "\x1b[4m";
export const BLINK = "\x1b[5m";
export const REVERSE = "\x1b[7m";
export const HIDDEN = "\x1b[8m";

export const RED = "\x1b[31m";
export const GREEN = "\x1b[32m";
export const BLUE = "\x1b[34m";
export const CYAN = "\x1b[36m";
export const MAGENTA = "\x1b[35m";
export const YELLOW = "\x1b[33m";
export const WHITE = "\x1b[37m";
export const BLACK = "\x1b[30m";

export const RED_BRIGHT = RED + BRIGHT;
export const GREEN_BRIGHT = GREEN + BRIGHT;
export const BLUE_BRIGHT = BLUE + BRIGHT;
export const CYAN_BRIGHT = CYAN + BRIGHT;
export const MAGENTA_BRIGHT = MAGENTA + BRIGHT;
export const YELLOW_BRIGHT = YELLOW + BRIGHT;
export const WHITE_BRIGHT = WHITE + BRIGHT;
export const BLACK_BRIGHT = BLACK + BRIGHT;

export const BG_RED = "\x1b[41m";
export const BG_GREEN = "\x1b[42m";
export const BG_BLUE = "\x1b[44m";
export const BG_CYAN = "\x1b[46m";
export const BG_MAGENTA = "\x1b[45m";
export const BG_YELLOW = "\x1b[43m";
export const BG_BLACK = "\x1b[40m";
export const BG_WHITE = "\x1b[47m";

export function printColorfulMessages() {
    console.log(RED + "Output with red text");
    console.log(GREEN + "Output with green text");
    console.log(BLUE + "Output with blue text");
    console.log(CYAN + "Output with cyan text");
    console.log(MAGENTA + "Output with magenta text");
    console.log(YELLOW + "Output with yellow text");

    console.log(RED_BRIGHT + "Output with bright red text");
    console.log(GREEN_BRIGHT + "Output with bright green text");
    console.log(BLUE_BRIGHT + "Output with bright blue text");
    console.log(CYAN_BRIGHT + "Output with bright cyan text");
    console.log(MAGENTA_BRIGHT + "Output with bright magenta text");
    console.log(YELLOW_BRIGHT + "Output with bright yellow text");

    console.log(WHITE_BRIGHT + BG_RED + "Output with red background");
    console.log(WHITE_BRIGHT + BG_GREEN + "Output with green background");
    console.log(WHITE_BRIGHT + BG_BLUE + "Output with blue background");
    console.log(WHITE_BRIGHT + BG_CYAN + "Output with cyan background");
    console.log(WHITE_BRIGHT + BG_MAGENTA + "Output with magenta background");
    console.log(WHITE_BRIGHT + BG_YELLOW + "Output with yellow background");

    console.log(BLACK_BRIGHT + BG_RED + "Output with red background");
    console.log(BLACK_BRIGHT + BG_GREEN + "Output with green background");
    console.log(BLACK_BRIGHT + BG_BLUE + "Output with blue background");
    console.log(BLACK_BRIGHT + BG_CYAN + "Output with cyan background");
    console.log(BLACK_BRIGHT + BG_MAGENTA + "Output with magenta background");
    console.log(BLACK_BRIGHT + BG_YELLOW + "Output with yellow background");
}
