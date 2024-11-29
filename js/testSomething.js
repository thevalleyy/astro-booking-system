function testSomething(args) {
    console.log("this test is run server-side");
    console.log(args);
    return "this is a test";
}

module.exports = testSomething;
