"use strict";
// Input/output handlers
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.h_print_char = h_print_char;
exports.h_print_num = h_print_num;
exports.h_sread = h_sread;
exports.h_print_table = h_print_table;
exports.h_split_window = h_split_window;
exports.h_set_window = h_set_window;
exports.h_erase_window = h_erase_window;
exports.h_erase_line = h_erase_line;
exports.h_set_cursor = h_set_cursor;
exports.h_get_cursor = h_get_cursor;
exports.h_set_text_style = h_set_text_style;
exports.h_buffer_mode = h_buffer_mode;
exports.h_output_stream = h_output_stream;
exports.h_input_stream = h_input_stream;
exports.h_sound_effect = h_sound_effect;
exports.h_read_char = h_read_char;
exports.h_save = h_save;
exports.h_restore = h_restore;
function toSigned16(n) {
    return n > 32767 ? n - 65536 : n;
}
function encodeWord(vm, chars) {
    // Encode a word (array of ZSCII chars) into Z-machine format (3 words for v3)
    // Each word holds 3 z-characters (5 bits each)
    const A0 = "abcdefghijklmnopqrstuvwxyz";
    const A1 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const A2 = " \n0123456789.,!?_#'\"/\\-:()";
    const zchars = [];
    // Process characters until we have 9 z-chars or run out of input
    for (let i = 0; i < chars.length && zchars.length < 9; i++) {
        const char = String.fromCharCode(chars[i]);
        let idx = A0.indexOf(char);
        if (idx >= 0) {
            zchars.push(idx + 6);
        }
        else {
            idx = A1.indexOf(char);
            if (idx >= 0) {
                zchars.push(4); // Shift to A1
                zchars.push(idx + 6);
            }
            else {
                idx = A2.indexOf(char);
                if (idx >= 0) {
                    zchars.push(5); // Shift to A2
                    zchars.push(idx + 6);
                }
                else {
                    // Unknown character - use ZSCII escape
                    zchars.push(5);
                    zchars.push(6);
                    zchars.push((chars[i] >> 5) & 0x1f);
                    zchars.push(chars[i] & 0x1f);
                }
            }
        }
    }
    // V1-3: 6 z-chars (2 words), V4+: 9 z-chars (3 words)
    const targetLength = vm.header.version <= 3 ? 6 : 9;
    // Pad with 5s
    while (zchars.length < targetLength) {
        zchars.push(5);
    }
    // Truncate if needed
    if (zchars.length > targetLength) {
        zchars.length = targetLength;
    }
    if (vm.trace) {
        const wordStr = String.fromCharCode(...chars);
        console.log(`  encodeWord("${wordStr}"): zchars=[${zchars.join(",")}]`);
    }
    // Pack into words (3 z-chars per word)
    const word1 = (zchars[0] << 10) | (zchars[1] << 5) | zchars[2];
    const word2 = (zchars[3] << 10) | (zchars[4] << 5) | zchars[5];
    const word3 = (zchars[6] << 10) | (zchars[7] << 5) | zchars[8];
    // Set high bit on the last word to mark end
    if (vm.header.version <= 3) {
        const finalWord2 = word2 | 0x8000;
        if (vm.trace) {
            console.log(`  encoded as: ${word1.toString(16).padStart(4, "0")} ${finalWord2.toString(16).padStart(4, "0")} 0000`);
        }
        return [word1, finalWord2, 0];
    }
    else {
        const finalWord3 = word3 | 0x8000;
        if (vm.trace) {
            console.log(`  encoded as: ${word1.toString(16).padStart(4, "0")} ${word2.toString(16).padStart(4, "0")} ${finalWord3.toString(16).padStart(4, "0")}`);
        }
        return [word1, word2, finalWord3];
    }
}
function tokenize(vm, textBufferAddr, parseBufferAddr) {
    if (!vm.memory || !vm.header)
        return;
    // Read the text from the text buffer
    // Format differs by version:
    // v1-4: byte 0: max length, byte 1+: text (null-terminated)
    // v5+:  byte 0: max length, byte 1: length, byte 2+: text
    const text = [];
    if (vm.header.version <= 4) {
        // v1-4: Read from byte 1 until null terminator
        let i = 0;
        const maxLen = vm.memory.readUInt8(textBufferAddr);
        while (i < maxLen) {
            const char = vm.memory.readUInt8(textBufferAddr + 1 + i);
            if (char === 0)
                break;
            text.push(char);
            i++;
        }
    }
    else {
        // v5+: Read length from byte 1, text from byte 2+
        const textLength = vm.memory.readUInt8(textBufferAddr + 1);
        for (let i = 0; i < textLength; i++) {
            text.push(vm.memory.readUInt8(textBufferAddr + 2 + i));
        }
    }
    // Get max number of tokens from parse buffer
    const maxTokens = vm.memory.readUInt8(parseBufferAddr);
    // Split input into words (separated by spaces)
    const tokens = [];
    let currentWord = [];
    let wordStart = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === 32) {
            // Space - end of word
            if (currentWord.length > 0) {
                tokens.push({
                    word: currentWord,
                    start: wordStart,
                    length: currentWord.length,
                });
                currentWord = [];
            }
        }
        else {
            if (currentWord.length === 0) {
                wordStart = i;
            }
            currentWord.push(char);
        }
    }
    // Add last word if any
    if (currentWord.length > 0) {
        tokens.push({
            word: currentWord,
            start: wordStart,
            length: currentWord.length,
        });
    }
    if (vm.trace) {
        console.log(`@tokenize: found ${tokens.length} tokens`);
        for (const token of tokens) {
            const wordStr = String.fromCharCode(...token.word);
            console.log(`  token: "${wordStr}" at position ${token.start}, length ${token.length}`);
        }
    }
    // Look up each word in the dictionary
    const dictionaryAddr = vm.header.dictionaryAddress;
    const numWordSeparators = vm.memory.readUInt8(dictionaryAddr);
    const entryLength = vm.memory.readUInt8(dictionaryAddr + numWordSeparators + 1);
    const numEntries = vm.memory.readUInt16BE(dictionaryAddr + numWordSeparators + 2);
    const firstEntryAddr = dictionaryAddr + numWordSeparators + 4;
    if (vm.trace) {
        console.log(`@tokenize: dictionary at 0x${dictionaryAddr.toString(16)}, ${numEntries} entries, ${entryLength} bytes each`);
        // Show first few dictionary entries
        console.log(`  First 10 dictionary entries:`);
        for (let i = 0; i < Math.min(10, numEntries); i++) {
            const entryAddr = firstEntryAddr + i * entryLength;
            const w1 = vm.memory.readUInt16BE(entryAddr);
            const w2 = vm.memory.readUInt16BE(entryAddr + 2);
            const w3 = vm.memory.readUInt16BE(entryAddr + 4);
            console.log(`    [${i}] @0x${entryAddr.toString(16)}: ${w1.toString(16).padStart(4, "0")} ${w2.toString(16).padStart(4, "0")} ${w3.toString(16).padStart(4, "0")}`);
        }
        // Search for "look", "quit", "yes", "y", "no", "n" in dictionary
        for (let i = 0; i < numEntries; i++) {
            const entryAddr = firstEntryAddr + i * entryLength;
            const w1 = vm.memory.readUInt16BE(entryAddr);
            const w2 = vm.memory.readUInt16BE(entryAddr + 2);
            const w3 = vm.memory.readUInt16BE(entryAddr + 4);
            // Decode to see what word this is
            const origPC = vm.pc;
            vm.pc = entryAddr;
            const decoded = vm.decodeZSCII(false);
            vm.pc = origPC;
            if (["look", "quit", "yes", "y", "no", "n"].includes(decoded)) {
                console.log(`  Found "${decoded}" at entry ${i} @0x${entryAddr.toString(16)}: ${w1.toString(16).padStart(4, "0")} ${w2.toString(16).padStart(4, "0")} ${w3.toString(16).padStart(4, "0")}`);
            }
        }
    }
    // Write number of tokens found
    const actualTokens = Math.min(tokens.length, maxTokens);
    vm.memory.writeUInt8(actualTokens, parseBufferAddr + 1);
    if (vm.trace) {
        console.log(`@tokenize: Writing ${actualTokens} tokens to parse buffer at 0x${parseBufferAddr.toString(16)}`);
    }
    // Write each token entry
    for (let i = 0; i < actualTokens; i++) {
        const token = tokens[i];
        // Encode the word to ZSCII (up to 6 characters for v3)
        const encodedWord = encodeWord(vm, token.word);
        // Look up in dictionary
        // Compare the encoded words (not the metadata bytes)
        // V1-3: 2 words (4 bytes), V4+: 3 words (6 bytes)
        let dictAddr = 0;
        for (let j = 0; j < numEntries; j++) {
            const entryAddr = firstEntryAddr + j * entryLength;
            const entry1 = vm.memory.readUInt16BE(entryAddr);
            const entry2 = vm.memory.readUInt16BE(entryAddr + 2);
            // V1-3: compare 2 words, V4+: compare 3 words
            if (vm.header.version <= 3) {
                if (entry1 === encodedWord[0] && entry2 === encodedWord[1]) {
                    dictAddr = entryAddr;
                    break;
                }
            }
            else {
                // V4+: compare all 3 words
                const entry3 = vm.memory.readUInt16BE(entryAddr + 4);
                if (entry1 === encodedWord[0] && entry2 === encodedWord[1] && entry3 === encodedWord[2]) {
                    dictAddr = entryAddr;
                    break;
                }
            }
        }
        if (vm.trace && dictAddr > 0) {
            console.log(`  found "${String.fromCharCode(...token.word)}" in dictionary at 0x${dictAddr.toString(16)}`);
        }
        else if (vm.trace) {
            console.log(`  "${String.fromCharCode(...token.word)}" not found in dictionary`);
        }
        // Write token entry (4 bytes: dict addr [2], length [1], position [1])
        const tokenEntryAddr = parseBufferAddr + 2 + i * 4;
        vm.memory.writeUInt16BE(dictAddr, tokenEntryAddr);
        vm.memory.writeUInt8(token.length, tokenEntryAddr + 2);
        vm.memory.writeUInt8(token.start + 1, tokenEntryAddr + 3); // Position is 1-indexed
        if (vm.trace) {
            console.log(`  Token ${i}: addr=0x${dictAddr.toString(16)}, len=${token.length}, pos=${token.start + 1}, written to 0x${tokenEntryAddr.toString(16)}`);
        }
    }
}
function h_print_char(vm, [zsciiChar]) {
    if (vm.inputOutputDevice) {
        vm.inputOutputDevice.writeString(String.fromCharCode(zsciiChar));
    }
    else {
        console.log(String.fromCharCode(zsciiChar));
    }
}
function h_print_num(vm, [num]) {
    const signedNum = toSigned16(num);
    if (vm.inputOutputDevice) {
        vm.inputOutputDevice.writeString(signedNum.toString());
    }
    else {
        console.log(signedNum.toString());
    }
}
async function h_sread(vm, operands) {
    if (!vm.memory || !vm.inputOutputDevice || !vm.header) {
        console.error("Memory, input/output device, or header not loaded");
        return;
    }
    // For v1-3 games, update the status line before reading input
    if (vm.header.version <= 3) {
        const { h_show_status } = require("./misc");
        h_show_status(vm);
    }
    const textBufferAddr = operands[0];
    const parseBufferAddr = operands[1];
    // Position cursor at the input line (outside scrolling region)
    // For V4+ games, this ensures the prompt doesn't interfere with game text
    // For V3 games, the status line update already positioned cursor correctly,
    // and game text is printed AFTER sread returns, so we don't move the cursor
    if (vm.header.version >= 4) {
        const termHeight = vm.terminalHeight || 24;
        vm.inputOutputDevice.writeString(`\x1b[${termHeight};1H`);
    }
    // Read input from user
    const input = await vm.inputOutputDevice.readLine();
    // After input, clear the lower window and position cursor at start
    // This ensures old content doesn't interfere with the new response
    if (vm.header.version >= 4) {
        const scrollTop = (vm.splitWindowLines || 0) + 1;
        // Move to start of lower window and clear from cursor to end of screen
        vm.inputOutputDevice.writeString(`\x1b[${scrollTop};1H\x1b[J`);
        // Reset cursor column tracker for word wrapping
        vm.cursorColumn = 0;
    }
    if (vm.trace) {
        console.log(`@sread: textBufferAddr=0x${textBufferAddr.toString(16)}, parseBufferAddr=0x${parseBufferAddr.toString(16)}, input="${input}"`);
    }
    const maxLen = vm.memory.readUInt8(textBufferAddr);
    const text = input.toLowerCase().slice(0, maxLen);
    vm.setLastRead(text);
    if (vm.header.version <= 4) {
        // v1-4: Write text starting at byte 1, null-terminate
        for (let i = 0; i < text.length; i++) {
            vm.memory.writeUInt8(text.charCodeAt(i), textBufferAddr + 1 + i);
        }
        if (text.length < maxLen) {
            vm.memory.writeUInt8(0, textBufferAddr + 1 + text.length);
        }
    }
    else {
        // v5+: Write length at byte 1, text at byte 2+
        vm.memory.writeUInt8(text.length, textBufferAddr + 1);
        for (let i = 0; i < text.length; i++) {
            vm.memory.writeUInt8(text.charCodeAt(i), textBufferAddr + 2 + i);
        }
        if (text.length < maxLen) {
            vm.memory.writeUInt8(0, textBufferAddr + 2 + text.length);
        }
    }
    // Tokenize the input
    tokenize(vm, textBufferAddr, parseBufferAddr);
}
function h_print_table(vm, operands) {
    if (!vm.memory) {
        console.error("Memory not loaded");
        return;
    }
    const tableAddr = operands[0];
    const tableWidth = operands[1];
    const tableHeight = operands.length > 2 ? operands[2] : 1;
    const tableSkip = operands.length > 3 ? operands[3] : 0;
    if (tableAddr >= vm.memory.length) {
        console.error(`print_table: Invalid address 0x${tableAddr.toString(16)}`);
        return;
    }
    for (let row = 0; row < tableHeight; row++) {
        const rowAddr = tableAddr + row * (tableWidth + tableSkip);
        if (rowAddr + tableWidth > vm.memory.length) {
            console.error(`print_table: Row ${row} extends beyond memory`);
            break;
        }
        for (let col = 0; col < tableWidth; col++) {
            const charCode = vm.memory.readUInt8(rowAddr + col);
            if (vm.inputOutputDevice) {
                vm.inputOutputDevice.writeString(String.fromCharCode(charCode));
            }
            else {
                process.stdout.write(String.fromCharCode(charCode));
            }
        }
        if (row < tableHeight - 1) {
            if (vm.inputOutputDevice) {
                vm.inputOutputDevice.writeString("\n");
            }
            else {
                process.stdout.write("\n");
            }
        }
    }
}
function h_split_window(vm, [lines]) {
    // Split window (v3+)
    // lines = number of lines for upper window (status area)
    if (vm.trace) {
        console.log(`@split_window ${lines}`);
    }
    if (vm.inputOutputDevice) {
        // Get terminal height (default to 24 if not available)
        const termHeight = vm.terminalHeight || 24;
        const scrollBottom = termHeight - 1; // Reserve last line for input
        // Store the split window size in VM for reference
        if (!vm.splitWindowLines) {
            vm.splitWindowLines = 0;
        }
        vm.splitWindowLines = lines;
        if (lines === 0) {
            // No split - reset to normal scrolling (full screen minus 1 for input)
            vm.inputOutputDevice.writeString(`\x1b[1;${scrollBottom}r`);
        }
        else {
            // Set up scrolling region with status at top and input at bottom
            // - Status: line 1 to 'lines'
            // - Scrolling: line 'lines+1' to line (termHeight-1)
            // - Input: line termHeight
            const scrollTop = lines + 1;
            vm.inputOutputDevice.writeString(`\x1b[${scrollTop};${scrollBottom}r`);
            // Move cursor to the start of the scrolling region
            vm.inputOutputDevice.writeString(`\x1b[${scrollTop};1H`);
        }
    }
}
function h_set_window(vm, [window]) {
    // Set current window (v3+)
    // window = 0 (lower/main scrolling window) or 1 (upper/status window)
    if (vm.trace) {
        console.log(`@set_window ${window}`);
    }
    if (vm.inputOutputDevice) {
        vm.currentWindow = window;
        if (window === 1) {
            // Upper window (status) - position cursor at top
            vm.inputOutputDevice.writeString("\x1b[1;1H");
            // Reset cursor column for word wrapping
            vm.cursorColumn = 0;
        }
        else {
            // Lower window (main scrolling area) - position after status lines
            const scrollTop = (vm.splitWindowLines || 0) + 1;
            // For v3 games with no split, position at line 1 (scrolling region is 1-23)
            const line = vm.splitWindowLines === 0 ? 1 : scrollTop;
            vm.inputOutputDevice.writeString(`\x1b[${line};1H`);
            // Reset cursor column for word wrapping
            vm.cursorColumn = 0;
        }
    }
}
function h_erase_window(vm, [window]) {
    // Erase window (v4+)
    // window: -1 or 2 = clear entire screen, 0 = lower window, 1 = upper window
    if (vm.trace) {
        console.log(`@erase_window ${window}`);
    }
    if (vm.inputOutputDevice) {
        // Convert window to signed value (window can be -1)
        const signedWindow = window > 32767 ? window - 65536 : window;
        if (signedWindow === -1 || signedWindow === 2) {
            // Clear entire screen: ESC[2J and move cursor to home: ESC[H
            vm.inputOutputDevice.writeString("\x1b[2J\x1b[H");
            // Reset cursor column for word wrapping
            vm.cursorColumn = 0;
        }
        else if (signedWindow === 0) {
            // Clear lower window - for now just clear from cursor to end of screen
            vm.inputOutputDevice.writeString("\x1b[J");
            // Reset cursor column for word wrapping
            vm.cursorColumn = 0;
        }
        else if (signedWindow === 1) {
            // Clear upper window - more complex in a split screen setup
            // For now, just clear from cursor to end of line
            vm.inputOutputDevice.writeString("\x1b[K");
        }
    }
}
function h_erase_line(vm, [value]) {
    // Erase line (v4+)
    // Currently no-op
    if (vm.trace) {
        console.log(`@erase_line ${value} (no-op)`);
    }
}
function h_set_cursor(vm, [line, column]) {
    // Set cursor position (v4+)
    // Emit VT100 cursor positioning sequence: ESC[{line};{column}H
    if (vm.trace) {
        console.log(`@set_cursor ${line},${column}`);
    }
    if (vm.inputOutputDevice) {
        const vt100Sequence = `\x1b[${line};${column}H`;
        vm.inputOutputDevice.writeString(vt100Sequence);
        // Update cursor column for word wrapping (column is 1-indexed, convert to 0-indexed)
        vm.cursorColumn = column - 1;
    }
}
function h_get_cursor(vm, [array]) {
    // Get cursor position (v4+)
    // Store line and column at array and array+2
    // Currently just write 1,1
    if (vm.memory) {
        vm.memory.writeUInt16BE(1, array);
        vm.memory.writeUInt16BE(1, array + 2);
    }
    if (vm.trace) {
        console.log(`@get_cursor ${array} (stub: returning 1,1)`);
    }
}
function h_set_text_style(vm, [style]) {
    // Set text style (v4+)
    // Bit 0 (1): Reverse video
    // Bit 1 (2): Bold
    // Bit 2 (4): Italic
    // Bit 3 (8): Fixed-pitch font
    // Style 0: Turn off all styles
    if (vm.trace) {
        console.log(`@set_text_style ${style}`);
    }
    if (!vm.inputOutputDevice) {
        return;
    }
    // Track current text style on VM
    if (vm.currentTextStyle === undefined) {
        vm.currentTextStyle = 0;
    }
    // If style is 0, reset all styles
    if (style === 0) {
        if (vm.currentTextStyle !== 0) {
            vm.inputOutputDevice.writeString("\x1b[0m");
            vm.currentTextStyle = 0;
        }
        return;
    }
    // Build VT100 sequence for the requested styles
    let sequence = "";
    // Check which styles changed
    const newStyles = style;
    const oldStyles = vm.currentTextStyle;
    // If switching between styles, reset first
    if (oldStyles !== 0 && oldStyles !== newStyles) {
        sequence += "\x1b[0m";
    }
    // Apply new styles
    if (newStyles & 1) {
        // Reverse video
        sequence += "\x1b[7m";
    }
    if (newStyles & 2) {
        // Bold
        sequence += "\x1b[1m";
    }
    if (newStyles & 4) {
        // Italic
        sequence += "\x1b[3m";
    }
    // Note: We don't have a VT100 code for fixed-pitch vs proportional
    // Most terminals are fixed-pitch anyway
    if (sequence) {
        vm.inputOutputDevice.writeString(sequence);
        vm.currentTextStyle = newStyles;
    }
}
function h_buffer_mode(vm, [flag]) {
    // Set buffer mode (v4+)
    // Currently no-op
    if (vm.trace) {
        console.log(`@buffer_mode ${flag} (no-op)`);
    }
}
function h_output_stream(vm, [number, table]) {
    // Select output stream (v3+)
    // Stream 1: Screen
    // Stream 2: Transcript (not implemented)
    // Stream 3: Memory table
    // Stream 4: Commands (not implemented)
    // Positive number = enable, negative = disable
    if (vm.trace) {
        console.log(`@output_stream ${number}${table !== undefined ? `,${table}` : ""}`);
    }
    // Convert to signed 16-bit
    const signedNumber = number > 32767 ? number - 65536 : number;
    if (signedNumber === 3 && table !== undefined) {
        // Enable memory stream 3
        if (!vm.outputStreams) {
            vm.outputStreams = { stream3: null };
        }
        vm.outputStreams.stream3 = {
            table,
            buffer: [],
        };
        if (vm.trace) {
            console.log(`  Stream 3 enabled, writing to table at 0x${table.toString(16)}`);
        }
    }
    else if (signedNumber === -3) {
        // Disable memory stream 3
        if (vm.outputStreams && vm.outputStreams.stream3) {
            const stream = vm.outputStreams.stream3;
            const tableAddr = stream.table;
            const text = stream.buffer.join('');
            if (vm.memory) {
                // Write word count (number of characters)
                vm.memory.writeUInt16BE(text.length, tableAddr);
                // Write text bytes
                for (let i = 0; i < text.length; i++) {
                    vm.memory.writeUInt8(text.charCodeAt(i), tableAddr + 2 + i);
                }
            }
            if (vm.trace) {
                console.log(`  Stream 3 disabled, wrote ${text.length} chars: "${text}"`);
            }
            vm.outputStreams.stream3 = null;
        }
    }
}
function h_input_stream(vm, [number]) {
    // Select input stream (v3+)
    // Currently no-op
    if (vm.trace) {
        console.log(`@input_stream ${number} (no-op)`);
    }
}
function h_sound_effect(vm, operands) {
    // Sound effect (v3+)
    // Currently no-op
    if (vm.trace) {
        console.log(`@sound_effect ${operands.join(",")} (no-op)`);
    }
}
async function h_read_char(vm, [one, time, routine], ctx) {
    // Read a single character (v4+)
    // one = 1 means show cursor, time = timeout, routine = timeout routine
    if (!vm.inputOutputDevice) {
        console.error("No input device");
        ctx.store?.(13); // Return newline
        return;
    }
    const char = await vm.inputOutputDevice.readChar();
    const charCode = char.charCodeAt(0);
    if (vm.trace) {
        console.log(`@read_char returned '${char}' (code ${charCode})`);
    }
    ctx.store?.(charCode);
}
async function h_save(vm, _operands, ctx) {
    // For v1-3, SAVE is a branch instruction. The decoder has already read the branch
    // offset bytes and advanced PC past them. We need to save the PC pointing to those
    // branch bytes (before they were read), so when we restore we can read and apply them.
    //
    // For v4+, SAVE is a store instruction. The decoder has already read the store variable
    // byte and advanced PC past it. We need to save the PC pointing to that store byte,
    // so when we restore we can read it and store the result value.
    let savedPC = vm.pc;
    if (vm.header && vm.header.version <= 3 && ctx.branchInfo) {
        // V1-3: Branch instruction
        // Use the actual number of branch bytes read by the decoder
        const branchBytes = ctx.branchInfo.branchBytes;
        // Subtract the branch bytes to point to the start of the branch offset
        savedPC = vm.pc - branchBytes;
        if (vm.trace) {
            console.log(`@save (V${vm.header.version}): PC=${vm.pc.toString(16)}, branchBytes=${branchBytes}, savedPC=${savedPC.toString(16)}`);
        }
    }
    else if (vm.header && vm.header.version >= 4) {
        // V4+: Store instruction
        // Subtract 1 to point to the store variable byte
        savedPC = vm.pc - 1;
        if (vm.trace) {
            console.log(`@save (V${vm.header.version}): PC=${vm.pc.toString(16)}, savedPC=${savedPC.toString(16)} (pointing to store byte)`);
        }
    }
    // Helper to indicate success/failure based on version
    const indicateSuccess = () => {
        if (vm.header && vm.header.version >= 4) {
            ctx.store?.(1); // V4+: store 1 for success
        }
        else {
            ctx.branch?.(true); // V1-3: branch on true for success
        }
    };
    const indicateFailure = () => {
        if (vm.header && vm.header.version >= 4) {
            ctx.store?.(0); // V4+: store 0 for failure
        }
        else {
            ctx.branch?.(false); // V1-3: branch on false for failure
        }
    };
    try {
        const saveData = await vm.saveData(savedPC);
        if (!saveData) {
            if (vm.trace) {
                console.log(`@save failed: could not generate save data`);
            }
            indicateFailure();
            return;
        }
        // In Node.js environment, save to disk
        if (vm.runtime === 'node') {
            const { writeFile } = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const savePath = vm.filePath + '.qzl';
            await writeFile(savePath, saveData);
            if (vm.trace) {
                console.log(`@save: saved to ${savePath}`);
            }
            indicateSuccess();
        }
        else if (vm.runtime === 'browser') {
            // In browser environment, save to localStorage using game identifier
            const header = vm.getHeader();
            if (!header) {
                if (vm.trace) {
                    console.log(`@save failed: could not get game header`);
                }
                indicateFailure();
                return;
            }
            const gameIdentifier = `${header.release}.${header.serial}`;
            const saveKey = `tszm-save-${gameIdentifier}`;
            // Convert Buffer to base64 string for localStorage
            const base64Data = saveData.toString('base64');
            localStorage.setItem(saveKey, base64Data);
            if (vm.trace) {
                console.log(`@save: saved ${saveData.length} bytes to localStorage key "${saveKey}"`);
            }
            indicateSuccess();
        }
        else {
            // In other environments, just indicate success
            if (vm.trace) {
                console.log(`@save: generated save data (${saveData.length} bytes) but not persisting (unknown environment)`);
            }
            indicateSuccess();
        }
    }
    catch (error) {
        if (vm.trace) {
            console.log(`@save failed: ${error}`);
        }
        indicateFailure();
    }
}
async function h_restore(vm, _operands, ctx) {
    // Restore game state (v1-3: 0OP, v4+: uses extended opcode with store)
    try {
        // In Node.js environment, load from disk
        if (vm.runtime === 'node') {
            const { readFile } = await Promise.resolve().then(() => __importStar(require('fs/promises')));
            const savePath = vm.filePath + '.qzl';
            try {
                const saveData = await readFile(savePath);
                if (vm.trace) {
                    console.log(`@restore: loaded save file (${saveData.length} bytes), calling restoreFromSave...`);
                }
                const success = await vm.restoreFromSave(saveData);
                if (success) {
                    if (vm.trace) {
                        console.log(`@restore: SUCCESS - restoreFromSave() succeeded, PC=${vm.pc.toString(16)}`);
                        console.log(`@restore: Returning from handler without calling ctx.branch (PC has been set by restoreFromSave)`);
                    }
                    // restoreFromSave() already read the branch bytes, applied the branch, and set PC correctly.
                    // The PC now points to the instruction after the SAVE's branch.
                    // Just continue execution from here (execution will continue at the next step()).
                    //
                    // IMPORTANT: We do NOT call ctx.branch() here, because restoreFromSave() has already
                    // modified the PC to point to the correct post-restore location.
                    return;
                }
                else {
                    if (vm.trace) {
                        console.log(`@restore: FAILED - restoreFromSave() returned false, calling ctx.branch(false)`);
                    }
                    ctx.branch?.(false);
                }
            }
            catch (fileError) {
                if (fileError.code === 'ENOENT') {
                    if (vm.trace) {
                        console.log(`@restore: save file not found at ${savePath}`);
                    }
                }
                else {
                    if (vm.trace) {
                        console.log(`@restore: error reading save file: ${fileError}`);
                    }
                }
                ctx.branch?.(false);
            }
        }
        else if (vm.runtime === 'browser') {
            // In browser environment, load from localStorage using game identifier
            const header = vm.getHeader();
            if (!header) {
                if (vm.trace) {
                    console.log(`@restore failed: could not get game header`);
                }
                ctx.branch?.(false);
                return;
            }
            const gameIdentifier = `${header.release}.${header.serial}`;
            const saveKey = `tszm-save-${gameIdentifier}`;
            try {
                const base64Data = localStorage.getItem(saveKey);
                if (!base64Data) {
                    if (vm.trace) {
                        console.log(`@restore: no save data found in localStorage for key "${saveKey}"`);
                    }
                    ctx.branch?.(false);
                    return;
                }
                // Convert base64 string back to Buffer
                const saveData = Buffer.from(base64Data, 'base64');
                const success = await vm.restoreFromSave(saveData);
                if (success) {
                    if (vm.trace) {
                        console.log(`@restore: restored ${saveData.length} bytes from localStorage key "${saveKey}"`);
                    }
                    // restoreFromSave() already skipped the branch bytes and set PC correctly.
                    // Just continue execution from here (as if SAVE returned 0/false).
                }
                else {
                    if (vm.trace) {
                        console.log(`@restore: failed to restore game state`);
                    }
                    ctx.branch?.(false);
                }
            }
            catch (storageError) {
                if (vm.trace) {
                    console.log(`@restore: error reading from localStorage: ${storageError}`);
                }
                ctx.branch?.(false);
            }
        }
        else {
            // In other environments, not yet implemented
            if (vm.trace) {
                console.log(`@restore: not implemented for unknown environment`);
            }
            ctx.branch?.(false);
        }
    }
    catch (error) {
        if (vm.trace) {
            console.log(`@restore failed: ${error}`);
        }
        ctx.branch?.(false);
    }
}
