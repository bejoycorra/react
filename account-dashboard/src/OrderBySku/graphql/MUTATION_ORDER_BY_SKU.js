import gql from 'graphql-tag';

const MUTATION_ORDER_BY_SKU = gql`
    mutation OrderBySku($input: OrderBySkuInput!) {
        orderBySku(input: $input) {
            cart {
                items {
                    id
                    product {
                        name
                        sku
                        stock_status
                        thumbnail {
                            label
                            url
                        }

                        price {
                            regularPrice {
                                amount {
                                    currency
                                    value
                                }
                            }
                        }
                        special_price
                        url_key
                    }
                    quantity
                }

                prices {
                    grand_total {
                        value
                        currency
                    }
                    applied_taxes {
                        label
                        amount {
                            value
                            currency
                        }
                    }
                    subtotal_including_tax {
                        value
                        currency
                    }
                    subtotal_excluding_tax {
                        value
                        currency
                    }
                    subtotal_with_discount_excluding_tax {
                        value
                        currency
                    }
                }
            }
            failed_items {
                data {
                    quantity
                    sku
                }
            }
            added_count
        }
    }
`;

export default MUTATION_ORDER_BY_SKU;
