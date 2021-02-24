const catRouter = require("express").Router();
const axios = require("axios");

const { authorize } = require("../auth/middlewares");

catRouter.route("/").get(authorize, async (req, res, next) => {
  try {
    const { data } = await axios.get("http://cataas.com/cat?json=true");
    console.log(data);
    res.status(200).send(data);
  } catch (error) {
    res.status(401).send({ message: error.message });
  }
});

module.exports = catRouter;
