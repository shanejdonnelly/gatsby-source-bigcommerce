"use strict"; // External

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

exports.__esModule = true;
exports.sourceNodes = sourceNodes;
exports.onCreateDevServer = onCreateDevServer;

var _dotenv = _interopRequireDefault(require("dotenv"));

var _httpProxyMiddleware = require("http-proxy-middleware");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _micro = _interopRequireWildcard(require("micro"));

var _bigcommerce = _interopRequireDefault(require("./bigcommerce"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// BigCommerce
_dotenv.default.config();

async function sourceNodes({
  actions,
  createNodeId,
  createContentDigest
}, configOptions) {
  const {
    createNode
  } = actions;
  const {
    endpoint,
    endpoints,
    clientId,
    secret,
    storeHash,
    accessToken,
    preview,
    nodeName,
    apiVersion
  } = configOptions;
  const bigCommerce = new _bigcommerce.default({
    clientId,
    accessToken,
    secret,
    storeHash,
    apiVersion,
    responseType: "json"
  });

  if (!endpoint && !endpoints) {
    console.log("You have not provided a Big Commerce API endpoint, please add one to your gatsby-config.js");
    return;
  }

  const handleGenerateNodes = (node, name) => {
    return { ...node,
      id: createNodeId(node.id),
      bigcommerce_id: node.id,
      parent: null,
      children: [],
      internal: {
        type: name,
        content: JSON.stringify(node),
        contentDigest: createContentDigest(node)
      }
    };
  };

  if (endpoint) {
    // Fetch and create nodes for a single endpoint.
    return await bigCommerce.get(endpoint).then(res => {
      // If the data object is not on the response, it could be v2 which returns an array as the root, so use that as a fallback
      const resData = res.data ? res.data : res;
      return resData.map(datum => createNode(handleGenerateNodes(datum, nodeName)));
    });
  } else {
    // Fetch and create nodes from multiple endpoints
    await Promise.all(Object.entries(endpoints).map(([nodeName, endpoint]) => bigCommerce.get(endpoint).then(res => {
      // If the data object is not on the response, it could be v2 which returns an array as the root, so use that as a fallback
      const resData = res.data ? res.data : res;
      return resData.map(datum => createNode(handleGenerateNodes(datum, nodeName)));
    })));
  }

  if (process.env.NODE_ENV === "development" && preview) {
    // make a fetch request to subscribe to webhook from BC.
    await (0, _nodeFetch.default)(`https://api.bigcommerce.com/stores/${storeHash}/${apiVersion || `v3`}/hooks`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Auth-Client": clientId,
        "X-Auth-Token": accessToken
      },
      body: JSON.stringify({
        scope: "store/product/updated",
        is_active: true,
        destination: `${process.env.SITE_HOSTNAME}/___BCPreview`
      })
    }).then(res => res.json());
    const server = (0, _micro.default)(async (req, res) => {
      const request = await (0, _micro.json)(req);
      const productId = request.data.id; // webhooks dont send any information, just an id

      const newProduct = await bigCommerce.get(`/catalog/products/${productId}`);
      const nodeToUpdate = newProduct.data;

      if (nodeToUpdate.id) {
        createNode(handleGenerateNodes(nodeToUpdate, nodeName || `BigCommerceNode`));
        console.log("\x1b[32m", `Updated node: ${nodeToUpdate.id}`);
      }

      res.end("ok");
    });
    server.listen(8033, console.log("\x1b[32m", `listening to changes for live preview at route /___BCPreview`));
  }
}

function onCreateDevServer({
  app
}) {
  app.use("/___BCPreview/", (0, _httpProxyMiddleware.createProxyMiddleware)({
    target: `http://localhost:8033`,
    secure: false
  }));
}