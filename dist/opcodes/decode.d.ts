import { InstrDescriptor } from "./types";
export interface OperandInfo {
    value: number;
    type: "large" | "small" | "var";
    varNum?: number;
}
export interface DecodedInstr {
    desc: InstrDescriptor;
    operands: number[];
    operandInfo?: OperandInfo[];
    storeTarget?: number;
    branchInfo?: {
        offset: number;
        branchOnTrue: boolean;
        branchBytes: number;
    };
}
export declare function decodeNext(vm: any): DecodedInstr;
//# sourceMappingURL=decode.d.ts.map