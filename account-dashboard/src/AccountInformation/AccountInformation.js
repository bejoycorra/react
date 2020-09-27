import React, { useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChangePassword, ChangePersonalData } from '../../';
import { useMutation, useLazyQuery } from 'react-apollo';
import { LoaderStore } from '@corratech/context-provider';
import getCustomer from '@corratech/account-dashboard/src/Data/Queries/getCustomer.graphql';
import { updateCustomerName as updateCustomerNameQuery } from '../Dashboard/NameForm/Queries';
import { Button, Alert } from 'react-bootstrap';
import { changeCustomerPassword as changePasswordQuery } from '../Dashboard/ChangePassword/Queries';
import { Checkbox, Field } from '@corratech/form-components';
import { Form } from 'informed';
import { RenderApolloError } from '@corratech/render-apollo-error';
import { withRouter } from 'react-router-dom';
import { useTitle } from 'react-use';
import { useWindowSize } from '@magento/peregrine';
import { AlertContext } from '../Data/Context/AlertProvider';

import './AccountInformation.less';

const AccountInformation = props => {
    const [t] = useTranslation();
    const windowSize = useWindowSize();
    const MOBILE_VIEWPORT = 767;
    const isMobile = windowSize.innerWidth <= MOBILE_VIEWPORT;
    const { addMessage } = useContext(AlertContext);
    const LoadingIndicator = useContext(LoaderStore);

    useTitle(t('Account Information'));

    const [
        getCustomerData,
        {
            data: customerData,
            loading: customerDataLoading,
            error: customerDataError
        }
    ] = useLazyQuery(getCustomer, {
        fetchPolicy: 'no-cache',
        onCompleted: () => {
            setCustomerFirstname(customerData.customer.firstname);
            setCustomerMiddlename(
                customerData.customer.middlename
                    ? customerData.customer.middlename
                    : ''
            );
            setCustomerLastname(customerData.customer.lastname);
            setEmailAddress(customerData.customer.email);
        }
    });

    const [
        changeCustomerPassword,
        { loading: changePasswordLoading }
    ] = useMutation(changePasswordQuery, {
        onError: error => {
            addMessage({
                type: 'danger',
                message: t(
                    "The password doesn't match this account. Verify the password and try again."
                )
            });
        }
    });

    useEffect(() => {
        getCustomerData();
    }, []);

    const passwordFlag =
        props.match && props.match.params.flag
            ? props.match.params.flag
            : false;

    const [oldPassword, setOldPassword] = useState(''),
        [newPassword, setNewPassword] = useState(''),
        [confirmPassword, setConfirmPassword] = useState(''),
        [passwordIsStrong, setPasswordIsStrong] = useState(false),
        [emailAddress, setEmailAddress] = useState(false),
        [customerFirstname, setCustomerFirstname] = useState(''),
        [customerNewMiddlename, setCustomerMiddlename] = useState(''),
        [customerLastname, setCustomerLastname] = useState(''),
        [openPasswordForm, setOpenPasswordForm] = useState(
            passwordFlag || false
        ),
        [openEmailChangeForm, setOpenEmailChangeForm] = useState(false);

    const [updateCustomerInfo, { loading: updateMutation }] = useMutation(
        updateCustomerNameQuery,
        {
            onError: error => {
                addMessage({
                    type: 'danger',
                    message: <RenderApolloError error={error} />
                });
            }
        }
    );

    const updateCustomerName = async (
        firstname = customerFirstname,
        middlename = customerNewMiddlename,
        lastname = customerLastname,
        email = emailAddress,
        password = oldPassword
    ) => {
        const variablesNode = {
            firstname,
            middlename,
            lastname
        };
        if (openEmailChangeForm) {
            variablesNode['email'] = email;
            variablesNode['password'] = password;
        }
        await updateCustomerInfo({
            variables: variablesNode
        }).then(async ({ data }) => {
            if (passwordFormIsValid() && openPasswordForm)
                await changePassword();
            if (data && data.updateCustomer) {
                addMessage({
                    type: 'success',
                    message: t('You saved the account information.'),
                    presist: true
                });
                props.history.push('/my-account');
            } else {
                addMessage({
                    type: 'danger',
                    message: t('Something went wrong')
                });
            }
        });
    };

    const submitCustomerForm = () => {
        //Reset the global message while bypass the validation
        addMessage({ message: null });
        updateCustomerName();
    };

    const changePassword = () => {
        changeCustomerPassword({
            variables: {
                currentPassword: oldPassword,
                newPassword
            }
        }).then(() => {
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        });
    };

    const passwordFormIsValid = () => {
        return (
            newPassword !== '' &&
            confirmPassword !== '' &&
            oldPassword !== '' &&
            newPassword === confirmPassword
        );
    };

    const getEmailPasswordTitle = () => {
        let title = 'Change Email';

        if (openPasswordForm && !openEmailChangeForm) {
            title = 'Change Password';
        } else if (openPasswordForm && openEmailChangeForm) {
            title = 'Change Email and Password';
        }

        return title;
    };

    if (customerDataLoading || changePasswordLoading || !customerData) {
        return <LoadingIndicator />;
    }

    if (customerDataError) {
        return <p>{t('Something wrong happened! Please try again')}</p>;
    }

    return (
        <div className={props.className} css={props.css}>
            <h1 className={'account-header'}> {t('Account Information')} </h1>
            <Form
                className={`account-information ${props.className || ''}`}
                onSubmit={submitCustomerForm}
            >
                <div className={'profile-block'}>
                    <h3 className={'section-header'}>
                        {t('Account Information')}
                    </h3>
                    <ChangePersonalData
                        customer={customerData.customer}
                        setCustomerFirstname={setCustomerFirstname}
                        setCustomerMiddlename={setCustomerMiddlename}
                        setCustomerLastname={setCustomerLastname}
                    />
                    <div className={'email-pwrd-wrapper'}>
                        <Checkbox
                            field="change_email"
                            id="change_email"
                            label={<span>{t('Change Email')}</span>}
                            onChange={event => {
                                setOpenEmailChangeForm(event.target.checked);
                            }}
                        />
                    </div>
                    <div className={'email-pwrd-wrapper'}>
                        <Checkbox
                            field="change_password"
                            id="change_password"
                            initialValue={!!openPasswordForm}
                            label={<span>{t('Change Password')}</span>}
                            onChange={event => {
                                setOpenPasswordForm(event.target.checked);
                            }}
                        />
                    </div>
                    {!isMobile && (
                        <div className={'actions-bar'}>
                            <Button
                                type={'submit'}
                                size="lg"
                                variant="primary"
                                disabled={
                                    updateMutation || changePasswordLoading
                                }
                            >
                                {updateMutation || changePasswordLoading
                                    ? t('Saving')
                                    : t('Save')}
                            </Button>
                        </div>
                    )}
                </div>
                {openPasswordForm || openEmailChangeForm ? (
                    <div className={'profile-block'}>
                        <h3 className={'section-header'}>
                            {t(getEmailPasswordTitle())}
                        </h3>
                        <ChangePassword
                            email={customerData.customer.email}
                            passwordRequirements={{ minLength: 5 }}
                            openPasswordForm={openPasswordForm}
                            openEmailChangeForm={openEmailChangeForm}
                            separatedForm={false}
                            callbacks={{
                                setPasswordIsStrong: setPasswordIsStrong,
                                setOldPassword: setOldPassword,
                                setNewPassword: setNewPassword,
                                setConfirmPassword: setConfirmPassword,
                                setEmailAddress: setEmailAddress
                            }}
                        />
                    </div>
                ) : (
                    ''
                )}
                {isMobile && (
                    <div className={'actions-bar'}>
                        <Button
                            type={'submit'}
                            size="lg"
                            variant="primary"
                            disabled={updateMutation || changePasswordLoading}
                        >
                            {updateMutation || changePasswordLoading
                                ? t('Saving')
                                : t('Save')}
                        </Button>
                    </div>
                )}
            </Form>
        </div>
    );
};

export default withRouter(AccountInformation);
