import React, { useState, useEffect, useContext, Fragment } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { bool, string, object, func } from 'prop-types';
import { useTranslation } from 'react-i18next';
import queryString from 'query-string';
import {
    LoginForm,
    RegisterForm,
    ForgotPasswordForm,
    ResetPasswordForm,
    ArrowLeft
} from '../';
import { OverlayStore, AuthStore } from '@corratech/context-provider';

import { Button } from 'react-bootstrap';
import classNames from 'classnames';

export const SlideSteps = props => {
    const [t] = useTranslation();

    let location = useLocation();

    let history = useHistory();

    const {
        css,
        className,
        isOpenSidebar,
        setIsOpenSidebar,
        termsAndConditionsHandle,
        SuccessIcon,
        ErrorIcon,
        showKeepMeSignedIn
    } = props;

    const { callbackDispatch, overlayDispatch } = useContext(OverlayStore);

    const [email, setEmail] = useState('');

    const [isEmailAvailable, setIsEmailAvailable] = useState(null);

    const [showLogin, setShowLogin] = useState(false);

    const [showRegister, setShowRegister] = useState(false);

    const [showForgotPassword, setShowForgotPassword] = useState(false);

    const [showResetPassword, setShowResetPassword] = useState(false);

    const [useSearchQuery, setUseSearchQuery] = useState(false);

    const [resetToken, setResetToken] = useState('');

    const { dispatch } = useContext(AuthStore);

    const accountFormStepsClasses = classNames('account-form-steps', {
        open: isOpenSidebar
    });

    useEffect(() => {
        if (isOpenSidebar == false) {
            dispatch({
                type: 'TOGGLE_LOGIN_FORM',
                showLogin: false
            });
        }
        overlayDispatch({ type: isOpenSidebar ? 'SHOW' : 'HIDE' });

        if (!isOpenSidebar) {
            callbackDispatch({
                type: 'PUSH',
                data: () => setIsOpenSidebar(isOpenSidebar)
            });
        }
    }, [isOpenSidebar]);

    useEffect(() => {
        if (
            showLogin ||
            showRegister ||
            showForgotPassword ||
            (showResetPassword && '' === resetToken)
        ) {
            showAvailableForm();
        }
    }, [email]);

    useEffect(() => {
        if (useSearchQuery) {
            setShowForgotPassword(true);

            dispatch({
                type: 'TOGGLE_LOGIN_FORM',
                showLogin: true
            });

            setUseSearchQuery(false);
            history.push('/checkout');
        }
    }, [useSearchQuery, showForgotPassword]);

    useEffect(() => {
        if (location.search) {
            const {
                email,
                token,
                resetpassword,
                forgotpassword
            } = queryString.parse(location.search);

            if (resetpassword && email) {
                setResetToken(token);
                updateEmail(email);
                setIsOpenSidebar(true);

                dispatch({
                    type: 'TOGGLE_LOGIN_FORM',
                    showLogin: true
                });

                setShowResetPassword(true);
            }

            if (email && !resetpassword) {
                setIsOpenSidebar(true);
            }

            if (forgotpassword && email) {
                updateEmail(email);
                setUseSearchQuery(true);
            }
        }
    }, [location.search]);

    const setEmailAvailable = ({ status }) => {
        setIsEmailAvailable(status);

        if (status) {
            setShowRegister(true);
        } else {
            setShowLogin(true);
        }
    };

    const updateEmail = email => {
        setEmail(email);
    };

    const backClick = event => {
        event.preventDefault();
        if (showLogin || showRegister) {
            setShowRegister(false);
            setShowLogin(false);
        }

        if (showForgotPassword) {
            setShowLogin(true);
            setShowForgotPassword(false);
        }

        if (showResetPassword) {
            showAvailableForm();
        }
    };

    const forgotPasswordClick = event => {
        event.preventDefault();
        setShowRegister(false);
        setShowLogin(false);
        setShowForgotPassword(true);
    };

    const signInClick = event => {
        event.preventDefault();
        setShowLogin(true);
        setShowRegister(false);
        setShowForgotPassword(false);
    };

    const showAvailableForm = () => {
        setShowLogin(false);
        setShowRegister(false);
        setShowForgotPassword(false);
        setShowResetPassword(false);
    };

    return (
        <div
            className={accountFormStepsClasses + ' ' + (className || '')}
            css={css}
        >
            <div className={'header'}>
                {(showLogin ||
                    showRegister ||
                    showForgotPassword ||
                    showResetPassword) && (
                    <Button
                        variant="link"
                        className={'return-button'}
                        onClick={backClick}
                    >
                        <ArrowLeft />
                        <span>{t(`Back`)}</span>
                    </Button>
                )}
                <div className={'title'} role="heading" aria-level="2">
                    {showForgotPassword ? (
                        t(`Account`)
                    ) : (
                        <Fragment>
                            <span id="account-login-form-heading">
                                {t(`Sign In `)}
                            </span>
                            <span className="title-divider">/</span>
                            <span id="account-register-form-heading">
                                {t(` Register`)}
                            </span>
                        </Fragment>
                    )}
                </div>
                <Button
                    variant="link"
                    className={'close-sidebar'}
                    onClick={() => setIsOpenSidebar(false)}
                >
                    <span>{t(`Close`)}</span>
                </Button>
            </div>

            {!showRegister && !showForgotPassword && !showResetPassword && (
                <LoginForm
                    updateEmail={updateEmail}
                    setEmailAvailable={setEmailAvailable}
                    enteredEmail={email}
                    forgotPasswordClick={forgotPasswordClick}
                    showLogin={showLogin}
                    showKeepMeSignedIn={showKeepMeSignedIn}
                />
            )}

            {showRegister && (
                <RegisterForm
                    updateEmail={updateEmail}
                    enteredEmail={email}
                    termsAndConditionsHandle={termsAndConditionsHandle}
                    submitButtonText={props.submitButtonText}
                    newsletterSubscriptionHandle={
                        props.newsletterSubscriptionHandle
                    }
                    setIsOpenSidebar={setIsOpenSidebar}
                />
            )}

            {showForgotPassword && (
                <ForgotPasswordForm
                    updateEmail={updateEmail}
                    enteredEmail={email}
                    signInClick={signInClick}
                    SuccessIcon={SuccessIcon}
                    ErrorIcon={ErrorIcon}
                    showSubTitle={props.showSubTitle}
                />
            )}

            {showResetPassword && (
                <ResetPasswordForm
                    resetToken={resetToken}
                    enteredEmail={email}
                    SuccessIcon={SuccessIcon}
                    ErrorIcon={ErrorIcon}
                />
            )}
        </div>
    );
};

SlideSteps.defaultProps = {
    displayLabelSignedUser: 'Account',
    displayLabelGuestUser: 'Account',
    hideLinkAfterLoggedIn: false
};

SlideSteps.propTypes = {
    className: string,
    setIsOpenSidebar: func.isRequired,
    css: object,
    isOpenSidebar: bool,
    termsAndConditionsHandle: func,
    SuccessIcon: object,
    ErrorIcon: object
};
