import React, { useContext, useEffect, useState } from 'react';
import { string, object, array, func, bool } from 'prop-types';
import { SignedInDropDown, SlideSteps } from '../';
import { isSignedIn, useAuth, OverlayStore } from '@corratech/context-provider';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import './AccountForm.less';
import { AccountFormLink } from './AccountFormLink';

export const AccountForm = props => {
    const [t] = useTranslation();

    const {
        css,
        className,
        myAccountLinksConfig,
        termsAndConditionsHandle,
        displayLabelSignedUser,
        displayLabelGuestUser,
        hideLinkAfterLoggedIn,
        AccountIcon,
        SuccessIcon,
        ErrorIcon,
        showKeepMeSignedIn,
        showSubTitle
    } = props;

    const { overlayDispatch } = useContext(OverlayStore);

    const {
        authState: { token, showAccountDrawer } = {},
        setIsAccountDrawerOpen
    } = useAuth();

    const accountFormClasses = classNames('account-form', className);

    const [isOpenDropdown, setIsOpenDropdown] = useState(false);

    const [hideForm, setHideForm] = useState(false);

    const toggleSidebarClick = event => {
        if (event) event.preventDefault();
        setIsAccountDrawerOpen(!showAccountDrawer);
    };

    const toggleDropdownClick = event => {
        if (event) event.preventDefault();
    };

    useEffect(() => {
        if (isSignedIn()) {
            overlayDispatch({ type: 'HIDE' });

            if (hideLinkAfterLoggedIn) {
                setHideForm(true);
            }
        }
    }, [isSignedIn(), token]);

    if (hideForm) {
        return null;
    }

    return isSignedIn() ? (
        <div
            className={accountFormClasses + ' signin'}
            css={css}
            onMouseOver={() => setIsOpenDropdown(true)}
            onFocus={() => setIsOpenDropdown(true)}
            onMouseLeave={() => setIsOpenDropdown(false)}
            onBlur={() => setIsOpenDropdown(false)}
        >
            <AccountFormLink
                setIsAccountDrawerOpen={setIsAccountDrawerOpen}
                toggleDropdownClick={toggleDropdownClick}
                toggleSidebarClick={toggleSidebarClick}
                setIsOpenDropdown={setIsOpenDropdown}
                displayLabelSignedUser={displayLabelSignedUser}
                displayLabelGuestUser={displayLabelGuestUser}
                token={token}
                AccountIcon={AccountIcon}
            />
            <SignedInDropDown
                openDropdown={isOpenDropdown}
                myAccountLinks={myAccountLinksConfig}
            />
        </div>
    ) : (
        <div className={accountFormClasses} css={css}>
            <AccountFormLink
                setIsAccountDrawerOpen={setIsAccountDrawerOpen}
                toggleDropdownClick={toggleDropdownClick}
                toggleSidebarClick={toggleSidebarClick}
                setIsOpenDropdown={setIsOpenDropdown}
                displayLabelSignedUser={displayLabelSignedUser}
                displayLabelGuestUser={displayLabelGuestUser}
                token={token}
                AccountIcon={AccountIcon}
            />
            <SlideSteps
                setIsOpenSidebar={setIsAccountDrawerOpen}
                isOpenSidebar={showAccountDrawer}
                termsAndConditionsHandle={termsAndConditionsHandle}
                SuccessIcon={SuccessIcon}
                ErrorIcon={ErrorIcon}
                submitButtonText={props.submitButtonText}
                showKeepMeSignedIn={showKeepMeSignedIn}
                showSubTitle={showSubTitle}
                newsletterSubscriptionHandle={
                    props.newsletterSubscriptionHandle
                }
            />
        </div>
    );
};

AccountForm.defaultProps = {
    displayLabelSignedUser: 'Account',
    displayLabelGuestUser: 'Account',
    hideLinkAfterLoggedIn: false,
    submitButtonText: 'Create Account',
    showKeepMeSignedIn: false,
    showSubTitle: false
};

AccountForm.propTypes = {
    className: string,
    css: object,
    myAccountLinksConfig: array,
    termsAndConditionsHandle: func,
    displayLabelSignedUser: string,
    displayLabelGuestUser: string,
    hideLinkAfterLoggedIn: bool,
    SuccessIcon: object,
    ErrorIcon: object,
    submitButtonText: string,
    showKeepMeSignedIn: bool,
    showSubTitle: bool
};
