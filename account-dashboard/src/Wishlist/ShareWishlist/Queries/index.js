import gql from 'graphql-tag';

export const shareWishlist = gql`
    mutation shareWishlist(
        $wishlistId: Int!
        $emails: String!
        $message: String
    ) {
        shareWishlist(
            input: {
                wishlistId: $wishlistId
                emails: $emails
                message: $message
            }
        ) {
            messages
        }
    }
`;

export const getSharedWishlist = gql`
    query shared_wishlist($code: String!) {
        shared_wishlist(code: $code) {
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
                    id
                    name
                    special_price
                    url_key
                    sku
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
                }
            }
        }
    }
`;
