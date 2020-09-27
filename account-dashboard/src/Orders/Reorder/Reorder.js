import React, { Fragment, useState, useContext } from 'react';
import { object } from 'prop-types';
import { Button } from 'react-bootstrap';
import { useMutation } from 'react-apollo';
import { useTranslation } from 'react-i18next';
import { CartStore } from '@corratech/context-provider';
import addConfigurableProductToCart from '../Queries/addConfigurableProductToCart.graphql';
import addSimpleProductsToCart from '../Queries/addSimpleProductsToCart.graphql';

export const Reorder = props => {
    const {
        item,
        configProductAddToCartGraphql,
        simpleProductAddToCartGraphql
    } = props;
    const [t] = useTranslation();
    const { cartState, dispatch } = useContext(CartStore);

    const reorderItems = async items => {
        const filterFreeItems = items.filter(item => {
            return !item.title.match("^FREE");
        });

        const cartInfo = getItemsData(filterFreeItems);

        if (cartInfo.simpleProduct.length > 0) {
            await addItemsToCart({
                variables: {
                    cartId: cartState.cartId,
                    cartItems: cartInfo.simpleProduct
                }
            });
        }

        if (cartInfo.configProduct.length > 0) {
            await addToCartConfig({
                variables: {
                    cartId: cartState.cartId,
                    cartItems: cartInfo.configProduct
                }
            });
        }

        dispatch({
            type: 'SHOULD_OPEN_DRAWER',
            shouldOpenDrawer: true
        });
    };

    const getItemsData = items => {
        let cartInfo = {
            simpleProduct: [],
            configProduct: []
        };

        items &&
            items.map(item => {
                if (item.parent_sku) {
                    cartInfo.configProduct.push({
                        parent_sku: item.parent_sku,
                        data: {
                            quantity: item.qty_ordered,
                            sku: item.sku
                        }
                    });
                } else {
                    cartInfo.simpleProduct.push({
                        data: {
                            quantity: item.qty_ordered,
                            sku: item.sku
                        }
                    });
                }
            });

        return cartInfo;
    };

    const [addToCartConfig, { loading: mutationLoad }] = useMutation(
        configProductAddToCartGraphql,
        {
            fetchPolicy: 'no-cache',
            //on successful completion:
            onCompleted: res => {
                //copy locally stored cart from context provider
                const updatedCart = cartState.cart;
                //update fields on the copied cart based on results of mutation's query
                updatedCart.items = res.addConfigurableProductsToCart.cart.items.map(
                    item => {
                        return item;
                    }
                );
                updatedCart.prices =
                    res.addConfigurableProductsToCart.cart.prices;
                if(res.addConfigurableProductsToCart.cart.free_items)
                    updatedCart.free_items = res.addConfigurableProductsToCart.cart.free_items;
                if(res.addConfigurableProductsToCart.cart.total_quantity)
                    updatedCart.total_quantity = res.addConfigurableProductsToCart.cart.total_quantity;

                //use the dispatch from cartstore to open the minicart and set the stored cart to the updated cart
                dispatch({
                    type: 'SET_CART',
                    cart: updatedCart
                });
            },
            onError: res => {}
        }
    );

    const [addItemsToCart, { loading }] = useMutation(
        simpleProductAddToCartGraphql,
        {
            fetchPolicy: 'no-cache',
            //on successful completion:
            onCompleted: res => {
                //copy locally stored cart from context provider
                const updatedCart = cartState.cart;
                //update fields on the copied cart based on results of mutation's query
                updatedCart.items = res.addSimpleProductsToCart.cart.items;
                updatedCart.prices = res.addSimpleProductsToCart.cart.prices;
                //use the dispatch from cartstore to open the minicart and set the stored cart to the updated car
                if(res.addSimpleProductsToCart.cart.free_items)
                    updatedCart.free_items = res.addSimpleProductsToCart.cart.free_items;
                if(res.addSimpleProductsToCart.cart.total_quantity)
                    updatedCart.total_quantity = res.addSimpleProductsToCart.cart.total_quantity;
                dispatch({
                    type: 'SET_CART',
                    cart: updatedCart
                });
            },
            onError: res => {}
        }
    );

    return (
        <Fragment>
            {item && item.reorder_status ? (
                <Button
                    size="lg"
                    variant="link"
                    className="reorder-order-link"
                    disabled={mutationLoad || loading}
                    onClick={() => reorderItems(item.reorder_items)}
                >
                    <span>{t('Reorder')}</span>
                </Button>
            ) : null}
        </Fragment>
    );
};

Reorder.proptypes = {
    item: object
};
Reorder.defaultProps = {
    configProductAddToCartGraphql: addConfigurableProductToCart,
    simpleProductAddToCartGraphql: addSimpleProductsToCart
};
