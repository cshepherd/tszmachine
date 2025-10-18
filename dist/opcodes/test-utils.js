"use strict";
/**
 * Common test utilities for opcode testing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockVM = void 0;
class MockVM {
    constructor(memory) {
        this.memory = [];
        this.pc = 0;
        this.fetchByteLog = [];
        this.decodeOperandLog = [];
        this.readOperandTypesLog = [];
        this.memory = memory;
    }
    _fetchByte() {
        const byte = this.memory[this.pc++];
        this.fetchByteLog.push(byte);
        return byte;
    }
    _fetchWord() {
        const high = this._fetchByte();
        const low = this._fetchByte();
        return (high << 8) | low;
    }
    _decodeOperand(type) {
        this.decodeOperandLog.push(type);
        if (type === "large") {
            return this._fetchWord();
        }
        else if (type === "small") {
            return this._fetchByte();
        }
        else if (type === "var") {
            return this._fetchByte();
        }
        return 0;
    }
    _decodeOperandWithInfo(type) {
        this.decodeOperandLog.push(type);
        if (type === "large") {
            return { value: this._fetchWord(), type: "large" };
        }
        else if (type === "small") {
            return { value: this._fetchByte(), type: "small" };
        }
        else if (type === "var") {
            const varNum = this._fetchByte();
            return { value: varNum, type: "var", varNum };
        }
        return { value: 0, type };
    }
    _readOperandTypes(opcode) {
        const typeByte = this._fetchByte();
        this.readOperandTypesLog.push(typeByte);
        const types = [];
        // Read first 4 operand types
        let hasOmit = false;
        for (let i = 6; i >= 0; i -= 2) {
            const bits = (typeByte >> i) & 0x03;
            if (bits === 0)
                types.push("large");
            else if (bits === 1)
                types.push("small");
            else if (bits === 2)
                types.push("var");
            else {
                types.push("omit");
                hasOmit = true;
            }
        }
        // Only call_vs2 (0xec) and call_vn2 (0xfa) support double-type-bytes for 8 operands
        const supportsDoubleTypeByte = opcode === 0xec || opcode === 0xfa;
        if (!hasOmit && supportsDoubleTypeByte) {
            const typeByte2 = this._fetchByte();
            this.readOperandTypesLog.push(typeByte2);
            for (let i = 6; i >= 0; i -= 2) {
                const bits = (typeByte2 >> i) & 0x03;
                if (bits === 0)
                    types.push("large");
                else if (bits === 1)
                    types.push("small");
                else if (bits === 2)
                    types.push("var");
                else {
                    types.push("omit");
                    break; // Once we hit omit in second byte, we're done
                }
            }
        }
        return types;
    }
    _readBranchOffset() {
        const byte1 = this._fetchByte();
        const branchOnTrue = (byte1 & 0x80) !== 0;
        const singleByte = (byte1 & 0x40) !== 0;
        if (singleByte) {
            // Single-byte offset
            const offset = byte1 & 0x3f;
            return { offset, branchOnTrue };
        }
        else {
            // Two-byte offset
            const byte2 = this._fetchByte();
            const offset = ((byte1 & 0x3f) << 8) | byte2;
            return { offset, branchOnTrue };
        }
    }
}
exports.MockVM = MockVM;
