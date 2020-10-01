import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { bool, string, object, array } from 'prop-types';
import { AuthStore, signOut } from '@corratech/context-provider';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Button } from 'react-bootstrap';

export const SignedInDropDown = props => {
    const [t] = useTranslation();

    const { css, className, openDropdown, myAccountLinks } = props;

    const { authState, dispatch } = useContext(AuthStore);

    const accountDropdownClasses = classNames(
        'account-form-dropdown',
        className,
        {
            active: openDropdown
        }
    );

    const welcomeBack = () => {
        if (authState && authState.user.firstname) {
            return (
                <>
                    {t(`Welcome back`)},
                    <br />
                    {authState.user.firstname + '!'}
                </>
            );
        } else {
            return t(`Welcome back`) + '!';
        }
    };

    return (
        <div className={accountDropdownClasses} css={css}>
            <div className={'welcome-message'}>{welcomeBack()}</div>

            <ul className={'dropdown-list'}>
                {Object.keys(myAccountLinks).map((id, index) => {
                    const item = myAccountLinks[id];
                    return (
                        <li key={id}>
                            <Link title={t(item.label)} to={item.link}>
                                {t(item.label)}
                            </Link>
                        </li>
                    );
                })}
                <li>
                    <Button
                        variant={'link'}
                        title={t(`Sign Out`)}
                        to={'#'}
                        onClick={e =>
                            signOut({
                                history: null,
                                dispatch: dispatch
                            })
                        }
                    >
                        {t(`Sign Out`)}
                    </Button>
                </li>
            </ul>
        </div>
    );
};

SignedInDropDown.propTypes = {
    className: string,
    css: object,
    openDropdown: bool,
    myAccountLinks: array.isRequired
};
