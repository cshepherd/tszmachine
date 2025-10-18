"use strict";
// Memory access handlers
Object.defineProperty(exports, "__esModule", { value: true });
exports.h_loadw = h_loadw;
exports.h_loadb = h_loadb;
exports.h_storew = h_storew;
exports.h_storeb = h_storeb;
function toSigned16(n) {
    return n > 32767 ? n - 65536 : n;
}
function h_loadw(vm, [arrayAddr, wordIndex], ctx) {
    if (!vm.memory) {
        console.error("Memory not loaded");
        return;
    }
    const signedIndex = toSigned16(wordIndex);
    const addr = arrayAddr + 2 * signedIndex;
    if (addr < 0 || addr >= vm.memory.length - 1) {
        console.error(`LOADW: Invalid memory address 0x${addr.toString(16)} ` +
            `(array=0x${arrayAddr.toString(16)}, index=${signedIndex}). ` +
            `Memory size: 0x${vm.memory.length.toString(16)}`);
        return;
    }
    const value = vm.memory.readUInt16BE(addr);
    ctx.store?.(value);
}
function h_loadb(vm, [arrayAddr, byteIndex], ctx) {
    if (!vm.memory) {
        console.error("Memory not loaded");
        return;
    }
    const signedIndex = toSigned16(byteIndex);
    const addr = arrayAddr + signedIndex;
    if (addr < 0 || addr >= vm.memory.length) {
        console.error(`LOADB: Invalid memory address 0x${addr.toString(16)} ` +
            `(array=0x${arrayAddr.toString(16)}, index=${signedIndex}). ` +
            `Memory size: 0x${vm.memory.length.toString(16)}`);
        return;
    }
    const value = vm.memory.readUInt8(addr);
    ctx.store?.(value);
}
function h_storew(vm, [arrayAddr, wordIndex, value]) {
    if (!vm.memory) {
        console.error("Memory not loaded");
        return;
    }
    const signedIndex = toSigned16(wordIndex);
    const addr = arrayAddr + 2 * signedIndex;
    if (addr < 0 || addr >= vm.memory.length - 1) {
        console.error(`STOREW: Invalid memory address 0x${addr.toString(16)} ` +
            `(array=0x${arrayAddr.toString(16)}, index=${signedIndex}). ` +
            `Memory size: 0x${vm.memory.length.toString(16)}`);
        return;
    }
    vm.memory.writeUInt16BE(value, addr);
}
function h_storeb(vm, [arrayAddr, byteIndex, value]) {
    if (!vm.memory) {
        console.error("Memory not loaded");
        return;
    }
    const signedIndex = toSigned16(byteIndex);
    const addr = arrayAddr + signedIndex;
    if (addr < 0 || addr >= vm.memory.length) {
        console.error(`STOREB: Invalid memory address 0x${addr.toString(16)} ` +
            `(array=0x${arrayAddr.toString(16)}, index=${signedIndex}). ` +
            `Memory size: 0x${vm.memory.length.toString(16)}`);
        return;
    }
    vm.memory.writeUInt8(value, addr);
}
