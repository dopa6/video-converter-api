import fetch from "node-fetch";
import { spawn } from "child_process";
import stream from "stream";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).send("No URL provided");

  try {
    if (!/^https?:\/\//.test(url)) {
      return res.status(400).send("Invalid URL");
    }

    const ffmpeg = spawn("ffmpeg", [
      "-i", url,
      "-c:v", "libx264",
      "-c:a", "aac",
      "-f", "mp4",
      "-movflags", "frag_keyframe+empty_moov",
      "pipe:1",
    ]);

    res.setHeader("Content-Type", "video/mp4");

    ffmpeg.stdout.pipe(res);
    ffmpeg.stderr.on("data", (d) => console.log("FFmpeg:", d.toString()));

    ffmpeg.on("error", (err) => {
      console.error("FFmpeg error:", err);
      res.status(500).send("FFmpeg error");
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
}
