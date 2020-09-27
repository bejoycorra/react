import React, { useContext, useEffect, useState } from 'react';
import {
    AlertTriangle as Warning,
    Check as CheckIcon,
    Lock as LockIcon,
    X as ErrorIcon
} from 'react-feather';
import { ListDropdown } from '@corratech/dropdown';
import { Link } from 'react-router-dom';
import { PaginationToolbar } from '@corratech/pagination';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { WishlistItem } from './WishlistItem';
import { Alert, Button, Modal } from 'react-bootstrap';
import { useMutation } from '@apollo/react-hooks';
import {
    addProductsToCart as addProductsToCartQuery,
    addProductToSpecificWishlist as addProductToSpecificWishlistQuery,
    copyItemsToWishlist as copyItemsToWishlistMutation,
    moveItemsToWishlist as moveItemsToWishlistMutation,
    removeItemFromWishlist as removeItemFromWishlistQuery,
    removeWishlist as removeWishlistQuery,
    updateWishlist as updateWishlistQuery
} from './Queries';
import { CartStore, LoaderStore } from '@corratech/context-provider';
import { useWindowSize } from '@magento/peregrine';

const serialize = require('form-serialize');

export const WishlistGrid = props => {
    const [t] = useTranslation();
    const LoadingIndicator = useContext(LoaderStore);

    const {
        wishlist,
        wishlistsArray,
        setAlerts,
        setMutationError,
        refetch,
        setWishlistId,
        renderWishlist,
        createNewWishlist,
        enableDeleteButton,
        setWishlist,
        editWishlist,
        topBlock: parentTopBlock
    } = props;
    const { cartState, dispatch } = useContext(CartStore);

    const [wishlistItemsChecked, setWishlistItemsChecked] = useState([]); // track checked items
    const [showRemoveModal, setShowRemoveModal] = useState(false); // modal for 'remove wish list'
    const [noSelectedModal, setNoSelectedModal] = useState(false);
    const [action, setAction] = useState('');
    const MOBILE_VIEWPORT = 767;
    const windowSize = useWindowSize();
    const isMobile = windowSize.innerWidth <= MOBILE_VIEWPORT;

    // use effect

    useEffect(() => {
        if (wishlist) {
            setWishlistItemsChecked(wishlist.items.map(() => false));
        }
    }, [wishlist]);

    // Mutations

    const [
        removeWishlist,
        { error: errorRemove, loading: loadingRemove }
    ] = useMutation(removeWishlistQuery);

    const [
        copyItems,
        { error: copingError, loading: loadingCopy }
    ] = useMutation(copyItemsToWishlistMutation);

    const [
        moveItems,
        { error: movingError, loading: loadingMove }
    ] = useMutation(moveItemsToWishlistMutation);

    const [
        removeItemFromWishlist,
        { error: errorRemoveItem, loading: loadingRemoveItem }
    ] = useMutation(removeItemFromWishlistQuery);

    const [
        updateWishlist,
        { loading: loadingUpdateWihslist, error: errorUpdatingWishlist }
    ] = useMutation(updateWishlistQuery);

    const [
        addProductsToCart,
        { loading: addProductsLoading, error: errorAddProducts }
    ] = useMutation(addProductsToCartQuery);

    const [
        addProductToSpecificWishlist,
        {
            loading: loadingAddProductToWishlist,
            error: errorAddingProductToWishlist
        }
    ] = useMutation(addProductToSpecificWishlistQuery);

    // Loaders

    if (
        loadingAddProductToWishlist ||
        addProductsLoading ||
        loadingUpdateWihslist ||
        loadingRemove ||
        loadingRemoveItem ||
        loadingCopy ||
        loadingMove
    ) {
        return <LoadingIndicator />;
    }

    if (errorRemove) {
        return (
            <p>
                {t(
                    'An error occurred while removing wishlist. Please try again.'
                )}
            </p>
        );
    }

    if (errorRemoveItem) {
        return (
            <p>
                {t(
                    'An error occurred while removing item from wishlist. Please try again.'
                )}
            </p>
        );
    }

    if (errorUpdatingWishlist) {
        return (
            <p>
                {t(
                    'An error occurred while updating your to wish list. Please try again.'
                )}
            </p>
        );
    }

    if (errorAddProducts) {
        return (
            <p>
                {t(
                    'An error occurred while adding products to cart. Please try again.'
                )}
            </p>
        );
    }

    if (errorAddingProductToWishlist) {
        return (
            <p>
                {t(
                    'An error occurred while adding item to wish list. Please try again.'
                )}
            </p>
        );
    }

    // Handlers

    const updateAllProducts = e => {
        setAlerts([]);
        setMutationError(false);
        e.preventDefault();
        let formState = serialize(e.target, { hash: true });
        let items = [],
            products = formState.products,
            updateFlag = true;
        for (let id in products) {
            if (!products[id].description) products[id].description = '';
            if (!products[id].qty) {
                setMutationError(t(props.qtyError));
                updateFlag = false;
                return false;
            } else {
                items.push({
                    id: Number(id),
                    ...products[id]
                });
            }
        }

        if (updateFlag) {
            updateWishlist({
                fetchPolicy: 'no-cache',
                variables: {
                    wishlistId: wishlist.id,
                    items: items
                }
            }).then(() => {
                refetch().then(setAlerts([t(props.alertWishlistUpdated)]));
            });
        } else {
            return false;
        }
    };

    const addProductToCart = (itemId, qty, productId) => {
        setAlerts([]);
        setMutationError(false);
        let items = [];
        let itemsArray = [];
        if (itemId) {
            items.push({
                item_id: itemId,
                qty: qty
            });
            itemsArray.push({
                item_id: itemId,
                qty: qty,
                id: productId
            });
        } else {
            items = wishlist.items.map(el => {
                itemsArray.push({
                    item_id: el.id,
                    qty: el.qty,
                    id: el.product.id
                });
                return {
                    item_id: el.id,
                    qty: el.qty
                };
            });
        }

        addProductsToCart({
            fetchPolicy: 'no-cache',
            variables: {
                cartId: cartState.cartId,
                items,
                wishlistId: wishlist.id
            }
        }).then(res => {
            const response = res.data.addProductsToCart;
            const cart = response.cart;
            if (response.messages.success.length > 0 && cart.items.length > 0) {
                var filteredArray = itemsArray.filter(function(items) {
                    return (
                        cart.items.filter(function(cartArray) {
                            return cartArray.product.id == items.id;
                        }).length > 0
                    );
                });

                removeItem(
                    filteredArray.map(el => el.item_id),
                    false
                ).then(() => {
                    const updatedCart = cartState.cart;
                    //update fields on the copied cart based on results of mutation's query
                    updatedCart.items = cart.items;
                    updatedCart.prices = cart.prices;
                    //use the dispatch from cartstore to open the minicart and set the stored cart to the updated cart
                    dispatch({
                        type: 'SHOULD_OPEN_DRAWER',
                        shouldOpenDrawer: !isMobile ? true : false
                    });
                    dispatch({
                        type: 'SET_CART',
                        cart: updatedCart
                    });

                    setAlerts([t(response.messages.success)]);
                    if (response.messages.error.length > 0) {
                        setMutationError(response.messages.error);
                    } else {
                        setMutationError(false);
                    }
                });
            } else {
                setMutationError(t(response.messages.error));
            }
        });
    };

    const removeWishlistHandle = id => {
        setAlerts([]);
        setMutationError(false);
        setShowRemoveModal(false);
        removeWishlist({
            fetchPolicy: 'no-cache',
            variables: {
                id: id
            }
        }).then(() => {
            refetch();
            setWishlistId(wishlistsArray[0].id);
            setAlerts([t(props.alertWishlistRemoved)]);
        });
    };

    const removeItem = (products, showAlert = true) => {
        setAlerts([]);
        setMutationError(false);
        let items = [];
        if (!(products instanceof Array)) {
            items.push({
                itemId: products
            });
        } else {
            items = products.map(itemId => {
                return { itemId };
            });
        }

        return removeItemFromWishlist({
            fetchPolicy: 'no-cache',
            variables: {
                items
            }
        }).then(() => {
            refetch().then(res => {
                renderWishlist(res.data);
                if (showAlert) setAlerts([t(props.alertRemoveItem)]);
            });
        });
    };

    const copyItemsToWishlist = (itemId = null, qty = null, wishlist_id) => {
        let items = [];

        if (itemId) {
            items.push({
                itemId,
                qty
            });
        } else {
            items = wishlist.items
                .filter((el, i) => wishlistItemsChecked[i])
                .map(el => {
                    return {
                        itemId: el.id,
                        qty: el.qty
                    };
                });
        }

        if (!items.length) {
            setAction('copy');
            setNoSelectedModal(true);
            return;
        }

        return copyItems({
            fetchPolicy: 'no-cache',
            variables: {
                wishlistId: wishlist_id,
                items
            }
        }).then(() => {
            refetch().then(res => {
                renderWishlist(res.data);
                setAlerts([t(props.alertSelectedItemsCopied)]);
                setWishlistId(wishlist_id);
                setWishlist(
                    res.data.multiple_wishlist.find(el => el.id == wishlist_id)
                );
            });
        });
    };

    const moveItemsToWishlist = (itemId = null, qty = null, wishlist_id) => {
        let items = [];

        if (itemId) {
            items.push({
                itemId,
                qty
            });
        } else {
            items = wishlist.items
                .filter((el, i) => wishlistItemsChecked[i])
                .map(el => {
                    return {
                        itemId: el.id,
                        qty: el.qty
                    };
                });
        }

        if (!items.length) {
            setAction('move');
            setNoSelectedModal(true);
            return;
        }

        return moveItems({
            fetchPolicy: 'no-cache',
            variables: {
                wishlistId: wishlist_id,
                items
            }
        }).then(() => {
            refetch().then(res => {
                renderWishlist(res.data);
                setAlerts([t(props.alertSelectedItemsCopied)]);
                setWishlistId(wishlist_id);
                setWishlist(
                    res.data.multiple_wishlist.find(el => el.id == wishlist_id)
                );
            });
        });
    };

    // Elements

    const wishlistElements = wishlist
        ? wishlist.items.map((el, i) => {
              return (
                  <WishlistItem
                      key={el.id}
                      checked={wishlistItemsChecked}
                      setChecked={setWishlistItemsChecked}
                      index={i}
                      addToCart={addProductToCart}
                      copyItemToWishlist={copyItemsToWishlist}
                      moveItemToWishlist={moveItemsToWishlist}
                      removeItem={removeItem}
                      wishlistItems={wishlist.items}
                      wishlistsArray={wishlistsArray}
                      wishlistId={wishlist.id}
                      createNewWishlist={action => {
                          createNewWishlist(action);
                      }}
                      crossIcon={props.crossIcon}
                      editIcon={props.editIcon}
                  />
              );
          })
        : [];

    const actionsToolbar = (
        <div className={'actions-toolbar'}>
            {wishlist && wishlist.items.length ? (
                <>
                    <Button
                        className={'share-button'}
                        type={'submit'}
                        variant={'primary'}
                        size={'large'}
                        title={t(props.updateButton)}
                    >
                        {t(props.updateButton)}
                    </Button>
                    <Link
                        to={`/my-account/wishlist/share/id/${wishlist.id}`}
                        title={t(props.shareButton)}
                        className={'btn btn-primary btn-lg'}
                    >
                        {t(props.shareButton)}
                    </Link>
                    <Button
                        className={'add-all-button'}
                        variant={'primary'}
                        size={'large'}
                        title={t(props.buttonAddToCart)}
                        onClick={addProductToCart.bind(null, null)}
                    >
                        {t(props.buttonAddToCart)}
                    </Button>
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
            {enableDeleteButton ? (
                <Button
                    className={'remove-button'}
                    variant={'primary'}
                    size={'large'}
                    onClick={() => setShowRemoveModal(true)}
                    title={t(props.deleteButton)}
                >
                    {t(props.deleteButton)}
                </Button>
            ) : (
                ''
            )}
        </div>
    );

    const topBlock = wishlist ? (
        <>
            <div className={'wishlist-title'}>
                <span className={'name'}>{wishlist.name} </span>
                <Link
                    to={'#'}
                    onClick={e => {
                        e.preventDefault();
                        editWishlist(true);
                        createNewWishlist();
                    }}
                >
                    <button>{t('Edit')}</button>
                </Link>
            </div>
            <div className={'wishlist-info'}>
                <div className={'block -left'}>
                    <div className={'private-wishlist'}>
                        {props.lockIcon ? (
                            props.lockIcon
                        ) : (
                            <LockIcon size={16} />
                        )}
                        {t('Private Wishlist')}
                    </div>
                    <div className={''}>
                        {wishlist.items.length}{' '}
                        {wishlist.items.length === 1 ? t('item') : t('items')}
                        {t(' in Wishlist')}
                    </div>
                </div>
                {wishlist.items.length > 0 ? (
                    <div className={'block -right'}>
                        <label
                            className={'root-checkbox'}
                            htmlFor={'select_all_checkbox'}
                        >
                            <span className={'icon-checkbox'}>
                                {wishlistItemsChecked.filter(el => el)
                                    .length === wishlist.items.length && (
                                    <CheckIcon size={18} />
                                )}
                            </span>
                            <input
                                type={'checkbox'}
                                className={'input-checkbox'}
                                id={'select_all_checkbox'}
                                checked={
                                    wishlistItemsChecked.filter(el => el)
                                        .length === wishlist.items.length
                                }
                                onChange={e => {
                                    setWishlistItemsChecked(
                                        wishlistItemsChecked.map(
                                            () => e.target.checked
                                        )
                                    );
                                }}
                            />
                            <span className={'label-checkbox'}>
                                <span>{t('Select All')}</span>
                            </span>
                        </label>

                        <ListDropdown
                            dropdownTitle={t('Move Selected to Wishlist')}
                            className={'move'}
                            dropdownHandler={moveItemsToWishlist.bind(
                                null,
                                null,
                                null
                            )}
                            namesArray={wishlistsArray}
                            listId={wishlist.id}
                            additionalLink={
                                wishlistsArray.length < 5 ? (
                                    <Link
                                        to={'#'}
                                        className={'create-wishlist-button'}
                                        onClick={e => {
                                            e.preventDefault();
                                            if (
                                                wishlistItemsChecked.filter(
                                                    el => el
                                                ).length === 0
                                            ) {
                                                setAction('move');
                                                setNoSelectedModal(true);
                                            } else {
                                                createNewWishlist(
                                                    moveItemsToWishlist.bind(
                                                        null,
                                                        null,
                                                        null
                                                    )
                                                );
                                            }
                                        }}
                                        title={t(
                                            props.createNewWishlistDropdown
                                        )}
                                    >
                                        <button>
                                            {t(props.createNewWishlistDropdown)}
                                        </button>
                                    </Link>
                                ) : (
                                    ''
                                )
                            }
                        />

                        <ListDropdown
                            dropdownTitle={t('Copy Selected to Wishlist')}
                            dropdownHandler={copyItemsToWishlist.bind(
                                null,
                                null,
                                null
                            )}
                            namesArray={wishlistsArray}
                            listId={wishlist.id}
                            additionalLink={
                                wishlistsArray.length < 5 ? (
                                    <Link
                                        to={'#'}
                                        className={'create-wishlist-button'}
                                        onClick={e => {
                                            e.preventDefault();
                                            if (
                                                wishlistItemsChecked.filter(
                                                    el => el
                                                ).length === 0
                                            ) {
                                                setAction('copy');
                                                setNoSelectedModal(true);
                                            } else {
                                                createNewWishlist(
                                                    copyItemsToWishlist.bind(
                                                        null,
                                                        null,
                                                        null
                                                    )
                                                );
                                            }
                                        }}
                                        title={t(
                                            props.createNewWishlistDropdown
                                        )}
                                    >
                                        <button>
                                            {t(props.createNewWishlistDropdown)}
                                        </button>
                                    </Link>
                                ) : (
                                    ''
                                )
                            }
                        />
                    </div>
                ) : (
                    ''
                )}
            </div>
        </>
    ) : (
        ''
    );

    return (
        <>
            {wishlist ? (
                <form onSubmit={updateAllProducts}>
                    <PaginationToolbar
                        enableScroll={true}
                        separationBlock={actionsToolbar}
                        topBlock={
                            <>
                                {parentTopBlock}
                                {topBlock}
                            </>
                        }
                        pagesDelta={2}
                        children={wishlistElements}
                        childrenQty={wishlist.items.length}
                        initialItemsQty={10}
                        id={wishlist.id}
                    />
                </form>
            ) : (
                ''
            )}
            <Modal show={showRemoveModal}>
                <Modal.Header>
                    <h3>{t('Delete Wishlist')}</h3>
                    <button
                        type="button"
                        className="close"
                        onClick={() => setShowRemoveModal(false)}
                    >
                        <span aria-hidden="true">
                            <ErrorIcon color={'#000'} />
                        </span>
                        <span className="sr-only">{t('Close')}</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    {t('Are you sure you want to delete this wishlist?')}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => removeWishlistHandle(wishlist.id)}
                    >
                        {t('Yes')}
                    </Button>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => setShowRemoveModal(false)}
                    >
                        {t('Cancel')}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={noSelectedModal}>
                <Modal.Header>
                    <h3>{t('Attention')}</h3>
                    <button
                        type="button"
                        className="close"
                        onClick={() => setNoSelectedModal(false)}
                    >
                        <span aria-hidden="true">
                            <ErrorIcon color={'#000'} />
                        </span>
                        <span className="sr-only">{t('Close')}</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    {t(`Please select items to ${action}.`)}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => setNoSelectedModal(false)}
                    >
                        {t('Ok')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

WishlistGrid.propTypes = {
    requiredText: PropTypes.string,
    alertAddedToCart: PropTypes.string,
    alertWishlistUpdated: PropTypes.string,
    alertWishlistRemoved: PropTypes.string,
    alertItemCopied: PropTypes.string,
    alertRemoveItem: PropTypes.string,
    alertItemMoved: PropTypes.string,
    alertSelectedItemsCopied: PropTypes.string,
    alertSelectedItemsMoved: PropTypes.string,
    updateButton: PropTypes.string,
    buttonAddToCart: PropTypes.string,
    shareButton: PropTypes.string,
    deleteButton: PropTypes.string,
    emptyWishlist: PropTypes.string,
    createNewWishlistDropdown: PropTypes.string,
    qtyError: PropTypes.string
};

WishlistGrid.defaultProps = {
    requiredText: 'This is a required field',
    alertAddedToCart: 'Item was successfully added to your cart!',
    alertWishlistUpdated: 'Wishlist was successfully updated!',
    alertWishlistRemoved: 'Wishlist was successfully deleted!',
    alertItemCopied: 'Item was successfully copied to another wishlist!',
    alertRemoveItem: 'Item was successfully removed from wishlist!',
    alertItemMoved: 'Item was successfully moved to another wishlist!',
    alertSelectedItemsCopied:
        'Items were successfully copied to another wishlist!',
    alertSelectedItemsMoved:
        'Items were successfully moved to another wishlist!',
    updateButton: 'Update Wishlist',
    buttonAddToCart: 'Add all to Cart',
    shareButton: 'Share Wishlist',
    deleteButton: 'Delete Wishlist',
    emptyWishlist: `You have no items in your wishlist.`,
    createNewWishlistDropdown: '+ Create New Wishlist',
    qtyError: 'Please enter a valid quantity to update your wishlist.'
};
