export declare function h_rtrue(vm: any): void;
export declare function h_rfalse(vm: any): void;
export declare function h_ret(vm: any, [val]: number[]): void;
export declare function h_ret_popped(vm: any): void;
export declare function h_quit(vm: any): void;
export declare function h_jz(vm: any, [x]: number[], ctx: {
    branch?: (c: boolean) => void;
}): void;
export declare function h_jl(vm: any, [a, b]: number[], ctx: {
    branch?: (c: boolean) => void;
}): void;
export declare function h_jg(vm: any, [a, b]: number[], ctx: {
    branch?: (c: boolean) => void;
}): void;
export declare function h_je(vm: any, ops: number[], ctx: {
    branch?: (c: boolean) => void;
}): void;
export declare function h_jump(vm: any, [offset]: number[]): void;
//# sourceMappingURL=flow.d.ts.map