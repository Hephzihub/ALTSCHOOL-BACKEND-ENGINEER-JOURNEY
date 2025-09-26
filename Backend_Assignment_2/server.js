import { createServer } from "http"
import fs from "fs"
import path from "path"

const PORT = 3030
const HOST = localhost

const requestHandler = (req, res) => {
  // Routes

  switch (req) {
    // endpoints
    case req.url === '/products' && req.method === "POST":
      addNewProduct(req, res)
      break;
    case req.url === '/products' && req.method === "GET":
      getAllProduct(req, res)
      break;
    case req.url === '/products' && req.method === "PUT":
      updateSingleProduct(req, res)
      break;
    case req.url === '/product' && req.method === "GET":
      getSingleProduct(req, res)
      break;
    case req.url === '/products' && req.method === "DELETE":
      deleteSingleProduct(req, res)
      break;
  
    default:
      break;
  }
}

const addNewProduct = (req, res) => {}
const getAllProduct = (req, res) => {}
const getSingleProduct = (req, res) => {}
const updateSingleProduct = (req, res) => {}
const deleteSingleProduct = (req, res) => {}

const server = createServer(requestHandler);

server.listen(PORT, HOST, () =>{
  console.log(`Server is on https://${HOST}:${PORT}`);
})