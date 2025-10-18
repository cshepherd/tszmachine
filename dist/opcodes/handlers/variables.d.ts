export declare function h_inc(vm: any, [varNum]: number[]): void;
export declare function h_dec(vm: any, [varNum]: number[]): void;
export declare function h_load(vm: any, [varNum]: number[], ctx: {
    store?: (v: number) => void;
}): void;
export declare function h_store(vm: any, [varNum, value]: number[]): void;
export declare function h_inc_chk(vm: any, [varNum, compareValue]: number[], ctx: {
    branch?: (c: boolean) => void;
}): void;
export declare function h_dec_chk(vm: any, [varNum, compareValue]: number[], ctx: {
    branch?: (c: boolean) => void;
}): void;
//# sourceMappingURL=variables.d.ts.map