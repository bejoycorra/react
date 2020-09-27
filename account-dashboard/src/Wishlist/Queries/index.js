import gql from 'graphql-tag';

export const getCustomerWishlist = gql`
    query {
        multiple_wishlist {
            id
            items_count
            name
            sharing_code
            updated_at
            items {
                id
                qty
                description
                added_at
                selectedProductId
                product {
                    sku
                    name
                    id
                    special_price
                    url_key
                    small_image {
                        url
                    }
                    price {
                        regularPrice {
                            amount {
                                value
                                currency
                            }
                        }
                    }
                    ... on ConfigurableProduct {
                        variants {
                            product {
                                sku
                                name
                                id
                                special_price
                                url_key
                                small_image {
                                    url
                                }
                                attribute_set_id
                                ... on PhysicalProductInterface {
                                    weight
                                }
                                price {
                                    regularPrice {
                                        amount {
                                            value
                                            currency
                                        }
                                    }
                                }
                            }
                            attributes {
                                label
                                code
                                value_index
                            }
                        }
                    }
                }
            }
        }
    }
`;

export const createNewWishlist = gql`
    mutation createWishlist($name: String!) {
        createWishlist(input: { name: $name, visibility: false }) {
            id
            items_count
            name
            sharing_code
            updated_at
            items {
                id
                qty
                description
                added_at
                product {
                    sku
                    name
                }
            }
        }
    }
`;

export const removeWishlist = gql`
    mutation removeWishlist($id: Int!) {
        removeWishlist(input: { wishlistId: $id }) {
            messages
        }
    }
`;

export const addProductToSpecificWishlist = gql`
    mutation addProductToWishlist($items: [WishlistProduct]!) {
        addProductToWishlist(input: { items: $items }) {
            items_count
            name
            sharing_code
            updated_at
            items {
                id
                qty
                description
                added_at
                product {
                    sku
                    name
                }
            }
        }
    }
`;

export const removeItemFromWishlist = gql`
    mutation removeItemWishlist($items: [WishlistRemoveItem]!) {
        removeItemWishlist(input: { items: $items }) {
            messages
        }
    }
`;

export const updateWishlist = gql`
    mutation updateWishlist($wishlistId: Int!, $items: [itemToUpdate]!) {
        updateWishlist(input: { wishlistId: $wishlistId, items: $items }) {
            messages
        }
    }
`;

export const addProductsToCart = gql`
    mutation addProductsToCart(
        $cartId: String!
        $items: [ItemToCart]!
        $wishlistId: Int!
    ) {
        addProductsToCart(
            input: { cart_id: $cartId, items: $items, wishlist_id: $wishlistId }
        ) {
            result
            messages {
                error
                success
            }
            redirect_url
            cart {
                id
                items {
                    id
                    prices {
                        price {
                            value
                        }
                    }
                    product {
                        name
                        id
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
                    ... on ConfigurableCartItem {
                        configurable_options {
                            id
                            option_label
                            value_id
                            value_label
                        }
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

export const renameWishlist = gql`
    mutation($wishlistId: Int!, $name: String!) {
        renameWishlist(
            input: { wishlistId: $wishlistId, name: $name, visibility: false }
        ) {
            messages
        }
    }
`;

export const copyItemsToWishlist = gql`
    mutation($wishlistId: Int!, $items: [WishlistProductData]!) {
        copyWishlist(input: { wishlistId: $wishlistId, items: $items }) {
            messages
        }
    }
`;

export const moveItemsToWishlist = gql`
    mutation($wishlistId: Int!, $items: [WishlistProductData]!) {
        moveWishlist(input: { wishlistId: $wishlistId, items: $items }) {
            messages
        }
    }
`;
