import { ZMInputOutputDevice } from "./ZMInputOutputDevice";
type zMachineHeader = {
    version: number;
    release: number;
    serial: string;
    checksum: number;
    initialProgramCounter: number;
    dictionaryAddress: number;
    objectTableAddress: number;
    globalVariablesAddress: number;
    staticMemoryAddress: number;
    dynamicMemoryAddress: number;
    highMemoryAddress: number;
    abbreviationsAddress: number;
    fileLength: number;
    checksumValid: boolean;
    alphabetIdentifier: number;
};
declare class ZMachine {
    private filePath;
    private inputOutputDevice;
    private pc;
    private fileHandle;
    private header;
    private memory;
    private stack;
    private callStack;
    private currentContext;
    private localVariables;
    private trace;
    private playerObjectNumber;
    private lastRead;
    private runtime;
    constructor(filePath: string, inputOutputDevice: ZMInputOutputDevice | null);
    rleBuffer(input: Buffer): Promise<Buffer>;
    saveData(pc: number): Promise<Buffer | null>;
    restoreFromSave(saveData: Buffer): Promise<boolean>;
    load(): Promise<void>;
    private parseHeader;
    setPlayerObjectNumber(objectNumber: number): any;
    getPlayerObjectNumber(): any;
    setLastRead(lastRead: string): any;
    getLastRead(): string;
    getGlobalVariableValue(variableNumber: number): any;
    setGlobalVariableValue(variableNumber: number, value: number): any;
    getLocalVariableValue(variableNumber: number): any;
    setLocalVariableValue(variableNumber: number, value: number): any;
    getVariableValue(variableNumber: number): any;
    setVariableValue(variableNumber: number, value: number): any;
    getHeader(): zMachineHeader | null;
    setTrace(enabled: boolean): void;
    close(): Promise<void>;
    advancePC(offset: number): void;
    private returnFromRoutine;
    private getPropertyDefaultSize;
    private getObjectEntrySize;
    private getObjectAddress;
    private getObjectName;
    findPlayerParent(): {
        objectNumber: number;
        name: string;
    } | null;
    print(abbreviations?: boolean): void;
    _fetchByte(): number;
    _fetchWord(): number;
    _decodeOperand(kind: "large" | "small" | "var"): number;
    _decodeOperandWithInfo(kind: "large" | "small" | "var"): {
        value: number;
        type: "large" | "small" | "var";
        varNum?: number;
    };
    _readOperandTypes(opcode?: number): ("large" | "small" | "var" | "omit")[];
    _readBranchOffset(): {
        offset: number;
        branchOnTrue: boolean;
        branchBytes: number;
    };
    /**
     * Execute a single instruction using the handler-based architecture.
     */
    step(): Promise<void>;
    /**
     * Public API for executing an instruction. Just invokes step().
     */
    executeInstruction(): Promise<void>;
    _storeVariable(varNum: number, value: number): void;
    _applyBranch(offset: number, branchOnTrue: boolean, condition: boolean): void;
    decodeZSCII(abbreviations?: boolean): string;
}
export { ZMachine };
//# sourceMappingURL=ZMachine.d.ts.map