import React, { useContext, useEffect, useState, useRef } from 'react';
import { useQuery, useMutation } from 'react-apollo';
import { useWindowSize, Util } from '@magento/peregrine';
import {
    Check as CheckIcon,
    X as ErrorIcon,
    AlertTriangle as Warning
} from 'react-feather';

import {
    getCustomerWishlist,
    createNewWishlist as createNewWishlistQuery,
    renameWishlist as renameWishlistQuery
} from './Queries';
import { useTranslation } from 'react-i18next';
import { LoaderStore } from '@corratech/context-provider';
import { Button, Modal, Alert } from 'react-bootstrap';
import { Form } from 'informed';
import PropTypes from 'prop-types';
import {
    combine,
    Field,
    isRequired,
    TextInput
} from '@corratech/form-components';
import './Wishlist.less';
import { Link, useParams } from 'react-router-dom';
import { CollapsibleContainer } from '@corratech/collapsible-container';
import { WishlistGrid } from './WishlistGrid';
import { useTitle } from 'react-use';

export const Wishlist = props => {
    // Var declarations

    const [t] = useTranslation();
    const LoadingIndicator = useContext(LoaderStore);
    const windowSize = useWindowSize();
    const MOBILE_VIEWPORT = 767;
    const isMobile = windowSize.innerWidth <= MOBILE_VIEWPORT;
    let wishlistsArray = null;
    let params = useParams();

    const { BrowserPersistence } = Util;
    const storage = new BrowserPersistence();

    const addedItem = params.addedItem,
        passedWishlistId = params.id;

    const errorBlockRef = useRef();

    useTitle('My Wishlist');

    // Loading wish lists

    const renderWishlist = res => {
        if (res.multiple_wishlist.length > 0) {
            let defaultWishlist = res.multiple_wishlist[0];
            if (defaultWishlist.name.toLowerCase() === 'wish list') {
                defaultWishlist.name = 'Wishlist';
            }

            if (!wishlistId) {
                if (passedWishlistId && !isNaN(passedWishlistId)) {
                    setWishlist(
                        res.multiple_wishlist.find(
                            el => el.id == passedWishlistId
                        )
                    );
                    setWishlistId(passedWishlistId);
                } else if (!passedWishlistId || isNaN(passedWishlistId)) {
                    setWishlist(defaultWishlist);
                    setWishlistId(defaultWishlist.id);
                }

                if (isNaN(passedWishlistId)) {
                    setErrorAlert(storage.getItem('wishlistError'));
                    storage.setItem('wishlistError', '');
                }

                setDefaultListId(defaultWishlist.id);
            } else {
                setWishlist(
                    res.multiple_wishlist.find(el => el.id == wishlistId)
                );
            }
        }
    };

    const {
        loading: loadingWishlist,
        error: errorWishlist,
        data: wishlistData,
        refetch: refetchWishlists
    } = useQuery(getCustomerWishlist, {
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        onCompleted: res => {
            renderWishlist(res);
        }
    });

    // States

    const [wishlist, setWishlist] = useState(); // active wishlist with its items, id, name
    const [wishlistId, setWishlistId] = useState(); // active wishlistId, its changing triggers setting new wishlist
    const [showCreateModal, setShowCreateModal] = useState(false); // modal for 'create new wishlist'
    const [successfulAlerts, setSuccessfulAlerts] = useState(
        addedItem && !(passedWishlistId && isNaN(passedWishlistId))
            ? [t('Item was successfully added!')]
            : []
    ); // array of successful alerts
    const [errorAlert, setErrorAlert] = useState();
    const [mutationError, setMutationError] = useState(false);
    const [defaultListId, setDefaultListId] = useState(0); // for coming back to default wishlist
    const [productAction, setProductAction] = useState(false); // in case 'Move item' is selected
    const [editWishlist, setEditWishlist] = useState(false);
    const [forceLoading, setForceLoading] = useState(false);

    // Mutations

    const [createNewWishlist, { error, loading }] = useMutation(
        createNewWishlistQuery
    );

    const [
        renameWishlist,
        { error: errorRenaming, loading: loadingRenaming }
    ] = useMutation(renameWishlistQuery);

    // Effects

    useEffect(() => {
        setWishlist(
            wishlistData && wishlistsArray
                ? wishlistsArray.find(el => el.id == wishlistId)
                : null
        );
    }, [wishlistId]);

    useEffect(() => {
        if (error) {
            setForceLoading(false);
        }
    }, [error]);

    useEffect(() => {
        if (successfulAlerts && successfulAlerts.length) {
            window.scrollTo(0, 0);
        }
    }, [successfulAlerts]);

    useEffect(() => {
        if (mutationError) {
            setMutationError(mutationError);
            window.scrollTo(0, 0);
        }
    }, [mutationError]);

    // Loaders

    if (loadingWishlist || loading || forceLoading) {
        return <LoadingIndicator />;
    }

    if (errorWishlist) {
        return (
            <p>
                {t(
                    'An error occurred while fetching wishlist. Please try again.'
                )}
            </p>
        );
    }

    // Handlers

    wishlistsArray = wishlistData.multiple_wishlist;

    // Create new wish list form
    const submitForm = async formState => {
        setSuccessfulAlerts([]);
        setMutationError(false);
        setShowCreateModal(false);
        let callback;

        if (productAction && productAction.callback) {
            callback = res =>
                productAction.callback(res.data.createWishlist.id);
        }

        if (callback) {
            setForceLoading(true);
        }

        if (!editWishlist) {
            createNewWishlist({
                variables: {
                    name: formState.wishlist_name
                }
            }).then(res => {
                refetchWishlists().then(() => {
                    setWishlistId(res.data.createWishlist.id);
                    if (callback) {
                        callback(res).then(() => {
                            setForceLoading(false);
                            setSuccessfulAlerts([
                                t(props.alertWishlistCreated),
                                ...successfulAlerts
                            ]);
                        });
                    } else {
                        setSuccessfulAlerts([t(props.alertWishlistCreated)]);
                    }
                });
            });
        } else {
            renameWishlist({
                variables: {
                    name: formState.wishlist_name,
                    wishlistId: wishlistId
                }
            }).then(() => {
                refetchWishlists().then(() => {
                    setSuccessfulAlerts([t(props.alertWishlistRenamed)]);
                });
            });

            setEditWishlist(false);
        }
    };

    const topBlock = wishlistsArray.length ? (
        <div className={'wishlists-bar'}>
            {!isMobile ? (
                <>
                    <div className={'toolbar-title'}>{t('Wishlist: ')}</div>
                    <div className={'wishlists-names'}>
                        {wishlistsArray.map(wishlist => {
                            return (
                                <Link
                                    to={`#`}
                                    onClick={e => {
                                        e.preventDefault();
                                        setWishlistId(wishlist.id);
                                    }}
                                    key={wishlist.id}
                                    className={`wishlist-block ${
                                        wishlistId == wishlist.id
                                            ? '-active'
                                            : ''
                                    }`}
                                >
                                    <button>{wishlist.name}</button>
                                </Link>
                            );
                        })}
                    </div>
                    {wishlistsArray.length < props.wishlistsPerCustomerMax ? (
                        <Link
                            to={'#'}
                            className={'create-wishlist-button'}
                            onClick={e => {
                                e.preventDefault();
                                setShowCreateModal(true);
                            }}
                            title={t(props.createNewWishlist)}
                        >
                            <button>{t(props.createNewWishlist)}</button>
                        </Link>
                    ) : (
                        ''
                    )}
                </>
            ) : (
                <CollapsibleContainer
                    title={
                        <div>
                            <span className={'toolbar-title'}>
                                {t(`Wishlist: `)}
                            </span>
                            {wishlist ? wishlist.name : ''}
                        </div>
                    }
                    children={
                        <>
                            {wishlistsArray.map(wishlist => {
                                return wishlistId !== wishlist.id ? (
                                    <Link
                                        to={`#`}
                                        onClick={e => {
                                            e.preventDefault();
                                            setWishlistId(wishlist.id);
                                        }}
                                        key={wishlist.id}
                                        className={`wishlist-block ${
                                            wishlistId === wishlist.id
                                                ? '-active'
                                                : ''
                                        }`}
                                    >
                                        <button>{wishlist.name}</button>
                                    </Link>
                                ) : (
                                    ''
                                );
                            })}
                            <Link
                                to={'#'}
                                className={'create-wishlist-button'}
                                onClick={e => {
                                    e.preventDefault();
                                    setShowCreateModal(true);
                                }}
                                title={t(props.createNewWishlistDropdown)}
                            >
                                <button>
                                    {t(props.createNewWishlistDropdown)}
                                </button>
                            </Link>
                        </>
                    }
                />
            )}
        </div>
    ) : (
        <div className={'empty-wish-list'}>
            <Alert variant={'warning'}>
                {props.warningIcon ? (
                    props.warningIcon
                ) : (
                    <Warning size={14} strokeWidth={'4'} color={'#000'} />
                )}
                {t(props.emptyWishlist)}
            </Alert>
            <Link
                to={'#'}
                className={'create-wishlist-button'}
                onClick={e => {
                    e.preventDefault();
                    setShowCreateModal(true);
                }}
                title={t(props.createNewWishlist)}
            >
                <button>{t(props.createNewWishlist)}</button>
            </Link>
        </div>
    );

    return (
        <div
            className={`wishlist-page ${
                props.className ? props.className : ''
            }`}
            ref={errorBlockRef}
            css={props.css}
        >
            {error ? (
                <>
                    <Alert variant={'danger'}>
                        {props.errorIcon ? (
                            props.errorIcon
                        ) : (
                            <ErrorIcon size={14} color={'#B70020'} />
                        )}
                        {error.graphQLErrors.map(({ message }, i) => (
                            <span key={i}>{message}</span>
                        ))}
                    </Alert>
                </>
            ) : (
                ''
            )}

            {errorAlert ? (
                <>
                    <Alert variant={'danger'}>
                        {props.errorIcon ? (
                            props.errorIcon
                        ) : (
                            <ErrorIcon size={14} color={'#B70020'} />
                        )}
                        {errorAlert.graphQLErrors.map(({ message }, i) => (
                            <span key={i}>{message}</span>
                        ))}
                    </Alert>
                </>
            ) : (
                ''
            )}

            {error || errorAlert ? (
                <Alert variant={'danger'}>
                    {props.errorIcon ? (
                        props.errorIcon
                    ) : (
                        <ErrorIcon size={14} color={'#B70020'} />
                    )}
                    <span>{t(props.errorCreateWishlist)}</span>
                </Alert>
            ) : (
                ''
            )}

            {successfulAlerts.map(el => {
                return (
                    <Alert variant={'success'} key={el}>
                        {props.successIcon ? (
                            props.successIcon
                        ) : (
                            <CheckIcon
                                size={14}
                                strokeWidth={'4'}
                                color={'#000'}
                            />
                        )}
                        {el}
                    </Alert>
                );
            })}

            {mutationError && (
                <Alert variant={'danger'}>
                    {props.errorIcon ? (
                        props.errorIcon
                    ) : (
                        <ErrorIcon size={14} color={'#B70020'} />
                    )}
                    <span>{t(mutationError)}</span>
                </Alert>
            )}

            {wishlistsArray.length > 0 ? (
                <>
                    <WishlistGrid
                        topBlock={topBlock}
                        wishlist={wishlist}
                        setWishlist={setWishlist}
                        wishlistsArray={wishlistsArray}
                        setAlerts={setSuccessfulAlerts}
                        setMutationError={setMutationError}
                        refetch={refetchWishlists}
                        setWishlistId={setWishlistId}
                        renderWishlist={renderWishlist}
                        warningIcon={props.warningIcon}
                        lockIcon={props.lockIcon}
                        editWishlist={setEditWishlist}
                        createNewWishlist={action => {
                            setProductAction({ callback: action });
                            setShowCreateModal(true);
                        }}
                        enableDeleteButton={defaultListId !== wishlistId}
                        crossIcon={props.crossIcon}
                        editIcon={props.editIcon}
                    />
                </>
            ) : (
                topBlock
            )}

            <Modal show={showCreateModal}>
                <Modal.Header>
                    <h3>
                        {editWishlist
                            ? t('Edit Wishlist')
                            : t('Create New Wishlist')}
                    </h3>
                    <button
                        type="button"
                        className="close"
                        onClick={() => {
                            setShowCreateModal(false);
                            setEditWishlist(false);
                        }}
                    >
                        <span aria-hidden="true">
                            <ErrorIcon color={'#000000'} />
                        </span>
                        <span className="sr-only">{t('Close')}</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={submitForm}>
                        <Field
                            label={t('Wishlist Name')}
                            labelText={'wishlist_name'}
                            required={true}
                        >
                            <TextInput
                                type={'text'}
                                field="wishlist_name"
                                id="wishlist_name"
                                validate={combine([
                                    {
                                        fn: isRequired,
                                        text: t(props.requiredText)
                                    }
                                ])}
                                validateOnBlur
                                initialValue={editWishlist ? wishlist.name : ''}
                            />
                        </Field>
                        <Modal.Footer>
                            <Button size="lg" variant="primary" type={'submit'}>
                                {t('Save')}
                            </Button>
                            <Button
                                size="lg"
                                variant="primary"
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditWishlist(false);
                                }}
                            >
                                {t('Cancel')}
                            </Button>
                        </Modal.Footer>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

Wishlist.propTypes = {
    requiredText: PropTypes.string,
    errorCreateWishlist: PropTypes.string,
    createNewWishlist: PropTypes.string,
    createNewWishlistDropdown: PropTypes.string,
    alertWishlistCreated: PropTypes.string,
    wishlistsPerCustomerMax: PropTypes.number,
    alertWishlistRenamed: PropTypes.string,
    emptyWishlist: PropTypes.string
};

Wishlist.defaultProps = {
    requiredText: 'This is a required field',
    errorCreateWishlist: 'Could not create a wishlist.',
    createNewWishlist: 'Create New Wishlist',
    createNewWishlistDropdown: '+ Create new wishlist',
    alertWishlistCreated: 'New wishlist was successfully created!',
    wishlistsPerCustomerMax: 5,
    alertWishlistRenamed: 'Wishlist was successfully renamed!',
    emptyWishlist:
        'You have no wishlist created! Please create a wishlist to proceed'
};
