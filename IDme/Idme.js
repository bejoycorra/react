import React, { useContext, useEffect, useState, Fragment } from 'react';
import { bool, object, string, func } from 'prop-types';
import { useTranslation } from 'react-i18next';
import { CartStore, LoaderStore } from '@corratech/context-provider';
import { useLazyQuery, useMutation } from 'react-apollo';
import CartPage from '@corratech/cart/src/CartPage/CartPage';
import Policies from 'ModulesPath/IDme/Policies';
import Info from 'ModulesPath/IDme/Info';
import getIdmeQuery from './queries/getIdmeQuery.graphql';
import removeIdmeGraphql from './queries/removeIdmeVerification.graphql';
import verifyIdmeGraphql from './queries/verifyIdme.graphql';
export const IDme = props => {
    /* const {

    } = props;
*/
    const [showInfo, setShowInfo] = useState(false);
    const [t] = useTranslation();
    const { cartState, dispatch } = useContext(CartStore);
    const LoadingIndicator = useContext(LoaderStore);
    const lock_icon = "https://s3.amazonaws.com/idme/assets/lock.png";
    const [isVerified, setisVerified] = useState(false);
   /* let idme_data = {
        clientId: '2323232',
        verified: true,
        verifiedGroup: 'Nurse',
        lock_icon: 'https://s3.amazonaws.com/idme/assets/lock.png',
        aboutText: 'What is Id.me?',
        infoText:
            'ID.me is an easy way to get verified for out Frontline 5% discount. Once you sign up you will save 5% on every purchase.'
    };
    let policies = [
        {
            img_src: 'https://s3.amazonaws.com/idme/buttons/v3/equal/troop.png',
            name: 'Military',
            popup_url:
                'https://api.id.me/oauth/authorize?client_id=aad384a0d7c0996fe1c7d8f396ed78cf&redirect_uri=https://mcstaging.superatv.com/idme/authorize/verify/&response_type=code&scope=military&display=popup'
        },
        {
            img_src: 'https://s3.amazonaws.com/idme/buttons/v3/equal/nurse.png',
            name: 'Nurse',
            popup_url:
                'https://api.id.me/oauth/authorize?client_id=aad384a0d7c0996fe1c7d8f396ed78cf&redirect_uri=https://mcstaging.superatv.com/idme/authorize/verify/&response_type=code&scope=nurse&display=popup'
        },
        {
            img_src:
                'https://s3.amazonaws.com/idme/buttons/v3/equal/responder.png',
            name: 'Responder',
            popup_url:
                'https://api.id.me/oauth/authorize?client_id=aad384a0d7c0996fe1c7d8f396ed78cf&redirect_uri=https://mcstaging.superatv.com/idme/authorize/verify/&response_type=code&scope=responder&display=popup'
        }
    ];
    idme_data.policies = policies;
   // cartState.idme_data = idme_data;
*/

    const [getIdmeData, { loading }] = useLazyQuery(getIdmeQuery, {
        fetchPolicy: 'no-cache',
        onCompleted: res => {
            if (res.cart) {
                dispatch({
                    type: 'SET_CART',
                    cart: res.cart
                });
            }
            debugger
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
    const [verifyIdmeGroup] = useMutation(verifyIdmeGraphql, {
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

        console.log('Remove-2' + isVerified);
    };
    const verifyIdme = props => {
        setisVerified(true);

        window.open(
            props.popup_url,
            'idme',
            'toolbar=0,status=0,width=548,height=325'
        );

        window.addEventListener('message', function(e) {
            receiveIdmeCode(e.data);
        } , {once:true});

        function receiveIdmeCode(message) {
            console.log("message--" + message);
            if (typeof message === 'string') {

                verifyIdmeGroup({
                    variables: {
                        cartId: cartState.cartId,
                        idmeCode: message
                    }
                })
            }
        }
    };

    //const [policies, setPolicies] = useState([]);
    let idmeData ='';
    let infoText;
    let verifiedGroup;
    //let isVerified;
    let policies;

    useEffect(() => {
        (async () => {
        if (cartState.cartId !== '') {
           await  getIdmeData({
                variables: {
                    cartId: cartState.cartId,
                    isSignedIn: !!cartState.cart.authenticated
                }
            })

        }
    })();
        }, [cartState.cartId]);

    useEffect(() => {
        if (!isVerified) {
            setisVerified(idmeData.verified);
        }
    }, [isVerified]);

    if (!cartState.cart.idme_data) return <LoadingIndicator />;
    if(idmeData =='' || !idmeData) {
        console.log(cartState.cart.idme_data[0]);
         idmeData = cartState.cart.idme_data[0];
         infoText = cartState.cart.idme_data[0].aboutText;
         verifiedGroup = idmeData.verifiedGroup;
         policies =cartState.cart.idme_data[0].policies;
    }
    return (
        <div>
            {isVerified && (
                <div>
                    You have completed{' '}
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
                        {lock_icon &&
                            <img
                                src={lock_icon}
                                style={{padding: 5}}
                            />
                        }
                    </span>
                    <span style={{ fontSize: 13 }}>
                        {t('Verification by ID.me')}
                    </span>
                    <span style={{ fontSize: 13 }}>
                        {' '}
                        <a
                            onClick={handleShowInfo}
                            href="#"
                            style={{ fontSize: 13 }}
                        >
                            {t('What is ID.me?')}
                        </a>
                    </span>
                    {isVerified && (
                        <span style={{ fontSize: 13 }}>
                            {' '}
                            |{' '}
                            <a
                                onClick={removeVerification}
                                href="#"
                                title={t('Remove your verified affiliation')}
                                style={{ fontSize: 13 }}
                            >
                                Remove
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

export default IDme;
