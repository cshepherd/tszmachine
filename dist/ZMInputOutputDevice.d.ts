interface ZMInputOutputDevice {
    readChar(): Promise<string>;
    readLine(): Promise<string>;
    writeChar(char: string): Promise<void>;
    writeString(str: string): Promise<void>;
    close(): void;
    rows?: number;
    cols?: number;
}
export type { ZMInputOutputDevice };
//# sourceMappingURL=ZMInputOutputDevice.d.ts.map