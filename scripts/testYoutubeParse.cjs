const https = require("https");

https
  .get("https://www.youtube.com/@TeoyubeWorld/videos", (res) => {
    let body = "";
    res.on("data", (chunk) => {
      body += chunk;
    });
    res.on("end", () => {
      const ids = [
        ...new Set(
          [...body.matchAll(/"videoId"\s*:\s*"([^"]{11})"/g)].map((match) => match[1])
        )
      ];
      console.log(JSON.stringify({ count: ids.length, ids: ids.slice(0, 12) }, null, 2));
    });
  })
  .on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
