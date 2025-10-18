export declare function h_get_sibling(vm: any, [objectId]: number[], ctx: {
    store?: (v: number) => void;
    branch?: (c: boolean) => void;
}): void;
export declare function h_get_child(vm: any, [objectId]: number[], ctx: {
    store?: (v: number) => void;
    branch?: (c: boolean) => void;
}): void;
export declare function h_get_parent(vm: any, [objectId]: number[], ctx: {
    store?: (v: number) => void;
}): void;
export declare function h_remove_obj(vm: any, [objectId]: number[]): void;
export declare function h_print_obj(vm: any, [objectId]: number[]): void;
export declare function h_test_attr(vm: any, [objectId, attrNum]: number[], ctx: {
    branch?: (c: boolean) => void;
}): void;
export declare function h_set_attr(vm: any, [objectId, attrNum]: number[]): void;
export declare function h_clear_attr(vm: any, [objectId, attrNum]: number[]): void;
export declare function h_jin(vm: any, [obj1, obj2]: number[], ctx: {
    branch?: (c: boolean) => void;
}): void;
export declare function h_insert_obj(vm: any, [objectId, destId]: number[]): void;
//# sourceMappingURL=objects.d.ts.map