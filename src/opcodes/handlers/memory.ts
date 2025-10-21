// Memory access handlers

function toSigned16(n: number): number {
  return n > 32767 ? n - 65536 : n;
}

export function h_loadw(
  vm: any,
  [arrayAddr, wordIndex]: number[],
  ctx: { store?: (v: number) => void },
) {
  if (!vm.memory) {
    console.error("Memory not loaded");
    return;
  }

  const signedIndex = toSigned16(wordIndex);
  const addr = arrayAddr + 2 * signedIndex;

  if (addr < 0 || addr >= vm.memory.length - 1) {
    console.error(
      `LOADW: Invalid memory address 0x${addr.toString(16)} ` +
        `(array=0x${arrayAddr.toString(16)}, index=${signedIndex}). ` +
        `Memory size: 0x${vm.memory.length.toString(16)}`,
    );
    return;
  }

  const value = vm.memory.readUInt16BE(addr);
  ctx.store?.(value);
}

export function h_loadb(
  vm: any,
  [arrayAddr, byteIndex]: number[],
  ctx: { store?: (v: number) => void },
) {
  if (!vm.memory) {
    console.error("Memory not loaded");
    return;
  }

  const signedIndex = toSigned16(byteIndex);
  const addr = arrayAddr + signedIndex;

  if (addr < 0 || addr >= vm.memory.length) {
    console.error(
      `LOADB: Invalid memory address 0x${addr.toString(16)} ` +
        `(array=0x${arrayAddr.toString(16)}, index=${signedIndex}). ` +
        `Memory size: 0x${vm.memory.length.toString(16)}`,
    );
    return;
  }

  const value = vm.memory.readUInt8(addr);
  if (vm.trace && addr === 0x21) {
    console.log(`@loadb Reading screen width from 0x21: value=${value}`);
  }
  ctx.store?.(value);
}

export function h_storew(vm: any, [arrayAddr, wordIndex, value]: number[]) {
  if (!vm.memory) {
    console.error("Memory not loaded");
    return;
  }

  const signedIndex = toSigned16(wordIndex);
  const addr = arrayAddr + 2 * signedIndex;

  if (addr < 0 || addr >= vm.memory.length - 1) {
    console.error(
      `STOREW: Invalid memory address 0x${addr.toString(16)} ` +
        `(array=0x${arrayAddr.toString(16)}, index=${signedIndex}). ` +
        `Memory size: 0x${vm.memory.length.toString(16)}`,
    );
    return;
  }

  // Warn if writing to header region (offsets 0x00-0x3F)
  if (addr >= 0x00 && addr <= 0x3F) {
    console.warn(
      `STOREW: Writing to header region at 0x${addr.toString(16)} ` +
        `(array=0x${arrayAddr.toString(16)}, index=${signedIndex}, value=0x${value.toString(16)}). ` +
        `This may corrupt critical header fields!`
    );
  }

  // Special warning for object table address (0x0a-0x0b)
  if (addr === 0x0a) {
    console.error(
      `STOREW: CRITICAL - Writing to object table address field at 0x${addr.toString(16)}! ` +
        `Old value=0x${vm.memory.readUInt16BE(addr).toString(16)}, new value=0x${value.toString(16)}`
    );
  }

  vm.memory.writeUInt16BE(value, addr);
}

export function h_storeb(vm: any, [arrayAddr, byteIndex, value]: number[]) {
  if (!vm.memory) {
    console.error("Memory not loaded");
    return;
  }

  const signedIndex = toSigned16(byteIndex);
  const addr = arrayAddr + signedIndex;

  if (addr < 0 || addr >= vm.memory.length) {
    console.error(
      `STOREB: Invalid memory address 0x${addr.toString(16)} ` +
        `(array=0x${arrayAddr.toString(16)}, index=${signedIndex}). ` +
        `Memory size: 0x${vm.memory.length.toString(16)}`,
    );
    return;
  }

  // Warn if writing to header region (offsets 0x00-0x3F)
  if (addr >= 0x00 && addr <= 0x3F) {
    console.warn(
      `STOREB: Writing to header region at 0x${addr.toString(16)} ` +
        `(array=0x${arrayAddr.toString(16)}, index=${signedIndex}, value=0x${value.toString(16)}). ` +
        `This may corrupt critical header fields!`
    );
  }

  // Special warning for object table address bytes (0x0a-0x0b)
  if (addr === 0x0a || addr === 0x0b) {
    console.error(
      `STOREB: CRITICAL - Writing to object table address field at 0x${addr.toString(16)}! ` +
        `Old value=0x${vm.memory.readUInt8(addr).toString(16)}, new value=0x${value.toString(16)}`
    );
  }

  vm.memory.writeUInt8(value, addr);
}

export function h_scan_table(
  vm: any,
  operands: number[],
  ctx: { store?: (v: number) => void; branch?: (cond: boolean) => void },
) {
  if (!vm.memory) {
    console.error("Memory not loaded");
    ctx.store?.(0);
    ctx.branch?.(false);
    return;
  }

  const x = operands[0]; // value to search for
  const table = operands[1]; // table address
  const len = operands[2]; // number of entries
  const form = operands.length > 3 ? operands[3] : 0x82; // default form

  // Parse form byte
  const fieldSize = form & 0x7f; // bits 0-6: size of each entry in bytes
  const isWord = (form & 0x80) !== 0; // bit 7: 1=word entries, 0=byte entries

  // Search the table
  let foundAddr = 0;
  for (let i = 0; i < len; i++) {
    const entryAddr = table + i * fieldSize;

    if (entryAddr < 0 || entryAddr >= vm.memory.length) {
      console.error(
        `SCAN_TABLE: Invalid table entry address 0x${entryAddr.toString(16)}`
      );
      break;
    }

    let entryValue: number;
    if (isWord) {
      // Read word (2 bytes)
      if (entryAddr >= vm.memory.length - 1) {
        console.error(
          `SCAN_TABLE: Invalid word read at 0x${entryAddr.toString(16)}`
        );
        break;
      }
      entryValue = vm.memory.readUInt16BE(entryAddr);
    } else {
      // Read byte
      entryValue = vm.memory.readUInt8(entryAddr);
    }

    if (entryValue === x) {
      foundAddr = entryAddr;
      break;
    }
  }

  // Store the result (address where found, or 0 if not found)
  ctx.store?.(foundAddr);
  // Branch if found
  ctx.branch?.(foundAddr !== 0);
}
