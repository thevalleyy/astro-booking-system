export default (req, res) => {
    const json = {
        message: req.url + " was not found.",
        error: true,
    };
    res.status(404).json(json);
};