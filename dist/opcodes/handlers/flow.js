"use strict";
// Flow control handlers (return, branch, quit, etc.)
Object.defineProperty(exports, "__esModule", { value: true });
exports.h_rtrue = h_rtrue;
exports.h_rfalse = h_rfalse;
exports.h_ret = h_ret;
exports.h_ret_popped = h_ret_popped;
exports.h_quit = h_quit;
exports.h_jz = h_jz;
exports.h_jl = h_jl;
exports.h_jg = h_jg;
exports.h_je = h_je;
exports.h_jump = h_jump;
function h_rtrue(vm) {
    vm.returnFromRoutine(1);
}
function h_rfalse(vm) {
    vm.returnFromRoutine(0);
}
function h_ret(vm, [val]) {
    vm.returnFromRoutine(val);
}
function h_ret_popped(vm) {
    const value = vm.stack.pop() || 0;
    vm.returnFromRoutine(value);
}
function h_quit(vm) {
    throw new Error("QUIT");
}
function h_jz(vm, [x], ctx) {
    ctx.branch?.(x === 0);
}
function h_jl(vm, [a, b], ctx) {
    const signedA = a > 32767 ? a - 65536 : a;
    const signedB = b > 32767 ? b - 65536 : b;
    ctx.branch?.(signedA < signedB);
}
function h_jg(vm, [a, b], ctx) {
    const signedA = a > 32767 ? a - 65536 : a;
    const signedB = b > 32767 ? b - 65536 : b;
    ctx.branch?.(signedA > signedB);
}
function h_je(vm, ops, ctx) {
    const [a, ...rest] = ops;
    ctx.branch?.(rest.some((v) => v === a));
}
function h_jump(vm, [offset]) {
    // Convert to signed 16-bit
    const signedOffset = offset > 32767 ? offset - 65536 : offset;
    vm.pc = vm.pc + signedOffset - 2;
}
