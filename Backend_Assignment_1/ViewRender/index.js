const { createServer } = require("http");
const fs = require("fs");
const path = require("path");
const HOST = "localhost";
const PORT = 3003;

const server = createServer((req, res) => {

  switch (req.url) {
    case "/":
    case "/index.html":
      const htmlPath = path.join(__dirname, "static", "index.html");
      fs.readFile(htmlPath, (error, html) => {
        if (error) {
          res.writeHead(500);
          res.end("Error loading Page");
        } else {
          res.setHeader("Content-Type", "text/html");
          res.writeHead(200);
          res.end(html);
        }
      });
      break;
    default:
      const htmlResponse = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>404 - Page not Found</title>
            </head>
            <body>
                <h1>Page Not Found</h1>
            </body>
        </html>
    `;
      res.setHeader("Content-Type", "text/html");
      res.writeHead(404);
      res.end(htmlResponse);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server is listening on http://${HOST}:${PORT}`);
});
