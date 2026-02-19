export declare function h_loadw(vm: any, [arrayAddr, wordIndex]: number[], ctx: {
    store?: (v: number) => void;
}): void;
export declare function h_loadb(vm: any, [arrayAddr, byteIndex]: number[], ctx: {
    store?: (v: number) => void;
}): void;
export declare function h_storew(vm: any, [arrayAddr, wordIndex, value]: number[]): void;
export declare function h_storeb(vm: any, [arrayAddr, byteIndex, value]: number[]): void;
export declare function h_scan_table(vm: any, operands: number[], ctx: {
    store?: (v: number) => void;
    branch?: (cond: boolean) => void;
}): void;
//# sourceMappingURL=memory.d.ts.map