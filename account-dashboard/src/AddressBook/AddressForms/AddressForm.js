import React, { useState, useEffect, useContext, Fragment, Suspense } from 'react';
import { useMutation, useQuery } from 'react-apollo';
import { useTranslation } from 'react-i18next';
import { Form } from 'informed';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import {
    Field,
    TextInput,
    Select,
    Checkbox,
    isRequired,
    combine
} from '@corratech/form-components';
import { LoaderStore } from '@corratech/context-provider';
import {
    addressList,
    updateCustomerAddress,
    getCountry,
    createCustomerAddress
} from '../Queries';
import { useTitle } from 'react-use';
import { useWindowSize } from '@magento/peregrine';
import { AlertContext } from '../../Data/Context/AlertProvider';

import { withRouter } from 'react-router-dom';

const AddressForm = props => {
    const AddressValidationModal = props.addressValidationName === 'taxjar' ?
        React.lazy(() => import('@corratech/address-validation/Taxjar/AddressValidationModal')
            .then(module => ({ default: module.AddressValidationModal }))) : null;

    const [t] = useTranslation();
    const windowSize = useWindowSize();
    const MOBILE_VIEWPORT = 767;
    const isMobile = windowSize.innerWidth <= MOBILE_VIEWPORT;
    const { state, addMessage } = useContext(AlertContext);
    const { loading, error, data, refetch } = useQuery(addressList, {
        fetchPolicy: 'no-cache',
        onCompleted: () => {
            setCustomer(data.customer);
        }
    });
    const {
        loading: loadingCountry,
        error: errorCountry,
        data: countryData
    } = useQuery(getCountry, {
        onCompleted: () => {
            setCountries(countryData.countries);
        }
    });

    const LoadingIndicator = useContext(LoaderStore);
    const [addressLoader, setAddressLoader] = useState(false);
    const [hasRegion, setHasRegion] = useState(true);
    const [regions, setRegions] = useState([]);
    const [countries, setCountries] = useState([]);
    const [customer, setCustomer] = useState(data ? data.customer : null);

    const addressId =
        props.match && props.match.params.id ? props.match.params.id : false;

    let pageTitle = addressId ? t('Edit Address') : t('Add New Address');

    useTitle(pageTitle);

    const selectData = [];
    /**
     * Execute US as region for the first time on load
     */

    useEffect(() => {
        if (customer && countries.length > 0) {
            if (!addressId) {
                getRegionData();
            } else {
                let hasRegionData = getIntialRegionData(
                    getAddressById.country_id
                );
                if (hasRegionData) {
                    getRegionData(hasRegionData);
                } else {
                    setHasRegion(false);
                }
            }
        }
    }, [countries, customer]);

    /**
     * Set the country Data
     * @return {Array}
     */
    const getCountryData = () => {
        countries.map(country => {
            selectData.push({
                label: country.full_name_locale,
                value: country.id
            });
        });
        return selectData;
    };

    const getIntialRegionData = value => {
        let region;

        countries
            ? countries.map(country => {
                  if (country.id === value) {
                      region = country.available_regions;
                  }
              })
            : (region = null);

        return region ? region : false;
    };

    const getRegionData = (regions = getIntialRegionData('US')) => {
        let regionData = [];

        if (regions.length) {
            regionData.push({
                label: t('Please select a region, state or province.'),
                value: ''
            });

            regions.map(region => {
                regionData.push({
                    label: region.name,
                    value: region.id,
                    code: region.code
                });
            });
        }

        setHasRegion(true);
        setRegions(regionData);
    };

    /**
     * Temporary setitng Region value as static value for
     * Customer Address
     * TODO : Create dymanic updation of region.
     * @return {{}}
     */
    const values = () => {
        if (addressId) {
            return {
                ...initialValues,
                region: getInitialRegion()
            };
        }

        return initialValues;
    };

    const getInitialRegion = () => {
        let region = '';
        if (addressId) {
            if (initialValues.region.region_id) {
                region = String(initialValues.region.region_id);
            } else {
                region = String(initialValues.region.region);
            }
        }

        return region;
    };
    /**
     * Use mutation method for adding new customer Address
     * Use Update method to bypass the cahce
     * Mutation update DOC
     * #https://www.apollographql.com/docs/react/essentials/mutations/
     */
    const [createCustomerAddressAction] = useMutation(createCustomerAddress, {
        onCompleted: response => {
            refetch().then(() => {
                setAddressLoader(false);

                if (props.updateAddresses) props.updateAddresses();

                addMessage({
                    message: t('You saved the address.'),
                    type: 'success',
                    presist: true
                });

                redirectToPage('/my-account/address');
            });
        },
        onError: error => {
            addMessage({
                message: t('Something went wrong.'),
                type: 'danger'
            });
        }
    });

    const valueOnChange = value => {
        let hasRegionData = getIntialRegionData(value);

        if (hasRegionData) {
            getRegionData(hasRegionData);
        } else {
            setHasRegion(false);
        }
    };

    /**
     * Update Customer Address
     */
    const [updateCustomerAddressAction] = useMutation(updateCustomerAddress, {
        onCompleted: response => {
            refetch().then(() => {
                setAddressLoader(false);

                addMessage({
                    message: t('Address Updated!'),
                    type: 'success',
                    presist: true
                });

                redirectToPage('/my-account/address');
            });
        },
        onError: error => {
            addMessage({
                message: t('Something went wrong.'),
                type: 'danger'
            });
        }
    });

    /**
     * Redirect to Page
     * @param path | string
     */
    const redirectToPage = path => {
        if (path) {
            props.history.push(path);
        }
    };

    const processRegionData = value => {
        if (hasRegion) {
            let { 0: selectedRegion } = regions.filter(region => {
                return region.value == value;
            });

            return {
                region_id: selectedRegion.value,
                region: selectedRegion.label,
                region_code: selectedRegion.code
            };
        } else {
            return {
                region: value
            };
        }
    };

    const [originalAddress, setOriginalAddress] = useState(null);

    const [formState, setFormState] = useState(null);

    const [sentRequest, setSentRequest] = useState(false);

    const selectedCallback = address => {
        if (address && (originalAddress !== address)) {
            SaveForm(
                {
                    ...formState, ...{
                        city: address.city,
                        country_id: address.countryId,
                        postcode: address.postcode,
                        region: {
                            region_code: address.regionCode,
                            region_id: address.regionId
                        },
                        street: [address.street[0]]
                    }
                }
            );
        } else {
            SaveForm(formState);
        }

        setSentRequest(false);
    };

    const cancelCallback = () => {
        setAddressLoader(false);
        setSentRequest(false);
    };

    const SaveForm = async formState => {
        //Set default billing and shipping when no address found
        if (customer.addresses.length === 0) {
            formState.default_billing = true;
            formState.default_shipping = true;
        }

        if (addressId) {
            await updateCustomerAddressAction({
                variables: {
                    id: addressId,
                    input: formState
                }
            });
        } else {
            //Create the customer address
            await createCustomerAddressAction({
                variables: {
                    input: formState
                }
            });
        }
    };

    const handleSubmit = formState => {
        setAddressLoader(true);
        let region = processRegionData(formState.region);
        let state = {...formState, region};

        if (props.addressValidationName === 'taxjar') {
            setFormState(state);

            setOriginalAddress({
                "country": state.country_id,
                "city": state.city,
                "postcode": state.postcode,
                "region": state.region,
                "street0": state.street[0]
            });

            setSentRequest(true);
        } else {
            SaveForm(state);
        }
    };

    if (loading || loadingCountry || !customer) return <LoadingIndicator />;
    if (error || errorCountry)
        return <p>{t('Something wrong happened! Please try again')}</p>;

    const { 0: getAddressById } = customer.addresses.filter(address => {
        return address.id === Number(addressId);
    });

    const initialValues = addressId ? getAddressById : {};

    return (
        <>
            <div
                className={`address-book content-wrapper ${props.className || ''}`}
                css={props.css}
            >
                <div className={'address-header'}>
                    <h1 className={'my-account__page-title'}>
                        {addressId ? t('Edit') : t('Add New')} {t('Address')}
                    </h1>
                </div>
                <div className={'new-address-from'}>
                    <Form initialValues={values()} onSubmit={handleSubmit}>
                        <div className={'contact-inform-section my-account__block'}>
                            <div className="inner-header">
                                <h2 className={'my-account__block-title'}>
                                    {t('Contact Information')}
                                </h2>
                            </div>
                            <Field
                                label={t('First Name')}
                                labelText={'firstname'}
                                required={true}
                            >
                                <TextInput
                                    type={'text'}
                                    field="firstname"
                                    id="firstname"
                                    autoComplete="given-name"
                                    validate={combine([
                                        {
                                            fn: isRequired,
                                            text: t(props.requiredText)
                                        }
                                    ])}
                                    validateOnBlur
                                    initialValue={
                                        getAddressById
                                            ? getAddressById.firstname
                                            : customer.firstname
                                    }
                                />
                            </Field>
                            <Field
                                label={t('Last Name')}
                                labelText={'lastname'}
                                required={true}
                            >
                                <TextInput
                                    type={'text'}
                                    field="lastname"
                                    id="lastname"
                                    autoComplete="last-name"
                                    validate={combine([
                                        {
                                            fn: isRequired,
                                            text: t(props.requiredText)
                                        }
                                    ])}
                                    validateOnBlur
                                    initialValue={
                                        getAddressById
                                            ? getAddressById.lastname
                                            : customer.lastname
                                    }
                                />
                            </Field>
                            <Field label={t('Company')} labelText={'company'}>
                                <TextInput
                                    type={'text'}
                                    field="company"
                                    id="company"
                                    autoComplete="company-name"
                                    validateOnBlur
                                    initialValue={
                                        getAddressById ? getAddressById.company : ''
                                    }
                                />
                            </Field>
                            <Field
                                label={t('Phone Number')}
                                labelText={'telephone'}
                                required={true}
                            >
                                <TextInput
                                    type={'text'}
                                    field="telephone"
                                    id="telephone"
                                    autoComplete="telephone-name"
                                    validate={combine([
                                        {
                                            fn: isRequired,
                                            text: t(props.requiredText)
                                        }
                                    ])}
                                    validateOnBlur
                                    initialValue={
                                        getAddressById
                                            ? getAddressById.telephone
                                            : ''
                                    }
                                />
                            </Field>
                            {!isMobile && (
                                <div className={'submit-btn-form'}>
                                    <Button
                                        size="lg"
                                        variant="primary"
                                        type="submit"
                                        disabled={addressLoader}
                                    >
                                        {!addressLoader
                                            ? t('Save Address')
                                            : t('Saving Address...')}
                                    </Button>
                                </div>
                            )}
                        </div>
                        <div className={'address-inform-section my-account__block'}>
                            <div className="inner-header">
                                <h2 className={'my-account__block-title'}>
                                    {t('Address')}
                                </h2>
                            </div>
                            <Field
                                label={t('Street Address 1')}
                                labelText="street[0]"
                                required={true}
                            >
                                <TextInput
                                    type={'text'}
                                    field="street[0]"
                                    id="street[0]"
                                    autoComplete="street-name"
                                    validate={combine([
                                        {
                                            fn: isRequired,
                                            text: t(props.requiredText)
                                        }
                                    ])}
                                    validateOnBlur
                                    initialValue={
                                        getAddressById
                                            ? getAddressById.street[0]
                                            : ''
                                    }
                                />
                            </Field>
                            <Field
                                label={t('Street Address 2')}
                                labelText="street[1]"
                            >
                                <TextInput
                                    type={'text'}
                                    field="street[1]"
                                    id="street[1]"
                                    autoComplete="street-name"
                                    initialValue={
                                        getAddressById &&
                                        getAddressById.street.length > 1
                                            ? getAddressById.street[1]
                                            : ''
                                    }
                                />
                            </Field>
                            <Field
                                label={t('City')}
                                labelText={'city'}
                                required={true}
                            >
                                <TextInput
                                    type={'text'}
                                    field="city"
                                    id="city"
                                    autoComplete="city-name"
                                    validate={combine([
                                        {
                                            fn: isRequired,
                                            text: t(props.requiredText)
                                        }
                                    ])}
                                    validateOnBlur
                                    initialValue={
                                        getAddressById ? getAddressById.city : ''
                                    }
                                />
                            </Field>
                            {!hasRegion && (
                                <Field
                                    label={t('State/Province')}
                                    labelText={'region'}
                                    required={true}
                                >
                                    <TextInput
                                        type={'text'}
                                        field="region"
                                        id="region"
                                        autoComplete="region-name"
                                        validate={combine([
                                            {
                                                fn: isRequired,
                                                text: t(props.requiredText)
                                            }
                                        ])}
                                        validateOnBlur
                                        initialValue={
                                            getAddressById
                                                ? getAddressById.region.region
                                                : ''
                                        }
                                    />
                                </Field>
                            )}
                            {hasRegion && (
                                <Field
                                    label={t('State/Province')}
                                    labelText={'region'}
                                    required={true}
                                >
                                    <Select
                                        initialValue={getInitialRegion()}
                                        field="region"
                                        id="region"
                                        aria-label={'Region'}
                                        items={regions}
                                        validate={combine([
                                            {
                                                fn: isRequired,
                                                text: t(props.requiredText)
                                            }
                                        ])}
                                    />
                                </Field>
                            )}
                            <Field
                                label={t('Zip/Postal Code')}
                                labelText={'postcode'}
                                required={true}
                            >
                                <TextInput
                                    type={'text'}
                                    field="postcode"
                                    id="postcode"
                                    autoComplete="postcode-name"
                                    validate={combine([
                                        {
                                            fn: isRequired,
                                            text: t(props.requiredText)
                                        }
                                    ])}
                                    validateOnBlur
                                    initialValue={
                                        getAddressById
                                            ? getAddressById.postcode
                                            : ''
                                    }
                                />
                            </Field>
                            <Field
                                label={t('Country')}
                                labelText="country_id"
                                required={true}
                            >
                                <Select
                                    initialValue={
                                        getAddressById
                                            ? getAddressById.country_id
                                            : 'US'
                                    }
                                    onValueChange={valueOnChange}
                                    field="country_id"
                                    id="country_id"
                                    aria-label={t('Country')}
                                    items={getCountryData()}
                                />
                            </Field>
                            {customer.addresses.length > 0 && (
                                <Fragment>
                                    {getAddressById && (
                                        <div className={'default-checkboxes'}>
                                            {!getAddressById.default_billing && (
                                                <Checkbox
                                                    field="default_billing"
                                                    label={t(
                                                        'Use as my default billing address'
                                                    )}
                                                />
                                            )}
                                            {!getAddressById.default_shipping && (
                                                <Checkbox
                                                    field="default_shipping"
                                                    label={t(
                                                        'Use as my default shipping address'
                                                    )}
                                                />
                                            )}
                                        </div>
                                    )}
                                    {!getAddressById && (
                                        <div className={'default-checkboxes'}>
                                            <Checkbox
                                                field="default_billing"
                                                label={t(
                                                    'Use as my default billing address'
                                                )}
                                            />
                                            <Checkbox
                                                field="default_shipping"
                                                label={t(
                                                    'Use as my default shipping address'
                                                )}
                                            />
                                        </div>
                                    )}
                                </Fragment>
                            )}
                        </div>
                        {isMobile && (
                            <div className={'submit-btn-form'}>
                                <Button
                                    size="lg"
                                    variant="primary"
                                    type="submit"
                                    disabled={addressLoader}
                                >
                                    {!addressLoader
                                        ? t('Save Address')
                                        : t('Saving Address...')}
                                </Button>
                            </div>
                        )}
                    </Form>
                </div>
            </div>
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
    );
};

AddressForm.propTypes = {
    updateAddresses: PropTypes.func,
    requiredText: PropTypes.string
};

AddressForm.defaultProps = {
    requiredText: 'This is a required field'
};

export default withRouter(AddressForm);
