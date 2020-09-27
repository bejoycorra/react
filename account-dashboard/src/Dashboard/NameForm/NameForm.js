import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Edit3 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-apollo';
import './NameForm.less';
import {
    TextInput,
    Field,
    isRequired,
    combine
} from '@corratech/form-components';
import { updateCustomerName as updateCustomerNameQuery } from './Queries';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export const NameForm = props => {
    const [t] = useTranslation();

    const customerData = props.customerData,
        customer = customerData.customer;

    const [isEditing, setIsEditing] = useState(false);
    const [firstname, setFirstname] = useState(
        customerData.customer.firstname || ''
    );
    const [middlename, setMiddlename] = useState(
        customerData.customer.middlename || ''
    );
    const [lastname, setLastname] = useState(
        customerData.customer.lastname || ''
    );

    const [updateCustomerInfo] = useMutation(updateCustomerNameQuery);

    const updateCustomerName = async (firstname, middlename, lastname) => {
        await updateCustomerInfo({
            variables: {
                firstname,
                middlename,
                lastname
            }
        }).then(() => props.changeCallback());
    };

    const { disableInlineEdit } = props;

    const submitForm = event => {
        event.preventDefault();
        updateCustomerName(firstname, middlename ? middlename : '', lastname);
        setIsEditing(false);
    };

    const getCustomerFullName = customer => {
        return `${customer.firstname}${
            customer.middlename ? ' ' + customer.middlename : ''
        } ${customer.lastname}`;
    };

    return (
        <div className={`name-form ${props.className || ''}`} css={props.css}>
            <h2 className={'my-account__block-subtitle'}>
                {t('Contact Information')}
            </h2>

            {!disableInlineEdit ? (
                !isEditing ? (
                    //Display customer info when NOT editing
                    <>
                        <Edit3 size={14} onClick={() => setIsEditing(true)} />
                        <br />
                        <p>{getCustomerFullName(customer)}</p>
                    </>
                ) : (
                    //Display form when editing
                    <>
                        <span onClick={() => setIsEditing(false)}>X</span>
                        <form onSubmit={submitForm}>
                            <Field
                                label={t('First Name')}
                                labelText={'currentname'}
                            >
                                <TextInput
                                    type={'text'}
                                    id="currentname"
                                    field="currentname"
                                    validate={combine([
                                        {
                                            fn: isRequired,
                                            text: t(props.requiredText)
                                        }
                                    ])}
                                    placeholder={t('First Name')}
                                    initialValue={firstname}
                                    validateOnBlur
                                    onChange={event =>
                                        setFirstname(event.target.value)
                                    }
                                />
                            </Field>

                            <Field
                                label={t('Middle Name')}
                                labelText="currentmiddlename"
                            >
                                <TextInput
                                    type={'text'}
                                    field="currentmiddlename"
                                    id="currentmiddlename"
                                    placeholder={t('Middle Name')}
                                    initialValue={middlename}
                                    onChange={event =>
                                        setMiddlename(event.target.value)
                                    }
                                />
                            </Field>

                            <Field
                                label={t('Last Name')}
                                labelText={'currentlastname'}
                            >
                                <TextInput
                                    type={'text'}
                                    field="currentlastname"
                                    id="currentlastname"
                                    placeholder={t('Last Name')}
                                    validate={combine([
                                        {
                                            fn: isRequired,
                                            text: t(props.requiredText)
                                        }
                                    ])}
                                    initialValue={lastname}
                                    validateOnBlur
                                    onChange={event =>
                                        setLastname(event.target.value)
                                    }
                                />
                            </Field>
                            <Button size="lg" variant="primary" type="submit">
                                {t('Confirm')}
                            </Button>
                        </form>
                    </>
                )
            ) : (
                <p>{getCustomerFullName(customer)}</p>
            )}
            <p>{customer.email}</p>
            {props.includeEditLinks ? (
                <div className={'name-form-links my-account__block-actions'}>
                    <Link
                        to={'/my-account/account-information'}
                        title={t('Edit')}
                        className={'edit-link'}
                    >
                        <span>{t('Edit')}</span>
                    </Link>
                    <Link
                        to={'/my-account/account-information/password'}
                        title={t('Change Password')}
                        className={'password-link'}
                    >
                        <span>{t('Change Password')}</span>
                    </Link>
                </div>
            ) : (
                ''
            )}
        </div>
    );
};

NameForm.propTypes = {
    customerData: PropTypes.object.isRequired,
    changeCallback: PropTypes.func,
    disableInlineEdit: PropTypes.bool,
    includeEditLinks: PropTypes.bool,
    requiredText: PropTypes.string
};

NameForm.defaultProps = {
    changeCallback: () => {},
    disableInlineEdit: true,
    includeEditLinks: true,
    requiredText: 'This is a required field'
};
