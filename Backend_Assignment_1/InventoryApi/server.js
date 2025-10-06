import { createServer } from "http";
import { writeFile, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const PORT = 3030;
const HOST = "localhost";
let productsDB = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inventoryDbPath = join(__dirname, "data", "dataDB.json");

const requestHandler = (req, res) => {
  res.setHeader("Content-Type", "application/json");
  // Routes

  const url = req.url;
  const method = req.method;

  if (url === "/products" && method === "GET") {
    getAllProduct(req, res);
  } else if (url === "/products" && method === "POST") {
    addNewProduct(req, res);
  } else if (url.startsWith("/products/") && method === "GET") {
    getSingleProduct(req, res);
  } else if (url.startsWith("/products/") && method === "PUT") {
    updateSingleProduct(req, res);
  } else if (url.startsWith("/products/") && method === "DELETE") {
    deleteSingleProduct(req, res);
  } else {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Route not found" }));
  }
};

const getAllProduct = (req, res) => {
  res.statusCode = 200;
  res.end(JSON.stringify({ data: productsDB }));
};

const addNewProduct = (req, res) => {
  const body = [];

  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBOdy = Buffer.concat(body).toString();
    const newProduct = JSON.parse(parsedBOdy);

    const lastProduct = productsDB[productsDB.length - 1];
    const lastProductId = lastProduct.id;
    newProduct.id = lastProductId + 1;

    productsDB.push(newProduct);

    writeFile(inventoryDbPath, JSON.stringify(productsDB), (err) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            message:
              "Internal Server Error. Could not save product to database.",
          })
        );
      }

      res.end(JSON.stringify(newProduct));
    });
  });
};

const getSingleProduct = (req, res) => {
  const productId = parseInt(req.url.split("/")[2]);

  const product = productsDB.find((item) => item.id === productId);

  if (!product) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Product not found" }));
    return;
  }

  res.statusCode = 200;
  res.end(JSON.stringify(product));
};

const updateSingleProduct = (req, res) => {
  const productId = parseInt(req.url.split("/")[2]);

  const body = [];

  req.on("data", (chunk) => {
    body.push(chunk);
  });

  req.on("end", () => {
    const parsedBOdy = Buffer.concat(body).toString();
    const update = JSON.parse(parsedBOdy);

    const productIndex = productsDB.findIndex((item) => item.id === productId);

    if (productIndex === -1) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: "Product not found" }));
      return;
    }

    // Update product (keep the same ID)
    productsDB[productIndex] = { ...productsDB[productIndex], ...update, id: productId };

    writeFile(inventoryDbPath, JSON.stringify(productsDB), (err) => {
      if (err) {
        console.log(err);
        res.writeHead(500);
        res.end(
          JSON.stringify({
            message:
              "Internal Server Error. Could not save product to database.",
          })
        );
      }

      res.end(JSON.stringify(update));
    });
  });
};

const deleteSingleProduct = (req, res) => {
  const productId = parseInt(req.url.split("/")[2]);

  const productIndex = productsDB.findIndex((item) => item.id === productId);

  if (productIndex === -1) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Product not found" }));
    return;
  }

  const deletedProduct = productsDB.splice(productIndex, 1)[0];

  writeFile(inventoryDbPath, JSON.stringify(productsDB, null, 2), (err) => {
    if (err) {
      console.error(err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Failed to delete product" }));
      return;
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({ message: "Product deleted", product: deletedProduct })
    );
  });
};

const server = createServer(requestHandler);

server.listen(PORT, HOST, () => {
  productsDB = JSON.parse(readFileSync(inventoryDbPath, "utf-8"));
  // console.log(productsDB);
  console.log(`Server is on https://${HOST}:${PORT}`);
});
