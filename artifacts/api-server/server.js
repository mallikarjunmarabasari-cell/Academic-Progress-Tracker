const express = require("express");
const cors = require("cors");
const analyzeRoute = require("./routes/analyze");
const authRoute = require("./routes/auth");
const eventsRoute = require("./routes/events");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", authRoute);
app.use("/api", analyzeRoute);
app.use("/api", eventsRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
