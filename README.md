# gatsby-source-bigcommerce

This source plugin makes BigCommerce API data available in GatsbyJS sites. Currently in active development.

## Installation

For Yarn:

```
yarn add @epicdesignlabs/gatsby-source-bigcommerce
```

For NPM:

```
npm install @epicdesignlabs/gatsby-source-bigcommerce
```

in `gatsby-config.js`

```
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-source-bigcommerce',
      options: {
        ...
      }
    }
  ]
};
```

## Configuration options

Follows [node-bigcommerce](https://github.com/epic-design-labs/node-bigcommerce) api

Example configuration for a single `endpoint`:

```
options: {
  // REQUIRED
  clientId: 'yourClientID',
  secret: 'YourClientSecret',
  accessToken: 'yourAccessToken',
  storeHash: 'yourSiteHash',
  endpoint: '/catalog/products',

  // OPTIONAL
  logLevel: 'info',
  nodeName: 'BigCommerceNode',
  apiVersion: 'v2' // for new storefronts on BigCommerce use 'v3'
}
```

If you want to return data from multiple endpoints, use `endpoints` instead. You can find a list of endpoints [here](https://developer.bigcommerce.com/api-reference/).

```
options: {
  ...

  // Create a nodeName and map it to a BigCommerce endpoint
  endpoints: {
    BigCommerceProducts: "/catalog/products",
    BigCommerceCategories: "/catalog/categories",
    BigCommerceBrands: "/catalog/brands"
  }
}
```

## How to query

```
{
	allBigCommerceNode {
		edges {
			node {
				name
				price
				id
				sku
			}
		}
	}
}
```

## Preview

This currently supports use in Gatsby Cloud.
Preview **only supports product updates**
add the `preview` key to options as shown

```
options: {
  preview: true;
}
```

Once your instance is deployed in Gatsby Cloud, get your preview URL and add it as an environment variable under the key `SITE_HOSTNAME`.

Restart your instance and preview should be live.
