import gql from 'graphql-tag';

export const addToCart = gql`
    mutation addSimpleProductsToCart(
        $cartId: String!
        $cartItems: [SimpleProductCartItemInput]!
    ) {
        addSimpleProductsToCart(
            input: { cart_id: $cartId, cart_items: $cartItems }
        ) {
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
        }
    }
`;

export const createEmptyCart = gql`
    mutation {
        createEmptyCart
    }
`;
