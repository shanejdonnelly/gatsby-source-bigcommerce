# gatsby-bigcommerce-plugin

Currently in active development. This source plugin makes BigCommerce API data available in GatsbyJS sites.

## Installation

```
yarn add gatsby-bigcommerce-plugin
```

in `gatsby-config.js`

```
module.exports = {
  plugins: [
    {
      resolve: 'gatsby-bigcommerce-plugin',
      options: {
        ...
      }
    }
  ]
};
```

## Configuration options

Follows [node-bigcommerce-v2](https://github.com/epic-design-labs/node-bigcommerce-v2) api

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
  apiVersion: 'v2'
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
