export declare function h_print_char(vm: any, [zsciiChar]: number[]): void;
export declare function h_print_num(vm: any, [num]: number[]): void;
export declare function h_sread(vm: any, operands: number[]): Promise<void>;
export declare function h_print_table(vm: any, operands: number[]): void;
export declare function h_split_window(vm: any, [lines]: number[]): void;
export declare function h_set_window(vm: any, [window]: number[]): void;
export declare function h_erase_window(vm: any, [window]: number[]): void;
export declare function h_erase_line(vm: any, [value]: number[]): void;
export declare function h_set_cursor(vm: any, [line, column]: number[]): void;
export declare function h_get_cursor(vm: any, [array]: number[]): void;
export declare function h_set_text_style(vm: any, [style]: number[]): void;
export declare function h_buffer_mode(vm: any, [flag]: number[]): void;
export declare function h_output_stream(vm: any, [number, table]: number[]): void;
export declare function h_input_stream(vm: any, [number]: number[]): void;
export declare function h_sound_effect(vm: any, operands: number[]): void;
export declare function h_read_char(vm: any, [one, time, routine]: number[], ctx: {
    store?: (v: number) => void;
}): Promise<void>;
export declare function h_save(vm: any, _operands: number[], ctx: {
    branch?: (condition: boolean) => void;
    store?: (v: number) => void;
    branchInfo?: {
        offset: number;
        branchOnTrue: boolean;
        branchBytes: number;
    };
}): Promise<void>;
export declare function h_restore(vm: any, _operands: number[], ctx: {
    branch?: (condition: boolean) => void;
}): Promise<void>;
//# sourceMappingURL=io.d.ts.map