# Overview

This module adds graphql support for Amasty Product Attachments Module.

## Documentation

* [WIKI](https://corratech.jira.com/wiki/spaces/EKC/pages/2100986101/Amasty+Product+Attachments+GraphQl)

## Installation

Install via Composer: This is the recommended installation method as it allows you to easily update the extension in the future. Make sure this module is added to the project's packagist account.
`composer require corra/module-amasty-product-attachment-graph-ql`

## Usage

### Request

```graphql
{
    products(filter: {sku: {eq: "24-MB01"}}) {
    items {
    product_attachments{
    is_enabled
    is_show_tab
    tab_title
    is_show_icon
    is_show_size
            product_attachments_data{
                icon_url
                file_url
                file_label
                size
            }
           }
        }
    }
}
```

### Response

```json
{
  "data": {
    "products": {
      "items": [
        {
          "product_attachments": {
            "is_enabled": 1,
            "is_show_tab": 1,
            "tab_title": "Product Attachments",
            "is_show_icon": 1,
            "is_show_size": 1,
            "product_attachments_data": [
              {
                "icon_url": "https://domain.com/media/amasty/amfile/icon/Image.png",
                "file_url": "https://domain.com/amfile/file/download/file/1/product/1/",
                "file_label": "Screenshot_2020-07-23_at_3.18.59_PM",
                "size": "270.49 kB"
              },
              {
                "icon_url": "https://domain.com/media/amasty/amfile/icon/Image.png",
                "file_url": "https://domain.com/amfile/file/download/file/2/product/1/",
                "file_label": "Screenshot_2020-07-23_at_2.49.05_PM",
                "size": "412.58 kB"
              }
            ]
          }
        }
      ]
    }
  }
}
```
