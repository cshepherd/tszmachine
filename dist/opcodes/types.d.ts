export type OperandType = "large" | "small" | "var" | "omit";
export type CountKind = "0OP" | "1OP" | "2OP" | "VAR" | "EXT";
export interface ExecCtx {
    store?: (value: number) => void;
    branch?: (cond: boolean) => void;
    branchInfo?: {
        offset: number;
        branchOnTrue: boolean;
        branchBytes: number;
    };
}
export interface InstrDescriptor {
    name: string;
    kind: CountKind;
    opcode: number;
    minVersion?: number;
    maxVersion?: number;
    operandKinds?: OperandType[];
    doesStore?: boolean;
    doesBranch?: boolean;
    handler: (vm: any, operands: number[], ctx: ExecCtx) => void;
}
export declare const d0: (opcode: number, init: Omit<InstrDescriptor, "kind" | "opcode">) => InstrDescriptor;
export declare const d1: (opcode: number, init: Omit<InstrDescriptor, "kind" | "opcode">) => InstrDescriptor;
export declare const d2: (opcode: number, init: Omit<InstrDescriptor, "kind" | "opcode">) => InstrDescriptor;
export declare const dv: (opcode: number, init: Omit<InstrDescriptor, "kind" | "opcode">) => InstrDescriptor;
//# sourceMappingURL=types.d.ts.map