/**
 * Common test utilities for opcode testing
 */
export declare class MockVM {
    memory: number[];
    pc: number;
    fetchByteLog: number[];
    decodeOperandLog: string[];
    readOperandTypesLog: number[];
    constructor(memory: number[]);
    _fetchByte(): number;
    _fetchWord(): number;
    _decodeOperand(type: string): number;
    _decodeOperandWithInfo(type: string): {
        value: number;
        type: string;
        varNum?: number;
    };
    _readOperandTypes(opcode?: number): string[];
    _readBranchOffset(): {
        offset: number;
        branchOnTrue: boolean;
    };
}
//# sourceMappingURL=test-utils.d.ts.map