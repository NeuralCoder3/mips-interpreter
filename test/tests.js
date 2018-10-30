"use strict";
var p;

QUnit.test("greater than 16-bit immediate", function(assert) {
    p = new Program('addiu $1, $1, 0x17fff');
    p.run();
    assert.equal(p.getRegisters()[1], (0x7fff | 0), "addiu zero extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 1, "addiu immediate error is present");
    p = new Program('addiu $1, $1, 0x1ffff');
    p.run();
    assert.equal(p.getRegisters()[1], (0xffffffff | 0), "addiu one extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 1, "addiu immediate error is present");

    p = new Program('addiu $1, $1, 0xffff \n andi $2, $1, 0xff0f0 \n andi $3, $1, 0x11111');
    p.run();
    assert.equal(p.getRegisters()[2], (0xf0f0 | 0), "andi always zero extended immediate truncated to 16-bit");
    assert.equal(p.getRegisters()[3], (0x1111 | 0), "andi always zero extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 2, "andi immediate error is present");

    p = new Program('ori $1, $1, 0xff0f0');
    p.run();
    assert.equal(p.getRegisters()[1], (0xf0f0 | 0), "ori always zero extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 1, "ori immediate error is present");
    p = new Program('ori $1, $1, 0x11111');
    p.run();
    assert.equal(p.getRegisters()[1], (0x1111 | 0), "ori always zero extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 1, "ori immediate error is present");

    p = new Program('addiu $1, $1, 0xffff \n xori $1, $1, 0xff0f0');
    p.run();
    assert.equal(p.getRegisters()[1], (0xffff0f0f | 0), "xori always zero extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 1, "addiu immediate error is present");
    p = new Program('addiu $1, $1, 0xffff \n xori $1, $1, 0x11111');
    p.run();
    assert.equal(p.getRegisters()[1], (0xffffeeee | 0), "xori always zero extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 1, "addiu immediate error is present");

    p = new Program('addiu $1, $1, 0x8 \n slti $2, $2, 0x10000');
    p.run();
    assert.equal(p.getRegisters()[2], (0x0 | 0), "slti zero extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 1, "slti immediate error is present");
    p = new Program('addiu $1, $1, 0x8 \n slti $2, $2, 0xf7fff');
    p.run();
    assert.equal(p.getRegisters()[2], (0x1 | 0), "slti zero extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 1, "slti immediate error is present");

    p = new Program('addiu $1, $1, 0x8 \n sltiu $2, $2, 0x10000');
    p.run();
    assert.equal(p.getRegisters()[2], (0x0 | 0), "sltiu zero extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 1, "sltiu immediate error is present");
    p = new Program('addiu $1, $1, 0x8 \n sltiu $2, $2, 0xfffff');
    p.run();
    assert.equal(p.getRegisters()[2], (0x1 | 0), "sltiu one extended immediate truncated to 16-bit");
    assert.equal(p.getErrors().length, 1, "sltiu immediate error is present");
});

QUnit.test("reject unsupported operands", function(assert) {
    p = new Program("add $4, $4, $4");
    p.run();
    assert.equal(p.getErrors().length, 1, "error with add (supported is addu)");

    p = new Program("nori $3, $1, $0 \n asdf $20, $19, $10");
    p.run();
    assert.equal(p.getErrors().length, 2, "errors compound with two unspported instructions");
});

QUnit.test("addiu", function(assert) {
    p = new Program('addiu $1, $1, 0xdead');
    p.run();
    assert.equal(p.getRegisters()[1], (0xffffdead | 0), "Immediate is one sign extended");

    p = new Program('addiu $1, $1, 0x7fff');
    p.run();
    assert.equal(p.getRegisters()[1], (0x7fff | 0), "Immediate is zero sign extended");

    p = new Program('addiu $1, $1, 0xffff \n addiu $2, $1, 0x1');
    p.run();
    assert.equal(p.getRegisters()[1], (0xffffffff | 0), "Immediate is one sign extended");
    assert.equal(p.getRegisters()[2], (0x0 | 0), "Immediate should is zero extended, sum is 0");
});

QUnit.test("andi", function(assert) {
    p = new Program('addiu $1, $1, 0xffff \n andi $2, $1, 0xf0f0 \n andi $3, $1, 0x1');
    p.run();
    assert.equal(p.getRegisters()[2], (0xf0f0 | 0), "Immediate is always zero extended");
    assert.equal(p.getRegisters()[3], (0x1 | 0), "Immediate is always zero extended");
});

QUnit.test("ori", function(assert) {
    p = new Program('addiu $1, $1, 0x70f0 \n ori $2, $1, 0x0f0f');
    p.run();
    assert.equal(p.getRegisters()[2], (0x7fff | 0), "Immediate is always zero extended");

    p = new Program('addiu $1, $1, 0xffff \n ori $2, $1, 0x0');
    p.run();
    assert.equal(p.getRegisters()[2], (0xffffffff | 0), "ori should not change original value if immediate is 0");
});

QUnit.test("xori", function(assert) {
    p = new Program('addiu $1, $1, 0xffff \n xori $2, $1, 0x1');
    p.run();
    assert.equal(p.getRegisters()[2], (0xfffffffe | 0), "Immediate is always zero extended");

    p = new Program('addiu $1, $1, 0xffff \n xori $2, $1, 0xffff');
    p.run();
    assert.equal(p.getRegisters()[2], (0xffff0000 | 0), "Immediate is always zero extended");
});

QUnit.test("slti", function(assert) {
    p = new Program('addiu $1, $1, 0x4 \n slti $2, $1, 0x8');
    p.run();
    assert.equal(p.getRegisters()[2], (1 | 0), "Value is less than zero sign extended immediate");

    p = new Program('addiu $1, $1, 0x4 \n slti $2, $1, 0x3');
    p.run();
    assert.equal(p.getRegisters()[2], (0 | 0), "Value is not less than zero sign extended immediate");

    p = new Program('addiu $1, $1, 0x4 \n slti $2, $1, 0x4');
    p.run();
    assert.equal(p.getRegisters()[2], (0 | 0), "Value is equal to zero sign extended immediate");

    p = new Program('addiu $1, $1, 0x4 \n slti $2, $1, 0xffff');
    p.run();
    assert.equal(p.getRegisters()[2], (0 | 0), "Value is not less than one sign extended immediate");
});

QUnit.test("sltiu", function(assert) {
    p = new Program('addiu $1, $1, 0x4 \n sltiu $2, $1, 0x5');
    p.run();
    assert.equal(p.getRegisters()[2], (1 | 0), "Value is less than zero sign extended immediate");

    p = new Program('addiu $1, $1, 0x4 \n sltiu $2, $1, 0x4');
    p.run();
    assert.equal(p.getRegisters()[2], (0 | 0), "Value is equal to zero sign extended immediate");

    p = new Program('addiu $1, $1, 0x4 \n sltiu $2, $1, 0x3');
    p.run();
    assert.equal(p.getRegisters()[2], (0 | 0), "Value is not less than zero sign extended immediate");

    p = new Program('addiu $1, $1, 0x4 \n sltiu $2, $1, 0xffff');
    p.run();
    assert.equal(p.getRegisters()[2], (1 | 0), "Value is less than one sign extended immediate");
});

QUnit.test("writing to $0", function(assert) {
    p = new Program('addiu $0, $0, 0xbeef');
    p.run();
    assert.equal(p.getRegisters()[0], 0, "Cannot write to $0 register");

    p = new Program('ori $3, $0, 0x123 \n ori $5, $0, 0x321 \n addu $0, $3, $5');
    p.run();
    assert.equal(p.getRegisters()[0], 0, "Cannot write to $0 register");
});

function setupTest(instructions) {
    var program = new Program(instructions);
    for (var i = 0; i < 32; ++i) {
        program.registers[i] = i | 0;
    }
    return program;
}

QUnit.test("addu", function(assert) {
    p = setupTest('addu $5, $1, $5');
    p.run();
    assert.equal(p.getRegisters()[5], 6,  "5 + 1 = 6");

    p = setupTest('addu $2, $2, $1');
    p.registers[2] = 0x7fffffff | 0;
    p.run();
    assert.equal(p.getRegisters()[2], (0x80000000 | 0), "Overflow");

    p = setupTest('addu $2, $2, $1');
    p.registers[1] = -1 | 0;
    p.registers[2] = 0x80000000 | 0;
    p.run();
    assert.equal(p.getRegisters()[2], (0x7fffffff | 0), "Underflow");
});

QUnit.test("subu", function(assert) {
    p = setupTest('subu $5, $5, $1');
    p.run();
    assert.equal(p.getRegisters()[5], 4, "5 - 1 = 4");

    p = setupTest('subu $2, $2, $1');
    p.registers[1] = 0xffffffff | 0;
    p.registers[2] = 0x7fffffff | 0;
    p.run();
    assert.equal(p.getRegisters()[2], (0x80000000 | 0), "Overflow");

    p = setupTest('subu $2, $2, $1');
    p.registers[2] = 0x80000000 | 0;
    p.run();
    assert.equal(p.getRegisters()[2], (0x7fffffff | 0), "Underflow");
});

QUnit.test("and", function(assert) {
    p = setupTest('and $4, $4, $4');
    p.run();
    assert.equal(p.getRegisters()[4], 4, "4 & 4 = 4");

    p = setupTest('and $1, $31, $2');
    p.run();
    assert.equal(p.getRegisters()[1], 2, "31 & 2 = 2");
});

QUnit.test("or", function(assert) {
    p = setupTest('or $1, $8, $7');
    p.run();
    assert.equal(p.getRegisters()[1], 15, "8 | 7 = 15");

    p = setupTest('or $5, $0, $5');
    p.run();
    assert.equal(p.getRegisters()[5], 5, "5 | 0 = 5");
});

QUnit.test("xor", function(assert) {
    p = setupTest('xor $5, $5, $5');
    p.run();
    assert.equal(p.getRegisters()[5], 0, "5 ^ 5 = 0");

    p = setupTest('xor $1, $10, $5');
    p.run();
    assert.equal(p.getRegisters()[1], 15, "10 ^ 5 = 15");
});

QUnit.test("nor", function(assert) {
    p = setupTest('nor $1, $10, $5');
    p.run();
    assert.equal(p.getRegisters()[1], (0xfffffff0 | 0), "~(10 | 5) = -16");

    p = setupTest('nor $3, $8, $9');
    p.run();
    assert.equal(p.getRegisters()[3], (0xfffffff6 | 0), "~(10 | 5) = -10");
});

QUnit.test("little endianess", function(assert) {
    p = new Program('lui $31, 0xf1e2 \n ori $31, $31, 0xd3c4 \n sw $31, 0($0)');
    p.run();
    assert.equal(p.getMemory().getMem(0x00000000), 0xc4, "lsb check");
    assert.equal(p.getMemory().getMem(0x00000001), 0xd3, "byte 2 check");
    assert.equal(p.getMemory().getMem(0x00000002), 0xe2, "byte 3 check");
    assert.equal(p.getMemory().getMem(0x00000003), 0xf1, "msb check");
});

// TODO: verify jump/branches conditions
QUnit.test("beq", function(assert) {
    p = new Program('beq $0, $0, 0x8 \n addiu $1, $1, 1 \n ori $5, $5, 0xdead \n ori $4, $4, 0xbabe');
    p.run();
    assert.equal(p.getRegisters()[1], (1 | 0), "Condition true: Delay slot instruction is executed");
    assert.notEqual(p.getRegisters()[5], (0xdead | 0), "Condition true: Branch is taken");
    assert.equal(p.getRegisters()[4], (0xbabe | 0) , "Condition true: Branched instruction is executed");

    p = new Program('ori $1, $1, 0xbeef \n beq $0, $1, 0x8 \n andi $1, $1, 0 \n ori $5, $5, 0xdead \n ori $4, $4, 0xbabe');
    p.run();
    assert.equal(p.getRegisters()[1], (0 | 0), "Condition false: Delay slot instruction is executed, does not affect branch check");
    assert.equal(p.getRegisters()[5], (0xdead | 0), "Condition false: Branch is not taken");
    assert.equal(p.getRegisters()[4], (0xbabe | 0), "Condition false: Branch is not taken, all instructions were executed");

    p = new Program('beq $0, $0, -4 \n addiu $1, $1, 1'); // program should continously loop, while executing delay slot instruction
    for (var i = 0; i < 10; ++i) {
        p.step();
    }
    assert.equal(p.getRegisters()[1], (10 | 0), "Negative branch offset to same instruction");

    p = new Program('beq $0, $0, 0x3fffc \n addiu $1, $1, 1'); // program should continously loop, while executing delay slot instruction
    for (var i = 0; i < 10; ++i) {
        p.step();
    }
    assert.equal(p.getRegisters()[1], (10 | 0), "Negative branch offset to same instruction, with signed offset");
});

QUnit.test("bne", function(assert) {
    p = new Program('bne $0, $0, 0x8 \n addiu $1, $1, 1 \n ori $5, $5, 0xdead \n ori $4, $4, 0xbabe');
    p.run();
    assert.equal(p.getRegisters()[1], (1 | 0), "Condition false: Delay slot instruction is executed");
    assert.equal(p.getRegisters()[5], (0xdead | 0), "Condition false: Branch is not taken");
    assert.equal(p.getRegisters()[4], (0xbabe | 0) , "Condition false: Branched is not taken, all instructions were executed");

    p = new Program('ori $1, $1, 0xbeef \n bne $0, $1, 0x8 \n andi $1, $1, 0 \n ori $5, $5, 0xdead \n ori $4, $4, 0xbabe');
    p.run();
    assert.equal(p.getRegisters()[1], (0 | 0), "Condition true: Delay slot instruction is executed, does not affect branch check");
    assert.notEqual(p.getRegisters()[5], (0xdead | 0), "Condition true: Branch is taken");
    assert.equal(p.getRegisters()[4], (0xbabe | 0), "Condition true: Branch is taken, following instruction was executed");

    p = new Program('addiu $1, $0, 1 \n bne $0, $1, -4 \n addiu $1, $1, 1'); // program should continously loop, while executing delay slot instruction
    for (var i = 0; i < 10; ++i) {
        p.step();
    }
    assert.equal(p.getRegisters()[1], (10 | 0), "Negative branch offset to same instruction");

    p = new Program('addiu $1, $0, 1 \n bne $0, $1, 0x3fffc \n addiu $1, $1, 1'); // program should continously loop, while executing delay slot instruction
    for (var i = 0; i < 10; ++i) {
        p.step();
    }
    assert.equal(p.getRegisters()[1], (10 | 0), "Negative branch offset to same instruction, with signed offset");
});

// TODO: verify move
// TODO: verify shifts
// TODO: verify delay slot, and outputting to the view
// TODO: verify labels
// TODO: verify memory, verify error from non-aligned word
// TODO: verify lui
// TODO: verify negative offsets give errors
// TODO: verify errors in illegal operations (jump/branch in delay slot, jalr rs=rt)
// TODO: test parsing of registers/immediate
// TODO: verify register/immediate types
