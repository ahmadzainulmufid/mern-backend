import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import db from "./utils/database";

const app = express();

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is Running",
    data: null,
  });
});

app.use("/api", router);

// Flag untuk koneksi database
let isConnected = false;

// Export default untuk Vercel (serverless handler)
export default async function handler(req, res) {
  if (!isConnected) {
    await db();
    console.log("Database Connected");
    isConnected = true;
  }

  return app(req, res); // Proxy express handler ke Vercel
}

// Untuk local development, pakai app.listen()
if (process.env.NODE_ENV !== "production") {
  const PORT = 3000;

  db().then(() => {
    console.log("Database Connected (Local)");
    app.listen(PORT, () => {
      console.log(`Local server running at http://localhost:${PORT}`);
    });
  });
}
