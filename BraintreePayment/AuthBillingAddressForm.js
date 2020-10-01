import React, { useContext, useState, useEffect, Suspense } from 'react';
import { Checkbox } from '@corratech/form-components';
import { Button } from 'react-bootstrap';
import { AddressBlock } from '../../AddressBlock';
import { AddressForm } from '../../forms/AddressForm';
import { useMutation } from 'react-apollo';
import { CartStore, AuthStore, LoaderStore } from '@corratech/context-provider';
import { useTranslation } from 'react-i18next';
import {
    arrayOfKeysToCompareAddresses,
    isTwoAddressesEqualByArrayOfKeys
} from '../../util/isTwoAddressesEqualByArrayOfKeys';
import setBillingAddressOnCart from '../../graphql/setBillingAddressOnCart.graphql';
import setBillingAddressesFromExisting from '../../graphql/setBillingAddressOnCartFromExisting.graphql';

export const AuthBillingAddressForm = props => {
    const [t] = useTranslation();
    const { cartState, dispatch } = useContext(CartStore);
    const { authState } = useContext(AuthStore);
    const LoadingIndicator = useContext(LoaderStore);

    const AddressValidationModal = props.addressValidationName === 'taxjar' ?
        React.lazy(() => import('@corratech/address-validation/Taxjar/AddressValidationModal')
            .then(module => ({ default: module.AddressValidationModal }))) : null;

    const [editingBilling, setEditingBilling] = useState(false);
    // filteredUserAddresses will set in the useEffect below after removing duplicate addresses
    const [filteredUserAddresses, setFilteredUserAddresses] = useState([]);

    const [
        setBillingAddress,
        { loading: loadingSetBillingAddress }
    ] = useMutation(setBillingAddressOnCart, {
        variables: {
            cartId: cartState.cartId
        },
        onCompleted: res => {
            dispatch({
                type: 'SET_CART',
                cart: {
                    ...res.setBillingAddressOnCart.cart
                }
            });
            setEditingBilling(false);
        }
    });

    const [
        setNewBillingAddress,
        { loading: loadingSetNewBillingAddress }
    ] = useMutation(setBillingAddressOnCart, {
        variables: {
            cartId: cartState.cartId
        },
        onCompleted: res => {
            dispatch({
                type: 'SET_CART',
                cart: {
                    authNewBillingAddress:
                        res.setBillingAddressOnCart.cart.billing_address,
                    ...res.setBillingAddressOnCart.cart
                }
            });
            setEditingBilling(false);
        }
    });

    const [pickAddress, { loading: loadingPickAddress }] = useMutation(
        setBillingAddressesFromExisting,
        {
            variables: {
                cartId: cartState.cartId
            },
            onCompleted: res => {
                dispatch({
                    type: 'SET_CART',
                    cart: {
                        ...res.setBillingAddressOnCart.cart
                    }
                });
            }
        }
    );

    useEffect(() => {
        if (cartState.cart.isBillingSameAsShipping) {
            setBillingAddress({
                variables: {
                    cartId: cartState.cartId,
                    ...cartState.cart.shipping_addresses[0],
                    region: cartState.cart.shipping_addresses[0].region.code,
                    countryCode:
                        cartState.cart.shipping_addresses[0].country.code
                }
            });
        }

        if (
            !cartState.cart.isBillingSameAsShipping &&
            authState.user.addresses.length < 2 &&
            !!!cartState.cart.authNewBillingAddress
        ) {
            setEditingBilling(true);
        }
    }, []);

    useEffect(() => {
        if (!!authState.user.addresses && authState.user.addresses.length > 0) {
            const filteredArr = authState.user.addresses.reduce(
                (acc, current) => {
                    const x = acc.find(item => {
                        return isTwoAddressesEqualByArrayOfKeys(
                            item,
                            current,
                            arrayOfKeysToCompareAddresses,
                            true
                        );
                    });

                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        return acc;
                    }
                },
                []
            );

            setFilteredUserAddresses(filteredArr);
        }
    }, [authState.user]);

    const handleOnChangeSameBillingAndShipping = () => {
        if (
            cartState.cart.isBillingSameAsShipping &&
            authState.user.addresses.length < 2 &&
            !!!cartState.cart.authNewBillingAddress
        ) {
            setEditingBilling(true);
        }

        if (!!cartState.cart.billing_address) {
            if (
                cartState.cart.isBillingSameAsShipping &&
                authState.user.addresses.length < 2 &&
                !!!cartState.cart.authNewBillingAddress
            ) {
                setEditingBilling(true);
            }
        }

        if (!cartState.cart.isBillingSameAsShipping) {
            dispatch({
                type: 'SET_CART',
                cart: {
                    billing_address: null,
                    isBillingSameAsShipping: !cartState.cart
                        .isBillingSameAsShipping
                }
            });
            return;
        }

        dispatch({
            type: 'SET_CART',
            cart: {
                isBillingSameAsShipping: !cartState.cart.isBillingSameAsShipping
            }
        });
    };

    // Address validation originalAddress
    const [originalAddress, setOriginalAddress] = useState(null);

    const [formState, setFormState] = useState(null);

    const [sentRequest, setSentRequest] = useState(false);

    // Address validation selected callback
    const selectedCallback = address => {
        if (address && (originalAddress !== address)) {
            setNewBillingAddress({
                variables: {
                    ...formState.variables,
                    city: address.city,
                    postcode: address.postcode,
                    region: address.regionCode,
                    street1: address.street[0],
                    street: [
                        address.street[0],
                        formState.variables.street[1],
                    ]
                }
            });
        } else {
            setNewBillingAddress(formState);
        }

        setSentRequest(false);
    };

    const cancelCallback = () => {
        setSentRequest(false);
    };

    const handleSubmit = (values) => {
        if (props.addressValidationName === 'taxjar') {
            setFormState(values);

            setOriginalAddress({
                "country": values.variables.countryCode,
                "city": values.variables.city,
                "postcode": values.variables.postcode,
                "region": {
                    "region_code": values.variables.region,
                    "region_id": values.variables.regionId,
                },
                "street0": values.variables.street1
            });

            setSentRequest(true);
        } else {
            setNewBillingAddress(values);
        }
    };

    if (
        loadingPickAddress ||
        loadingSetBillingAddress ||
        loadingSetNewBillingAddress
    )
        return <LoadingIndicator />;

    return (
        <>
            <h2 className={'step-title billing-address-header'}>
                {t('Billing Address')}
            </h2>
            <div className={'billingAddressCheck'}>
                <Checkbox
                    id="same-billing-and-shipping"
                    field="same_billing_and_shipping"
                    fieldState={{
                        value: cartState.cart.isBillingSameAsShipping
                    }}
                    onChange={() => handleOnChangeSameBillingAndShipping()}
                    label={t(`My billing and shipping address are the same.`)}
                />
            </div>

            {cartState.cart.isBillingSameAsShipping ? (
                <AddressBlock address={cartState.cart.shipping_addresses[0]} />
            ) : (
                <>
                    {editingBilling && (
                        <AddressForm
                            initialValues={
                                !!cartState.cart.authNewBillingAddress &&
                                cartState.cart.authNewBillingAddress
                            }
                            onFormSubmit={handleSubmit}
                            setEditingAddress={setEditingBilling}
                            autoSubmitOff
                            authMode
                        />
                    )}

                    <Suspense fallback={''}>
                        {AddressValidationModal &&
                        <AddressValidationModal
                            sentRequest={sentRequest}
                            originalAddress={originalAddress}
                            selectedCallback={selectedCallback}
                            cancelCallback={cancelCallback}
                        />
                        }
                    </Suspense>

                    {!editingBilling && (
                        <>
                            <div className="address-block-group">
                                {filteredUserAddresses.length > 0 &&
                                    filteredUserAddresses.map(
                                        (address, idx) => (
                                            <div
                                                key={idx}
                                                className={`col ${
                                                    isTwoAddressesEqualByArrayOfKeys(
                                                        address,
                                                        !!cartState.cart
                                                            .billing_address
                                                            ? cartState.cart
                                                                  .billing_address
                                                            : {},
                                                        arrayOfKeysToCompareAddresses
                                                    )
                                                        ? 'address-block-active'
                                                        : ''
                                                }`}
                                            >
                                                <AddressBlock
                                                    key={idx}
                                                    address={address}
                                                />
                                                {!isTwoAddressesEqualByArrayOfKeys(
                                                    address,
                                                    !!cartState.cart
                                                        .billing_address
                                                        ? cartState.cart
                                                              .billing_address
                                                        : {},
                                                    arrayOfKeysToCompareAddresses
                                                ) && (
                                                    <Button
                                                        variant="secondary"
                                                        onClick={() => {
                                                            dispatch({
                                                                type:
                                                                    'SET_CART',
                                                                cart: {
                                                                    currentBillingAddressId:
                                                                        address.id
                                                                }
                                                            });
                                                            pickAddress({
                                                                variables: {
                                                                    addressId:
                                                                        address.id
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        {t('Select')}
                                                    </Button>
                                                )}
                                            </div>
                                        )
                                    )}
                                {!!cartState.cart.authNewBillingAddress && (
                                    <div
                                        className={`col ${
                                            isTwoAddressesEqualByArrayOfKeys(
                                                cartState.cart
                                                    .authNewBillingAddress,
                                                !!cartState.cart.billing_address
                                                    ? cartState.cart
                                                          .billing_address
                                                    : {},
                                                arrayOfKeysToCompareAddresses,
                                                true
                                            )
                                                ? 'address-block-active'
                                                : ''
                                        }`}
                                    >
                                        <AddressBlock
                                            address={
                                                cartState.cart
                                                    .authNewBillingAddress
                                            }
                                            onClick={() => {
                                                setEditingBilling(true);
                                            }}
                                            action={t('Edit')}
                                        />
                                        {!isTwoAddressesEqualByArrayOfKeys(
                                            cartState.cart
                                                .authNewBillingAddress,
                                            !!cartState.cart.billing_address
                                                ? cartState.cart.billing_address
                                                : {},
                                            arrayOfKeysToCompareAddresses,
                                            true
                                        ) && (
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    dispatch({
                                                        type: 'SET_CART',
                                                        cart: {
                                                            currentBillingAddressId: 0
                                                        }
                                                    });

                                                    setBillingAddress({
                                                        variables: {
                                                            ...cartState.cart
                                                                .authNewBillingAddress,
                                                            region:
                                                                cartState.cart
                                                                    .authNewBillingAddress
                                                                    .region
                                                                    .code,
                                                            countryCode:
                                                                cartState.cart
                                                                    .authNewBillingAddress
                                                                    .country
                                                                    .code
                                                        }
                                                    });
                                                }}
                                            >
                                                {t('Select')}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                            {editingBilling ? null : !!cartState.cart
                                  .authNewBillingAddress ? null : (
                                <div className="new-address-button-container">
                                    <Button
                                        size="lg"
                                        variant="primary"
                                        onClick={() => setEditingBilling(true)}
                                    >
                                        {t('+ New Address')}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </>
    );
};
