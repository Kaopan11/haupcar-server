import { app } from "./app.js";

// Use PORT from .env. If it is missing, use 3000.
const port = Number(process.env.PORT) || 3000;

// This file is the only place that opens the port.
app.listen(port, () => {
    console.log("Server listening on http://localhost:" + port);
});
