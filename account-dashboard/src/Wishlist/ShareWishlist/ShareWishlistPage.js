import React, { useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSharedWishlist } from './Queries';
import { useQuery } from 'react-apollo';
import { CartStore, LoaderStore } from '@corratech/context-provider';
import { Price } from '@corratech/price';
import { useTranslation } from 'react-i18next';
import { Alert, Button } from 'react-bootstrap';
import { AddToWishlist } from '@corratech/add-to-wishlist';
import { useWindowSize } from '@magento/peregrine';
import { useTitle } from 'react-use';
import { addToCart as addToCartMutation } from '../../Orders/Queries/orderListActions';
import { useMutation } from 'react-apollo';
import './ShareWishlistPage.less';
import { X as ErrorIcon, AlertTriangle as Warning } from 'react-feather';
import PropTypes from 'prop-types';

export const ShareWishlistPage = props => {
    const LoadingIndicator = useContext(LoaderStore);
    const { id } = useParams();
    const [t] = useTranslation();
    const { cartState, dispatch } = useContext(CartStore);
    const windowSize = useWindowSize();
    const MOBILE_VIEWPORT = 767;
    const isMobile = windowSize.innerWidth <= MOBILE_VIEWPORT;

    useTitle(t(props.pageTitle));

    const categoryUrlSuffix = '.html';
    const previewImageSize = 300;
    const imageParam = '?auto=webp&format=pjpg&width=' + previewImageSize;

    const { data, error, loading } = useQuery(getSharedWishlist, {
        fetchPolicy: 'no-cache',
        variables: {
            code: id
        }
    });

    const [
        addProductsToCart,
        { loading: loadingAdding, error: errorAdding }
    ] = useMutation(addToCartMutation);

    if (loading || loadingAdding) {
        return <LoadingIndicator />;
    }

    if (!data || !data.shared_wishlist) {
        return (
            <div className={'container-width share-wishlist-page'}>
                <Alert variant={'danger'}>
                    {props.errorIcon ? (
                        props.errorIcon
                    ) : (
                        <ErrorIcon
                            size={14}
                            strokeWidth={'4'}
                            color={'#b30015'}
                        />
                    )}
                    {t(props.wishlistExists)}
                </Alert>
            </div>
        );
    }

    const items =
        data && data.shared_wishlist ? data.shared_wishlist.items : [];

    const addToCart = (productSku = false, qty = 0) => {
        window.scrollTo(0, 0);
        let cartItems = [];
        if (productSku) {
            cartItems.push({
                data: {
                    quantity: qty,
                    sku: productSku
                }
            });
        } else {
            items.map(el => {
                cartItems.push({
                    data: {
                        quantity: el.qty,
                        sku: el.product.sku
                    }
                });
            });
        }

        addProductsToCart({
            fetchPolicy: 'no-cache',
            variables: {
                cartItems,
                cartId: cartState.cartId
            }
        }).then(res => {
            //copy locally stored cart from context provider
            const updatedCart = cartState.cart;
            //update fields on the copied cart based on results of mutation's query
            updatedCart.items = res.data.addSimpleProductsToCart.cart.items;
            updatedCart.prices = res.data.addSimpleProductsToCart.cart.prices;
            //use the dispatch from cartstore to open the minicart and set the stored cart to the updated cart
            dispatch({
                type: 'SHOULD_OPEN_DRAWER',
                shouldOpenDrawer: !isMobile ? true : false
            });
            dispatch({
                type: 'SET_CART',
                cart: updatedCart
            });
        });
    };

    return (
        <div className={'container-width share-wishlist-page'}>
            <h1>{data.shared_wishlist.name}</h1>
            {error ? (
                <Alert variant={'danger'}>
                    {props.errorIcon ? (
                        props.errorIcon
                    ) : (
                        <ErrorIcon
                            size={14}
                            strokeWidth={'4'}
                            color={'#b30015'}
                        />
                    )}
                    {error.graphQLErrors.map(({ message }, i) => (
                        <div key={i}>{message}</div>
                    ))}
                </Alert>
            ) : (
                ''
            )}
            {errorAdding ? (
                <Alert variant={'danger'}>
                    {props.errorIcon ? (
                        props.errorIcon
                    ) : (
                        <ErrorIcon
                            size={14}
                            strokeWidth={'4'}
                            color={'#b30015'}
                        />
                    )}
                    {errorAdding.graphQLErrors.map(({ message }, i) => (
                        <div key={i}>{message}</div>
                    ))}
                </Alert>
            ) : (
                ''
            )}

            {items.length > 0 ? (
                <>
                    <table className={'product-table'}>
                        <caption className="table-caption sr-only">
                            {t('Share Wishlist Products')}
                        </caption>
                        {!isMobile ? (
                            <thead>
                                <tr className={'head'}>
                                    <th scope="col" className={'product'}>
                                        {t('Product')}
                                    </th>
                                    <th scope="col" className={'comment'}>
                                        {t('Comment')}
                                    </th>
                                    <th scope="col" className={'actions'}>
                                        {t('Add To Cart')}
                                    </th>
                                </tr>
                            </thead>
                        ) : null}

                        <tbody>
                            {items.map((item, index) => {
                                let product = item.product;
                                return (
                                    <tr key={index}>
                                        <th scope="row" className={'product'}>
                                            {isMobile ? (
                                                <span
                                                    className={'mobile-label'}
                                                >
                                                    {t('Product: ')}
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                            <div className={'product-image'}>
                                                <img
                                                    src={`${product.small_image.url}${imageParam}`}
                                                    alt={product.name}
                                                />
                                                <Link
                                                    to={`/${product.url_key}${categoryUrlSuffix}`}
                                                    title={product.name}
                                                >
                                                    <button>
                                                        {product.name}
                                                    </button>
                                                </Link>
                                            </div>

                                            <div className={'product-price'}>
                                                <Price product={product} />
                                            </div>
                                        </th>
                                        <td className={'comment'}>
                                            {isMobile ? (
                                                <span
                                                    className={'mobile-label'}
                                                >
                                                    {t('Comment: ')}
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                            {item.description}
                                        </td>
                                        <td className={'actions'}>
                                            {isMobile ? (
                                                <span
                                                    className={'mobile-label'}
                                                >
                                                    {t('Add To Cart: ')}
                                                </span>
                                            ) : (
                                                ''
                                            )}
                                            <Button
                                                size={'lg'}
                                                variant={'primary'}
                                                title={t('Add To Cart')}
                                                onClick={() =>
                                                    addToCart(
                                                        product.sku,
                                                        item.qty
                                                    )
                                                }
                                            >
                                                {t('Add To Cart')}
                                            </Button>
                                            <AddToWishlist
                                                productId={product.id}
                                            >
                                                {t('Add To Wishlist')}
                                            </AddToWishlist>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div className={'actions-toolbar'}>
                        <Button
                            size={'lg'}
                            variant={'primary'}
                            onClick={addToCart.bind(null, null)}
                            title={t('Add All To Cart')}
                        >
                            {t('Add All To Cart')}
                        </Button>
                    </div>
                </>
            ) : (
                <Alert variant={'warning'}>
                    {props.warningIcon ? (
                        props.warningIcon
                    ) : (
                        <Warning size={14} strokeWidth={'4'} color={'#000'} />
                    )}
                    {t(props.emptyWishlist)}
                </Alert>
            )}
        </div>
    );
};

ShareWishlistPage.propTypes = {
    warningIcon: PropTypes.node,
    emptyWishlist: PropTypes.string,
    wishlistExists: PropTypes.string,
    pageTitle: PropTypes.string
};

ShareWishlistPage.defaultProps = {
    emptyWishlist: 'This wishlist has not items.',
    wishlistExists: `This wishlist probably doesn't exist. Please try another one.`,
    pageTitle: 'Shared Wishlist'
};
