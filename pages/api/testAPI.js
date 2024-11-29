import testSomething from "@/js/testSomething";

export default (req, res) => {
    // pass elemtents to the function
    try {
        const result = testSomething(req.query);
        const json = {
            message: result,
            error: false,
        };
        res.status(200).json(json);
    } catch (err) {
        const json = {
            message: err.message,
            error: true,
        };
        res.status(500).json(json);
    }
};
