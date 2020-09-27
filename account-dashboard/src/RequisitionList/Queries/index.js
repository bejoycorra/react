import gql from 'graphql-tag';

export const getAllRequisitionLists = gql`
    query {
        requisitionList {
            count
            requisitionList {
                id
                name
                description
                updatedAt
                items_count
                items {
                    itemId
                    storeId
                    sku
                    qty
                    selectedProductId
                    product {
                        id
                        name
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
                                    id
                                    name
                                    sku
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
    }
`;

export const deleteRequisitionList = gql`
    mutation($requisitionListId: Int!) {
        removeRequisitionList(
            input: { requisitionListId: $requisitionListId }
        ) {
            messages
        }
    }
`;

export const requisitionListItems = gql`
    query($requisitionListId: Int!) {
        requisitionList(requisitionListId: $requisitionListId) {
            count
            requisitionList {
                id
                name
                description
                updatedAt
                items_count
                items {
                    itemId
                    storeId
                    sku
                    qty
                }
            }
        }
    }
`;

export const removeItemsFromRequisitionList = gql`
    mutation($listId: Int!, $items: [RequisitionListItem]!) {
        removeRequisitionListItem(
            input: { requisitionListId: $listId, items: $items }
        ) {
            messages
        }
    }
`;

export const addItemsToCart = gql`
    mutation(
        $requisitionListId: Int!
        $addAll: Boolean
        $items: [ItemToCart]
        $cartId: String!
        $flag: Boolean!
    ) {
        addProductsToCartRequisitionList(
            input: {
                items: $items
                requisitionListId: $requisitionListId
                addAll: $addAll
                cartId: $cartId
                flag: $flag
            }
        ) {
            messages
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

export const updateRequisitionList = gql`
    mutation($requisitionListId: Int!, $items: [requisitionListItemToUpdate]!) {
        updateRequisitionList(
            input: { requisitionListId: $requisitionListId, items: $items }
        ) {
            messages
        }
    }
`;

export const moveItems = gql`
    mutation(
        $sourceRequisitionListId: Int!
        $targetRequisitionListId: Int!
        $selectedItems: [selectedItemIds]!
    ) {
        moveRequisitionList(
            input: {
                sourceRequisitionListId: $sourceRequisitionListId
                targetRequisitionListId: $targetRequisitionListId
                selectedItems: $selectedItems
            }
        ) {
            messages
        }
    }
`;

export const copyItems = gql`
    mutation(
        $sourceRequisitionListId: Int!
        $targetRequisitionListId: Int!
        $selectedItems: [selectedItemIds]!
    ) {
        copyRequisitionList(
            input: {
                sourceRequisitionListId: $sourceRequisitionListId
                targetRequisitionListId: $targetRequisitionListId
                selectedItems: $selectedItems
            }
        ) {
            messages
        }
    }
`;

export const createEmptyCart = gql`
    mutation {
        createEmptyCart
    }
`;
