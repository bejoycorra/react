import React, { useContext, useEffect, useState, Fragment } from 'react';
import PropTypes, { bool, object, string, func } from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CartStore, LoaderStore } from '@corratech/context-provider';
import { useLazyQuery, useMutation } from 'react-apollo';
import Policies from 'ModulesPath/IDme/Policies';
import Info from 'ModulesPath/IDme/Info';
import getIdmeQuery from './queries/getIdmeQuery.graphql';
import removeIdmeGraphql from './queries/removeIdmeVerification.graphql';
import verifyIdmeGraphql from './queries/verifyIdme.graphql';
import {useWindowSize} from "@magento/peregrine";
import {Contact} from "@corratech/contact/src/Contact";

export const IDme = props => {

    const [showInfo, setShowInfo] = useState(false);
    const [t] = useTranslation();
    const { cartState, dispatch } = useContext(CartStore);
    const LoadingIndicator = useContext(LoaderStore);
    const windowSize = useWindowSize();
    const [isVerified, setisVerified] = useState(false);

    const [getIdmeData] = useLazyQuery(getIdmeQuery, {
        fetchPolicy: 'no-cache',
        onCompleted: res => {
            if (res.cart) {
                dispatch({
                    type: 'SET_CART',
                    cart: res.cart
                });
            }

        }
    });

    const [removeIdmeVerification] = useMutation(removeIdmeGraphql, {
        fetchPolicy: 'no-cache',
        onCompleted: res => {
            if (res.cart) {
                dispatch({
                    type: 'SET_CART',
                    cart: res.cart
                });
            }
        }
    });
    const [verifyIdmeGroup, { loading }] = useMutation(verifyIdmeGraphql, {
        fetchPolicy: 'no-cache',
        onCompleted: res => {
            if (res.verifyIdme.cart) {
                dispatch({
                    type: 'SET_CART',
                    cart: res.verifyIdme.cart
                });
            }
        }
    });

    const handleShowInfo = () => {
        setShowInfo(true);
    };
    const removeVerification = () => {
        console.log('Remove-1' + isVerified);

        if (cartState.cartId !== '') {
            /*  getCartData({
                variables: {
                    cartId: cartState.cartId,
                    isSignedIn: !!cartState.cart.authenticated
                }
            });*/
            /*  removeIdmeVerification({
                variables: {
                    cartId: cartState.cartId,
                    isSignedIn: !!cartState.cart.authenticated
                }
            });
            */
        }
        setisVerified(false);
    };
    const verifyIdme = props => {
        //setisVerified(true);
        const top = (windowSize.innerHeight - 780) / 4;
        const left = (windowSize.innerWidth - 750) / 2;
        window.open(
            props.popup_url+"&display=popup",
            '',
            "scrollbars=yes,menubar=no,status=no,location=no,toolbar=no,width=750,height=780,top=" + top + ",left=" + left
        );

        if(!window.isListenerSet) {
            window.addEventListener('message', function (e) {
                var key = e.message ? 'message' : 'data';
                var data = e[key];
                if(typeof data.idmeCode === 'string') {
                    receiveIdmeCode(data.idmeCode);
                }
            }, true);

            function receiveIdmeCode(message) {
                console.log("message-144-->" + JSON.stringify(message));
                if (typeof message === 'string') {

                    verifyIdmeGroup({
                        variables: {
                            cartId: cartState.cartId,
                            idmeCode: message
                        }
                    })
                }
            }
        }
        window.isListenerSet = true;
    };

    let idmeData = '';
    let infoText;
    let verifiedGroup;
    let policies = [];

    useEffect(() => {
        (async () => {
        if (cartState.cartId !== '') {
             getIdmeData({
                variables: {
                    cartId: cartState.cartId,
                    isSignedIn: !!cartState.cart.authenticated
                }
            })

        }
    })();
        }, [cartState.cartId]);

    useEffect(() => {
        if (!isVerified && !!cartState.cart.idme_data) {
            setisVerified(cartState.cart.idme_data[0].verified);
        }
    }, [cartState]);

    if (!cartState.cart.idme_data || loading) return <LoadingIndicator />;

    if(idmeData =='' || !idmeData) {
         idmeData = cartState.cart.idme_data[0];
         infoText = idmeData.aboutText;
         verifiedGroup = idmeData.verifiedGroup;
         policies = idmeData.policies;
    }

    return (
        <div>
            {isVerified && (
                <div>
                    {t(props.verifyCompletedLabel)}{' '}
                    <span>
                        <b>{verifiedGroup}</b>
                    </span>
                </div>
            )}
            {!isVerified && (
                <div>
                    <div>
                        {policies &&
                            <Policies
                                verifyIdme={verifyIdme}
                                policies={policies}
                            />
                        }
                    </div>
                </div>
            )}
            <div>
                <div>
                    <span>
                        {props.lockIconSrc &&
                            <img
                                src={props.lockIconSrc}
                                style={{padding: 5}}
                            />
                        }
                    </span>
                    <span style={{ fontSize: 13 }}>
                        {t(props.verificationByLabel)}
                    </span>
                    <span style={{ fontSize: 13 }}>
                        {' '}
                        <a
                            onClick={handleShowInfo}
                            href="#"
                            style={{ fontSize: 13 }}
                        >
                            {t(props.whatisIDText)}
                        </a>
                    </span>
                    {isVerified && (
                        <span style={{ fontSize: 13 }}>
                            {' '}
                            |{' '}
                            <a
                                onClick={removeVerification}
                                href="#"
                                title={t(props.removeTitleText)}
                                style={{ fontSize: 13 }}
                            >
                                {t(props.removeLabel)}
                            </a>
                        </span>
                    )}
                </div>
                <div>
                    <Info
                        infoText={infoText}
                        show={showInfo}
                        setShow={setShowInfo}
                    />
                </div>
            </div>
        </div>
    );
};

IDme.propTypes = {
    removeTitleText: PropTypes.string,
    whatisIDText: PropTypes.string,
    removeLabel: PropTypes.string,
    verificationByLabel: PropTypes.string,
    lockIconSrc: PropTypes.string,
    verifyCompletedLabel: PropTypes.string,
};

IDme.defaultProps = {
    removeTitleText: 'Remove your verified affiliation',
    whatisIDText: 'What is ID.me?',
    removeLabel: 'Remove',
    verificationByLabel: 'Verification by ID.me',
    lockIconSrc: 'https://s3.amazonaws.com/idme/assets/lock.png',
    verifyCompletedLabel: 'You have completed'
};