"use strict";
// Variable manipulation handlers
Object.defineProperty(exports, "__esModule", { value: true });
exports.h_inc = h_inc;
exports.h_dec = h_dec;
exports.h_load = h_load;
exports.h_store = h_store;
exports.h_inc_chk = h_inc_chk;
exports.h_dec_chk = h_dec_chk;
function toSigned16(n) {
    return n > 32767 ? n - 65536 : n;
}
function h_inc(vm, [varNum]) {
    const value = vm.getVariableValue(varNum);
    vm.setVariableValue(varNum, (value + 1) & 0xffff);
}
function h_dec(vm, [varNum]) {
    const value = vm.getVariableValue(varNum);
    vm.setVariableValue(varNum, (value - 1) & 0xffff);
}
function h_load(vm, [varNum], ctx) {
    const value = vm.getVariableValue(varNum);
    ctx.store?.(value);
}
function h_store(vm, [varNum, value]) {
    vm.setVariableValue(varNum, value);
}
function h_inc_chk(vm, [varNum, compareValue], ctx) {
    const value = vm.getVariableValue(varNum);
    const newValue = (value + 1) & 0xffff;
    vm.setVariableValue(varNum, newValue);
    const signedNew = toSigned16(newValue);
    const signedCompare = toSigned16(compareValue);
    ctx.branch?.(signedNew > signedCompare);
}
function h_dec_chk(vm, [varNum, compareValue], ctx) {
    const value = vm.getVariableValue(varNum);
    const newValue = (value - 1) & 0xffff;
    vm.setVariableValue(varNum, newValue);
    const signedNew = toSigned16(newValue);
    const signedCompare = toSigned16(compareValue);
    const condition = signedNew < signedCompare;
    if (vm.trace && varNum === 1) {
        console.log(`@dec_chk var=${varNum} oldVal=${value} newVal=${newValue} (signed=${signedNew}) cmp=${signedCompare} cond=${condition}`);
    }
    ctx.branch?.(condition);
}
