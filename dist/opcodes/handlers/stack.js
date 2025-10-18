"use strict";
// Stack manipulation handlers
Object.defineProperty(exports, "__esModule", { value: true });
exports.h_pop = h_pop;
exports.h_push = h_push;
exports.h_pull = h_pull;
exports.h_random = h_random;
function toSigned16(n) {
    return n > 32767 ? n - 65536 : n;
}
function h_pop(vm) {
    vm.stack.pop();
}
function h_push(vm, [value]) {
    vm.stack.push(value);
}
function h_pull(vm, [varNum]) {
    if (vm.trace) {
        console.log(`@pull: stack length=${vm.stack.length}, target var=${varNum}`);
    }
    if (vm.stack.length === 0) {
        console.error("Stack underflow in pull");
        return;
    }
    const value = vm.stack.pop() || 0;
    if (vm.trace) {
        console.log(`@pull: pulled value=${value}, storing to var ${varNum}`);
    }
    vm.setVariableValue(varNum, value);
}
function h_random(vm, [range], ctx) {
    const signedRange = toSigned16(range);
    let randomValue;
    if (signedRange > 0) {
        randomValue = Math.floor(Math.random() * signedRange) + 1;
    }
    else {
        // Seeding the RNG - we don't actually implement seeding in JS
        randomValue = 0;
    }
    ctx.store?.(randomValue);
}
