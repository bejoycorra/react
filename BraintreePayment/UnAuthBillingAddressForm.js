import { useTranslation } from 'react-i18next';
import React, { useContext, useState, Suspense } from 'react';
import { CartStore, LoaderStore } from '@corratech/context-provider';
import setBillingAddressOnCart from '../../graphql/setBillingAddressOnCart.graphql';
import { Checkbox } from '@corratech/form-components';
import { AddressBlock } from '../../AddressBlock';
import { AddressForm } from '../../forms/AddressForm';
import { useMutation } from 'react-apollo';

export const UnAuthBillingAddressForm = props => {
    const [t] = useTranslation();
    const { cartState, dispatch } = useContext(CartStore);
    const LoadingIndicator = useContext(LoaderStore);
    const [editingBilling, setEditingBilling] = useState(false);

    const AddressValidationModal = props.addressValidationName === 'taxjar' ?
        React.lazy(() => import('@corratech/address-validation/Taxjar/AddressValidationModal')
            .then(module => ({ default: module.AddressValidationModal }))) : null;

    const [setBillingAddress, { loading }] = useMutation(
        setBillingAddressOnCart,
        {
            variables: {
                cartId: cartState.cartId
            },
            onCompleted: res => {
                dispatch({
                    type: 'SET_CART',
                    cart: res.setBillingAddressOnCart.cart
                });
                setEditingBilling(false);
            }
        }
    );

    const handleSameBillingAndShippingOnChange = () => {
        if (cartState.cart.isBillingSameAsShipping) {
            setEditingBilling(true);
        }
        if (!cartState.cart.isBillingSameAsShipping) {
            setEditingBilling(false);
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
            setBillingAddress({
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
            setBillingAddress(formState);
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
            setBillingAddress(values);
        }
    };

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
                    onChange={() => handleSameBillingAndShippingOnChange()}
                    label={t(`Billing is the same as Shipping`)}
                />
            </div>

            {loading ? (
                <LoadingIndicator />
            ) : (
                <>
                    {!editingBilling && (
                        <AddressBlock
                            address={
                                cartState.cart.isBillingSameAsShipping
                                    ? cartState.cart.shipping_addresses[0]
                                    : cartState.cart.billing_address
                            }
                            onClick={() => {
                                dispatch({
                                    type: 'SET_CART',
                                    cart: {
                                        isBillingSameAsShipping: false
                                    }
                                });
                                setEditingBilling(true);
                            }}
                            action={
                                cartState.cart.isBillingSameAsShipping
                                    ? null
                                    : 'Edit'
                            }
                        />
                    )}

                    {editingBilling && (
                        <AddressForm
                            initialValues={cartState.cart.billing_address}
                            setEditingAddress={setEditingBilling}
                            onFormSubmit={handleSubmit}
                            autoSubmitOff
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
                </>
            )}
        </>
    );
};
