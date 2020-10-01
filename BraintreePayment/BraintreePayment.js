import React, { useEffect, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { default as braintreeDropin } from 'braintree-web-drop-in';

import { useMutation } from 'react-apollo';
import { useTranslation } from 'react-i18next';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { AuthStore, CartStore, LoaderStore } from '@corratech/context-provider';
import createTokenQuery from './createBraintreeClientToken.graphql';
import setBraintreePaymentMethod from './setBraintreePaymentMethod.graphql';
import setBraintreeApplepayMethod from './setBraintreeApplepayMethod.graphql';
import setIwdApplepayMethod from './setIwdApplepayMethod.graphql';
import setBraintreePaypalMethod from './setBraintreePaypalMethod.graphql';
import { useUpdateEffect } from 'react-use';
import { Checkbox } from '@corratech/form-components';
import { AuthBillingAddressForm } from './AuthBillingAddressForm';
import { UnAuthBillingAddressForm } from './UnAuthBillingAddressForm';
import { CheckoutAgreements } from '../../CheckoutAgreements/CheckoutAgreements';
import placeOrderMutation from '../../graphql/placeOrder.graphql';
import setBillingAddressOnCart from '../../graphql/setBillingAddressOnCart.graphql';
import NewsletterCheckbox from '../../NewsletterCheckbox/NewsletterCheckbox';
import { Info } from 'react-feather';
import { isAddressValid } from '../../util/isAddressValid';
import { RenderAppliedCredits } from '../../RenderAppliedCredits';
import {
    useSetNotification,
    useGlobalOptions
} from '@corratech/context-provider';

const BraintreePayment = (props) => {
    const { dataLayerAction } = props;
    // Check for braintree errors
    const [isShowingEmptyError, setShowingEmptyError] = useState(false);

    // Store reference to the dropinInstance - don't want this to disappear on every state change
    const [dropinInstance, setDropinInstance] = useState(null);

    const [t] = useTranslation();
    const options = useGlobalOptions();
    let displayName = 'Apple Pay Merchant';
    let applepayMethod = '';
    let setBraintreeApplepayPayment = '';

    const { setNotification } = useSetNotification();

    const [buttonState, setButtonState] = useState({
        text: t('Place My Order'),
        disabled: false
    });

    const { cartState, dispatch } = useContext(CartStore);
    const { authState } = useContext(AuthStore);

    const isPaymentMethodAvailable = (methodCode) => {
        return (
            cartState.cart &&
            cartState.cart.available_payment_methods &&
            cartState.cart.available_payment_methods.findIndex(
                (x) => x.code === methodCode
            ) > -1
        );
    };

    // Determines whether or not we should save card for Auth Users
    const [shouldSaveCard, setShouldSaveCard] = useState(
        !!authState.token && authState.token !== ''
    );

    // Mutation to set braintree payment info on the cart
    const [setBraintreePayment] = useMutation(setBraintreePaymentMethod, {
        variables: {
            cartId: cartState.cartId
        }
    });

    // Mutation to set braintree_paypal payment info on the cart
    const [setBraintreePaypalPayment] = useMutation(setBraintreePaypalMethod, {
        variables: {
            cartId: cartState.cartId
        }
    });

    if (isPaymentMethodAvailable('iwd_applepay')) {
        applepayMethod = 'iwd_applepay';
        [setBraintreeApplepayPayment] = useMutation(setIwdApplepayMethod, {
            variables: {
                cartId: cartState.cartId
            }
        });
    } else if (isPaymentMethodAvailable('braintree_applepay')) {
        applepayMethod = 'braintree_applepay';
        [setBraintreeApplepayPayment] = useMutation(
            setBraintreeApplepayMethod,
            {
                variables: {
                    cartId: cartState.cartId
                }
            }
        );
    }

    // Mutation to placeorder
    const [placeOrder] = useMutation(placeOrderMutation, {
        variables: {
            cartId: cartState.cartId
        },
        onCompleted: (res) => {
            if (!!dataLayerAction) {
                dataLayerAction({
                    type: 'PLACE_ORDER',
                    data: {
                        ...cartState,
                        actionField: res
                    }
                });
            }
            dispatch({
                type: 'PLACED_ORDER',
                placedOrder: res
            });
        },
        onError: (res) => {
            setNotification(
                'danger',
                res.message.split('GraphQL error: ')[1],
                5000
            );
            setButtonState({
                text: t('Place My Order'),
                disabled: false
            });
        }
    });

    // Will use this to set Billing address if it is same as shipping address
    const [setBillingAddress, { loading: billingAddressLoading }] = useMutation(
        setBillingAddressOnCart,
        {
            variables: {
                cartId: cartState.cartId
            },
            onCompleted: (res) => {
                dispatch({
                    type: 'SET_CART',
                    cart: res.setBillingAddressOnCart.cart
                });
            }
        }
    );

    // Create the Dropin instance
    const [getBraintreeToken, { data: clientTokenData }] = useMutation(
        createTokenQuery
    );

    let shippingAddressOverride = {};
    const shippingAddress = cartState.cart.shipping_addresses[0];

    shippingAddressOverride.recipientName = shippingAddress.firstname + " " + shippingAddress.lastname;
    shippingAddressOverride.line1 = shippingAddress.street[0];
    shippingAddressOverride.city = shippingAddress.city;
    shippingAddressOverride.countryCode = shippingAddress.country.code;
    shippingAddressOverride.postalCode = shippingAddress.postcode;
    shippingAddressOverride.state = shippingAddress.region.code;

    if(shippingAddress.street[1]){
        shippingAddressOverride.line2 = shippingAddress.street[1]
    }
    if(shippingAddress.telephone){
        shippingAddressOverride.phone = shippingAddress.telephone
    }

    const paypal = {
            flow: 'checkout',
            amount: cartState.cart.prices.grand_total.value,
            currency: cartState.cart.prices.grand_total.currency,
            enableShippingAddress: true,
            shippingAddressEditable: false,
            shippingAddressOverride: shippingAddressOverride
    };

    if (options.storeConfig && options.storeConfig.store_information_name) {
        displayName = options.storeConfig.store_information_name;
    }

    const applepay = {
            displayName: displayName,
            paymentRequest: {
                total: {
                    label: displayName,
                    type: 'final',
                    amount: cartState.cart.prices.grand_total.value
                }
            }
    };

    useEffect(() => {
        (async () => {
            if (!clientTokenData) {
                await getBraintreeToken();
            } else {
                let createBraintreeParams = {
                    authorization: clientTokenData.createBraintreeClientToken,
                    container: '#braintree-dropin-container',
                    card: {
                        overrides: {
                            fields: {
                                number: {
                                    maskInput: {
                                        // Only show the last four digits of the credit card number after focus exits this field.
                                        showLastFour: true
                                    }
                                }
                            }
                        }
                    }
                };

                if (isPaymentMethodAvailable('braintree_paypal')) {
                    createBraintreeParams.paypal = paypal;
                }
                if (isPaymentMethodAvailable(applepayMethod)) {
                    createBraintreeParams.applepay = applepay;
                }

                setDropinInstance(
                    await braintreeDropin.create(createBraintreeParams)
                );
            }
        })();
    }, [clientTokenData]);

    // Set braintree payment method on cart if shouldSave changes
    useUpdateEffect(() => {
        (async () => {
            try {
                if (
                    dropinInstance &&
                    dropinInstance.isPaymentMethodRequestable()
                ) {
                    const paymentNonce = await dropinInstance.requestPaymentMethod();
                    setBraintreePayment({
                        variables: {
                            braintreeNonce: paymentNonce.nonce,
                            storeInVault: shouldSaveCard
                        }
                    }).then((res) => {
                        dispatch({
                            type: 'SET_CART',
                            cart: res.data.setPaymentMethodOnCart.cart
                        });
                    });
                }
            } catch (e) {
                // An error occurred and we have no stored data.
                // BrainTree will update the UI with error messaging,
                // but signal that there was an error.
                console.error(`Invalid Payment Details. \n${e}`);
            }
        })();
    }, [shouldSaveCard]);

    const handlePlaceOrder = () => {
        // if the user wants to place order with the billing address the same as the shipping address
        // otherwise he/she submitted a billing address
        if (cartState.cart.isBillingSameAsShipping) {
            setBillingAddress({
                variables: {
                    cartId: cartState.cartId,
                    ...cartState.cart.shipping_addresses[0],
                    region: cartState.cart.shipping_addresses[0].region.code,
                    countryCode:
                        cartState.cart.shipping_addresses[0].country.code
                }
            })
                .then((res) => {
                    if (res) placeOrder();
                })
                .catch((e) => {
                    console.log('error in setBillingAddress', e);
                    setButtonState({
                        text: t('Place My Order'),
                        disabled: false
                    });
                });
        } else {
            placeOrder();
        }
    };

    return (
        <div>
            <div id="braintree-dropin-container" />
            {!!authState.token && authState.token !== '' ? (
                <div className={'should-save-credit-card'}>
                    <Checkbox
                        field={'should-save-card'}
                        fieldState={{ value: shouldSaveCard }}
                        onChange={() => {
                            setShouldSaveCard(!shouldSaveCard);
                        }}
                        label={t('Save this card for future purchases.')}
                    />
                    <OverlayTrigger
                        placement="top-start"
                        overlay={(props) => (
                            <Tooltip
                                {...props}
                                id={`tooltip-save-cc`}
                                show={props.show.toString()}
                            >
                                {t(
                                    'We store your payment information securely via SSL.'
                                )}
                            </Tooltip>
                        )}
                    >
                        <Info size={16} />
                    </OverlayTrigger>
                </div>
            ) : null}
            {authState.token && authState.token !== '' ? (
                <AuthBillingAddressForm />
            ) : (
                <UnAuthBillingAddressForm />
            )}

            <RenderAppliedCredits />

            {/*<NewsletterCheckbox />*/}
            {isShowingEmptyError && (
                <div class="root_error">
                    <p>
                        {t(
                            'Please enter a valid credit card in the form above.'
                        )}
                    </p>
                </div>
            )}
            <Button
                className={'submit-braintree-method'}
                disabled={
                    buttonState.disabled ||
                    (!cartState.cart.isBillingSameAsShipping &&
                        !isAddressValid(cartState.cart.billing_address))
                }
                onClick={async () => {
                    setButtonState({
                        text: t('Placing order...'),
                        disabled: true
                    });
                    try {
                        if (
                            dropinInstance &&
                            dropinInstance.isPaymentMethodRequestable()
                        ) {
                            setShowingEmptyError(false);
                            const paymentNonce = await dropinInstance.requestPaymentMethod();
                            if (paymentNonce.type === 'PayPalAccount') {
                                setBraintreePaypalPayment({
                                    variables: {
                                        braintreeNonce: paymentNonce.nonce
                                    }
                                }).then((res) => {
                                    if (
                                        res.data.setPaymentMethodOnCart.cart
                                            .selected_payment_method.code ===
                                        'braintree_paypal'
                                    ) {
                                        handlePlaceOrder();
                                    }
                                });
                            } else if (paymentNonce.type === 'ApplePayCard') {
                                setBraintreeApplepayPayment({
                                    variables: {
                                        braintreeNonce: paymentNonce.nonce
                                    }
                                }).then((res) => {
                                    if (
                                        res.data.setPaymentMethodOnCart.cart
                                            .selected_payment_method.code ===
                                        applepayMethod
                                    ) {
                                        handlePlaceOrder();
                                    }
                                });
                            } else {
                                setBraintreePayment({
                                    variables: {
                                        braintreeNonce: paymentNonce.nonce,
                                        storeInVault: shouldSaveCard
                                    }
                                }).then((res) => {
                                    if (
                                        res.data.setPaymentMethodOnCart.cart
                                            .selected_payment_method.code ===
                                        'braintree'
                                    ) {
                                        handlePlaceOrder();
                                    }
                                });
                            }
                        } else {
                            setShowingEmptyError(true);
                            setButtonState({
                                text: t('Place My Order'),
                                disabled: false
                            });
                        }
                    } catch (e) {
                        // An error occurred and we have no stored data.
                        // BrainTree will update the UI with error messaging,
                        // but signal that there was an error.
                        console.error(`Invalid Payment Details. \n${e}`);
                        setButtonState({
                            text: t('Place My Order'),
                            disabled: false
                        });
                    }
                }}
            >
                {buttonState.text}
            </Button>
            <CheckoutAgreements prompt={false} />
        </div>
    );
};

BraintreePayment.propTypes = {
    storeInVault: PropTypes.bool
};

export default BraintreePayment;
