require("./config/db");

const app = require("express")();
const UserRouter = require("./api/User");

const PORT = 3000;

const bodyParser = require("express").json;
app.use(bodyParser());

app.use("/user", UserRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
