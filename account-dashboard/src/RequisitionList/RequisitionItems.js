import React, { useContext, useState, useEffect } from 'react';
import {
    getAllRequisitionLists,
    deleteRequisitionList,
    removeItemsFromRequisitionList as removeItemsFromRequisitionListMutation,
    addItemsToCart as addItemsToCartMutation,
    updateRequisitionList,
    moveItems as moveItemsMutation,
    copyItems as copyItemsMutation,
    createEmptyCart
} from './Queries';
import { useMutation, useQuery } from 'react-apollo';
import { CartStore, LoaderStore } from '@corratech/context-provider';
import { Link, useParams, useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Alert } from 'react-bootstrap';
import { ListForm, AddToRequisitionList } from '@corratech/add-to-requisition';
import { Form } from 'informed';
import {
    Check as CheckIcon,
    AlertTriangle as Warning,
    X as ErrorIcon
} from 'react-feather';
import { Price, useWindowSize } from '@magento/peregrine';

import PropTypes from 'prop-types';
import { RequisitionItem } from './RequisitionItem';
import { useTitle } from 'react-use';
import { ListDropdown } from '@corratech/dropdown';

export const RequisitionItems = props => {
    const { id: listId, flag } = useParams();
    const history = useHistory();
    const [t] = useTranslation();
    const LoadingIndicator = useContext(LoaderStore);
    const { cartState, dispatch } = useContext(CartStore);

    const windowSize = useWindowSize();
    const MOBILE_VIEWPORT = 767;
    const isMobile = windowSize.innerWidth <= MOBILE_VIEWPORT;

    useTitle(t('Requisition List'));

    const [checkedItems, setCheckedItems] = useState([]);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [removingSpecificItem, setRemovingSpecificItem] = useState(null);
    const [alertMessage, setAlertMessage] = useState(
        flag === 'addedItem' ? t(props.addedItem) : ''
    );
    const [deleteListModal, setDeleteListModal] = useState(false);
    const [addToCartModal, setAddToCartModal] = useState(false);

    const { data, loading, error, refetch: refetchList } = useQuery(
        getAllRequisitionLists,
        {
            fetchPolicy: 'no-cache',
            notifyOnNetworkStatusChange: true,
            variables: {
                requisitionListId: listId
            },
            onCompleted: data => {
                setCheckedItems(
                    data.requisitionList.requisitionList
                        .find(el => el.id == listId)
                        .items.map(() => false)
                );
            }
        }
    );

    const [
        removeItemsFromList,
        { loading: removing, error: errorRemoving }
    ] = useMutation(removeItemsFromRequisitionListMutation);

    const [
        updateItems,
        { loading: updating, error: errorUpdating }
    ] = useMutation(updateRequisitionList);

    const [
        addItemsToCart,
        { loading: adding, error: errorAdding }
    ] = useMutation(addItemsToCartMutation);

    const [
        deleteList,
        { loading: deletingList, error: errorWhileDeleting }
    ] = useMutation(deleteRequisitionList);

    const [createCart, { loading: creatingCart }] = useMutation(
        createEmptyCart
    );

    const [
        moveItems,
        { loading: movingItems, error: movingError }
    ] = useMutation(moveItemsMutation);

    const [
        copyItems,
        { loading: copyingItems, error: copyingError }
    ] = useMutation(copyItemsMutation);

    useEffect(() => {
        if (alertMessage) {
            window.scrollTo(0, 0);
        }
    }, [alertMessage]);

    if (
        error ||
        errorWhileDeleting ||
        errorRemoving ||
        errorUpdating ||
        movingError ||
        copyingError ||
        errorAdding
    ) {
        return (
            <p>
                {t(
                    'Error while fetching your requisition lists. Please try again.'
                )}
            </p>
        );
    }

    if (
        loading ||
        deletingList ||
        removing ||
        adding ||
        updating ||
        movingItems ||
        copyingItems ||
        creatingCart
    ) {
        return <LoadingIndicator />;
    }

    const { requisitionList: dataList } = data;
    const requisitionList = dataList.requisitionList.find(
        el => el.id == listId
    );

    const removeRequisitionList = () => {
        deleteList({
            variables: {
                requisitionListId: listId
            }
        }).then(() => {
            history.push('/my-account/requisition-lists');
        });
    };

    const updateAllProducts = formState => {
        let items = requisitionList.items.map(el => {
            let id = el.itemId;
            return {
                qty: formState.products[id].qty,
                id: id
            };
        });

        updateItems({
            fetchPolicy: 'no-cache',
            variables: {
                requisitionListId: listId,
                items: items
            }
        }).then(() => {
            setAlertMessage(props.successfullyUpdated);
        });
    };

    const removeItems = (itemId = null, setAlert = true) => {
        setShowRemoveModal(false);
        let items = [];
        if (itemId) {
            items.push({
                itemId
            });
        } else {
            items = getCheckedItems().map(el => {
                return {
                    itemId: el.itemId
                };
            });
        }

        setRemovingSpecificItem(null);

        removeItemsFromList({
            variables: {
                items,
                listId: listId
            }
        }).then(() => {
            refetchList().then(() => {
                if (setAlert) setAlertMessage(t(props.removedItemAlert));
            });
        });
    };

    const addToCart = merge => {
        setAddToCartModal(false);
        let items = requisitionList.items
            .filter((el, i) => checkedItems[i])
            .map(el => {
                return {
                    itemId: el.itemId
                };
            });

        addItemsToCart({
            variables: {
                items: items,
                requisitionListId: listId,
                cartId: cartState.cartId,
                flag: !merge
            }
        }).then(res => {
            const cart = res.data.addProductsToCartRequisitionList.cart,
                updatedCart = cartState.cart;
            //update fields on the copied cart based on results of mutation's query
            updatedCart.items = cart.items;
            updatedCart.prices = cart.prices;
            //use the dispatch from cartstore to open the minicart and set the stored cart to the updated cart
            dispatch({
                type: 'SHOULD_OPEN_DRAWER',
                shouldOpenDrawer: true
            });
            dispatch({
                type: 'SET_CART',
                cart: updatedCart
            });

            setAlertMessage(t(props.successfullyAdded));
        });
    };

    const itemsActions = (targetListId, move = true) => {
        // if not copy then move
        let executer = move ? moveItems : copyItems;

        var selectedItems = getCheckedItems().map(el => {
            return { id: el.itemId };
        });

        const variables = {
            fetchPolicy: 'no-cache',
            sourceRequisitionListId: Number(listId),
            targetRequisitionListId: targetListId,
            selectedItems
        };

        executer({
            variables
        }).then(() => {
            let newListName = data.requisitionList.requisitionList.find(
                el => el.id === targetListId
            ).name;
            refetchList().then(() => {
                if (move) {
                    setAlertMessage(
                        t(
                            props.movedItem
                                .replace('%1', getCheckedItems().length)
                                .replace('%2', newListName)
                        )
                    );
                } else {
                    setAlertMessage(
                        t(
                            props.copiedItem
                                .replace('%1', getCheckedItems().length)
                                .replace('%2', newListName)
                        )
                    );
                }
            });
        });
    };

    const numberOfCheckedItems = () => {
        return checkedItems.filter(el => el).length;
    };

    const getCheckedItems = () => {
        return requisitionList.items.filter((el, i) => checkedItems[i]);
    };

    return (
        <>
            <div
                className={`requisition-items ${
                    props.className ? props.className : ''
                }`}
            >
                {flag || alertMessage ? (
                    <Alert variant={'success'}>
                        {props.checkIcon ? (
                            props.checkIcon
                        ) : (
                            <CheckIcon
                                size="14"
                                strokeWidth={'4'}
                                color={'#000'}
                            />
                        )}
                        {alertMessage}
                    </Alert>
                ) : (
                    ''
                )}
                <div
                    className={`toolbar ${
                        requisitionList.items.length === 0 ? '-empty' : ''
                    }`}
                >
                    <div className={'-left'}>
                        <h1>{requisitionList.name}</h1>
                        <ListForm
                            editList={true}
                            linkTitle={t('Rename')}
                            list={requisitionList}
                            callback={refetchList}
                            formTitle={t('Rename Requisition List')}
                        />
                        <p>{requisitionList.description}</p>
                    </div>

                    {requisitionList.items.length > 0 ? (
                        <>
                            <div className={'-right'}>
                                <Link
                                    to={'#'}
                                    onClick={e => {
                                        e.preventDefault();
                                        window.print();
                                    }}
                                >
                                    <button>{t('Print')}</button>
                                </Link>
                            </div>
                            {!isMobile ? (
                                <div className={'-justified'}>
                                    <div className={'items'}>
                                        {requisitionList.items.length}

                                        {requisitionList.items.length === 1
                                            ? t(' item')
                                            : t(' items')}
                                    </div>

                                    <div className={'list-actions'}>
                                        <label
                                            className={'root-checkbox'}
                                            htmlFor={'select_all_checkbox'}
                                        >
                                            <span className={'icon-checkbox'}>
                                                {numberOfCheckedItems() ===
                                                    requisitionList.items
                                                        .length && (
                                                    <CheckIcon size={18} />
                                                )}
                                            </span>
                                            <input
                                                type={'checkbox'}
                                                className={'input-checkbox'}
                                                id={'select_all_checkbox'}
                                                checked={
                                                    numberOfCheckedItems() ===
                                                    requisitionList.items.length
                                                }
                                                onChange={e => {
                                                    setCheckedItems(
                                                        checkedItems.map(
                                                            () =>
                                                                e.target.checked
                                                        )
                                                    );
                                                }}
                                            />
                                            <span className={'label-checkbox'}>
                                                {t('Select All')}
                                            </span>
                                        </label>
                                        <Link
                                            className={'remove-selected'}
                                            to={'#'}
                                            title={t('Remove selected')}
                                            onClick={e => {
                                                e.preventDefault();
                                                setShowRemoveModal(true);
                                            }}
                                        >
                                            <button>
                                                {t('Remove selected')}
                                            </button>
                                        </Link>

                                        <ListDropdown
                                            dropdownTitle={t('Move selected')}
                                            dropdownHandler={id => {
                                                numberOfCheckedItems()
                                                    ? itemsActions(id)
                                                    : setShowRemoveModal(true);
                                            }}
                                            namesArray={
                                                data.requisitionList
                                                    .requisitionList
                                            }
                                            listId={Number(listId)}
                                            preventClosingSelector={
                                                '[role="dialog"]'
                                            }
                                            additionalLink={
                                                <ListForm
                                                    linkTitle={t(
                                                        '+ Create New Requisition List'
                                                    )}
                                                    noItemsCallback={() =>
                                                        setShowRemoveModal(true)
                                                    }
                                                    checkItems={getCheckedItems().map(
                                                        el => el.sku
                                                    )}
                                                    callback={res => {
                                                        let newList =
                                                            res.data
                                                                .createRequisitionList
                                                                .requisitionList[0];
                                                        data.requisitionList.requisitionList.push(
                                                            newList
                                                        );
                                                        itemsActions(
                                                            newList.id
                                                        );
                                                    }}
                                                />
                                            }
                                        />
                                        <ListDropdown
                                            dropdownTitle={t('Copy selected')}
                                            dropdownHandler={id => {
                                                numberOfCheckedItems()
                                                    ? itemsActions(id, false)
                                                    : setShowRemoveModal(true);
                                            }}
                                            namesArray={
                                                data.requisitionList
                                                    .requisitionList
                                            }
                                            listId={Number(listId)}
                                            preventClosingSelector={
                                                '[role="dialog"]'
                                            }
                                            additionalLink={
                                                <ListForm
                                                    linkTitle={t(
                                                        '+ Create New Requisition List'
                                                    )}
                                                    noItemsCallback={() =>
                                                        setShowRemoveModal(true)
                                                    }
                                                    checkItems={getCheckedItems().map(
                                                        el => el.sku
                                                    )}
                                                    callback={res => {
                                                        let newList =
                                                            res.data
                                                                .createRequisitionList
                                                                .requisitionList[0];
                                                        data.requisitionList.requisitionList.push(
                                                            newList
                                                        );
                                                        itemsActions(
                                                            newList.id,
                                                            false
                                                        );
                                                    }}
                                                />
                                            }
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={'-justified'}>
                                        <div className={'items'}>
                                            {requisitionList.items.length}

                                            {requisitionList.items.length === 1
                                                ? t(' item')
                                                : t(' items')}
                                        </div>
                                        <label
                                            className={'root-checkbox'}
                                            htmlFor={'select_all_checkbox'}
                                        >
                                            <span className={'icon-checkbox'}>
                                                {numberOfCheckedItems() ===
                                                    requisitionList.items
                                                        .length && (
                                                    <CheckIcon size={18} />
                                                )}
                                            </span>
                                            <input
                                                type={'checkbox'}
                                                className={'input-checkbox'}
                                                id={'select_all_checkbox'}
                                                checked={
                                                    numberOfCheckedItems() ===
                                                    requisitionList.items.length
                                                }
                                                onChange={e => {
                                                    setCheckedItems(
                                                        checkedItems.map(
                                                            () =>
                                                                e.target.checked
                                                        )
                                                    );
                                                }}
                                            />
                                            <span className={'label-checkbox'}>
                                                {t('Select All')}
                                            </span>
                                        </label>
                                    </div>
                                    <div className={'-justified'}>
                                        <span>{t('With selected')}</span>
                                        <Link
                                            className={'remove-selected'}
                                            to={'#'}
                                            title={t('Remove selected')}
                                            onClick={e => {
                                                e.preventDefault();
                                                setShowRemoveModal(true);
                                            }}
                                        >
                                            <button>{t('Remove')}</button>
                                        </Link>

                                        <ListDropdown
                                            dropdownTitle={t('Move')}
                                            dropdownHandler={id => {
                                                numberOfCheckedItems()
                                                    ? itemsActions(id)
                                                    : setShowRemoveModal(true);
                                            }}
                                            namesArray={
                                                data.requisitionList
                                                    .requisitionList
                                            }
                                            listId={Number(listId)}
                                            preventClosingSelector={
                                                '[role="dialog"]'
                                            }
                                            additionalLink={
                                                <ListForm
                                                    linkTitle={t(
                                                        '+ Create New Requisition List'
                                                    )}
                                                    noItemsCallback={() =>
                                                        setShowRemoveModal(true)
                                                    }
                                                    checkItems={getCheckedItems().map(
                                                        el => el.sku
                                                    )}
                                                    callback={res => {
                                                        let newList =
                                                            res.data
                                                                .createRequisitionList
                                                                .requisitionList[0];
                                                        data.requisitionList.requisitionList.push(
                                                            newList
                                                        );
                                                        itemsActions(
                                                            newList.id
                                                        );
                                                    }}
                                                />
                                            }
                                        />
                                        <ListDropdown
                                            dropdownTitle={t('Copy')}
                                            dropdownHandler={id => {
                                                numberOfCheckedItems()
                                                    ? itemsActions(id, false)
                                                    : setShowRemoveModal(true);
                                            }}
                                            namesArray={
                                                data.requisitionList
                                                    .requisitionList
                                            }
                                            listId={Number(listId)}
                                            preventClosingSelector={
                                                '[role="dialog"]'
                                            }
                                            additionalLink={
                                                <ListForm
                                                    linkTitle={t(
                                                        '+ Create New Requisition List'
                                                    )}
                                                    noItemsCallback={() =>
                                                        setShowRemoveModal(true)
                                                    }
                                                    checkItems={getCheckedItems().map(
                                                        el => el.sku
                                                    )}
                                                    callback={res => {
                                                        let newList =
                                                            res.data
                                                                .createRequisitionList
                                                                .requisitionList[0];
                                                        data.requisitionList.requisitionList.push(
                                                            newList
                                                        );
                                                        itemsActions(
                                                            newList.id,
                                                            false
                                                        );
                                                    }}
                                                />
                                            }
                                        />
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <Alert variant={'warning'}>
                            {props.warningIcon ? (
                                props.warningIcon
                            ) : (
                                <Warning
                                    size={14}
                                    strokeWidth={'4'}
                                    color={'#000'}
                                />
                            )}
                            {t(props.emptyList)}
                        </Alert>
                    )}
                </div>
                <Form onSubmit={updateAllProducts}>
                    {requisitionList.items.length > 0 ? (
                        <div className={'table-wrapper'}>
                            <table className={'requisition-table'}>
                                <caption className="table-caption sr-only">
                                    {t('Requisition Lists')}
                                </caption>
                                {!isMobile ? (
                                    <thead>
                                        <tr>
                                            <th
                                                scope={'col'}
                                                className={'number'}
                                            >
                                                #
                                            </th>
                                            <th
                                                scope={'col'}
                                                className={'item'}
                                            >
                                                {t('Item')}
                                            </th>
                                            <th
                                                scope={'col'}
                                                className={'price'}
                                            >
                                                {t('Price')}
                                            </th>
                                            <th scope={'col'} className={'qty'}>
                                                {t('Qty')}
                                            </th>
                                            <th
                                                scope={'col'}
                                                className={'subtotal'}
                                            >
                                                {t('Subtotal')}
                                            </th>
                                        </tr>
                                    </thead>
                                ) : null}

                                <tbody>
                                    {requisitionList.items.map(
                                        (item, index) => {
                                            return (
                                                <RequisitionItem
                                                    key={index}
                                                    index={index}
                                                    item={item}
                                                    checkedItems={checkedItems}
                                                    setCheckedItems={
                                                        setCheckedItems
                                                    }
                                                    setRemovingSpecificItem={
                                                        setRemovingSpecificItem
                                                    }
                                                    setShowRemoveModal={
                                                        setShowRemoveModal
                                                    }
                                                    editIcon={props.editIcon}
                                                />
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        ''
                    )}

                    <div className={'actions-toolbar'}>
                        {requisitionList.items.length > 0 ? (
                            <>
                                <Button
                                    variant={'primary'}
                                    size={'lg'}
                                    title={t('Add to Cart')}
                                    disabled={!numberOfCheckedItems()}
                                    onClick={() => {
                                        if (
                                            cartState.cart.items &&
                                            cartState.cart.items.length
                                        ) {
                                            setAddToCartModal(true);
                                        } else {
                                            addToCart(false);
                                        }
                                    }}
                                >
                                    {t('Add to Cart')}
                                </Button>

                                <Button
                                    variant={'primary'}
                                    size={'lg'}
                                    type={'submit'}
                                    title={t('Update List')}
                                >
                                    {t('Update List')}
                                </Button>
                            </>
                        ) : (
                            ''
                        )}

                        <Button
                            variant={'primary'}
                            className={'delete-list'}
                            size={'lg'}
                            title={t('Delete Requisition List')}
                            onClick={() => setDeleteListModal(true)}
                        >
                            {t('Delete Requisition List')}
                        </Button>
                    </div>
                </Form>
            </div>
            <Modal
                show={showRemoveModal}
                onHide={() => setShowRemoveModal(false)}
            >
                <Modal.Header>
                    {numberOfCheckedItems() === 0 && !removingSpecificItem ? (
                        <h3>{t('Please Select Product')}</h3>
                    ) : (
                        ''
                    )}
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
                    {numberOfCheckedItems() > 0 || removingSpecificItem
                        ? t(
                              'Are you sure you would like to remove selected items from the requisition list?'
                          )
                        : t('Please select at least one product to proceed.')}
                </Modal.Body>
                <Modal.Footer>
                    {numberOfCheckedItems() > 0 || removingSpecificItem ? (
                        <>
                            <Button
                                size="lg"
                                variant="primary"
                                onClick={() =>
                                    removeItems(removingSpecificItem)
                                }
                            >
                                {t('Delete')}
                            </Button>
                            <Button
                                size="lg"
                                variant="primary"
                                onClick={() => setShowRemoveModal(false)}
                            >
                                {t('Cancel')}
                            </Button>
                        </>
                    ) : (
                        ''
                    )}

                    {numberOfCheckedItems() === 0 && !removingSpecificItem ? (
                        <Button
                            size="lg"
                            variant="primary"
                            onClick={() => setShowRemoveModal(false)}
                        >
                            {t('Ok')}
                        </Button>
                    ) : (
                        ''
                    )}
                </Modal.Footer>
            </Modal>

            <Modal
                show={deleteListModal}
                onHide={() => setDeleteListModal(false)}
            >
                <Modal.Header>
                    <h3>{t('Delete Requisition List?')}</h3>
                    <button
                        type="button"
                        className="close"
                        onClick={() => setDeleteListModal(false)}
                    >
                        <span aria-hidden="true">
                            <ErrorIcon color={'#000'} />
                        </span>
                        <span className="sr-only">{t('Close')}</span>
                    </button>
                </Modal.Header>

                <Modal.Body>
                    {t(
                        `Are you sure you want to delete "${requisitionList.name}" list? This action cannot be undone.`
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={removeRequisitionList}
                    >
                        {t('Delete')}
                    </Button>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => setDeleteListModal(false)}
                    >
                        {t('Cancel')}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={addToCartModal}
                onHide={() => setAddToCartModal(false)}
            >
                <Modal.Header>
                    <h3>{t("The shopping cart isn't empty")}</h3>
                    <button
                        type="button"
                        className="close"
                        onClick={() => setAddToCartModal(false)}
                    >
                        <span aria-hidden="true">
                            <ErrorIcon color={'#000'} />
                        </span>
                        <span className="sr-only">{t('Close')}</span>
                    </button>
                </Modal.Header>

                <Modal.Body>
                    <p>
                        {t(
                            `You have items in your shopping cart. Would you like to merge items in this order with items of this shopping cart or replace them?`
                        )}
                    </p>
                    <p>{t(`Select Cancel to stay on the current page.`)}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => addToCart(true)}
                    >
                        {t('Merge')}
                    </Button>
                    <Button
                        size="lg"
                        variant="primary"
                        onClick={() => addToCart(false)}
                    >
                        {t('Replace')}
                    </Button>
                    <Link
                        to={'#'}
                        onClick={e => {
                            e.preventDefault();
                            setAddToCartModal(false);
                        }}
                    >
                        <button>{t('Cancel')}</button>
                    </Link>
                </Modal.Footer>
            </Modal>
        </>
    );
};

RequisitionItems.propTypes = {
    emptyList: PropTypes.string,
    addedItem: PropTypes.string,
    movedItem: PropTypes.string,
    copiedItem: PropTypes.string,
    successfullyUpdated: PropTypes.string,
    successfullyAdded: PropTypes.string,
    removedItemAlert: PropTypes.string
};

RequisitionItems.defaultProps = {
    emptyList: 'You have no items in your requisition list.',
    addedItem: 'Item was successfully added!',
    movedItem: '%1 item(s) were moved to %2.',
    copiedItem: '%1 item(s) were copied to %2.',
    successfullyUpdated: 'Requisition list was successfully updated!',
    successfullyAdded: 'Items were successfully added to your cart!',
    removedItemAlert: 'Items were successfully removed!'
};
