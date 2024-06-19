import { CorsOptions } from "cors";

export const corsConfig: CorsOptions = {
  origin: function (origin, cb) {
    const whiteList = [process.env.FRONTEND_URL || "http://localhost:5173"];
    if (process.argv[2] === "--api") {
      whiteList.push(undefined);
    }
    if (whiteList.includes(origin)) {
      cb(null, true); // ALLOW
      return;
    }
    cb(new Error("Error de CORS")); // BLOCK
  },
};
