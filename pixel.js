import fs from "fs";

const pixelBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAn0B9UuPoNMAAAAASUVORK5CYII=";
fs.writeFileSync("pixel.png", Buffer.from(pixelBase64, "base64"));
