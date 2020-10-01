import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';
import { isSignedIn } from '@corratech/context-provider';

export const AccountFormLink = props => {
    const [t] = useTranslation();

    useEffect(() => {
        props.token
            ? props.setIsAccountDrawerOpen(false)
            : props.setIsOpenDropdown(false);
    }, []);

    return (
        <>
            <span className={'account-form-link'}>
                <Button
                    onClick={
                        isSignedIn()
                            ? props.toggleDropdownClick
                            : props.toggleSidebarClick
                    }
                    variant="link"
                >
                    {props.AccountIcon ? props.AccountIcon : ''}
                    {isSignedIn()
                        ? t(props.displayLabelSignedUser)
                        : t(props.displayLabelGuestUser)}
                </Button>
            </span>
        </>
    );
};

AccountFormLink.propTypes = {
    token: PropTypes.string,
    setIsAccountDrawerOpen: PropTypes.func.isRequired,
    toggleDropdownClick: PropTypes.func.isRequired,
    toggleSidebarClick: PropTypes.func.isRequired,
    setIsOpenDropdown: PropTypes.func.isRequired,
    AccountIcon: PropTypes.element,
    displayLabelGuestUser: PropTypes.string,
    displayLabelSignedUser: PropTypes.string
};

AccountFormLink.defaultProps = {
    token: null,
    AccountIcon: null,
    displayLabelGuestUser: '',
    displayLabelSignedUser: ''
};
