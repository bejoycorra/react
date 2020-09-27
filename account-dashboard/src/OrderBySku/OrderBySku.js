import { CartStore } from '@corratech/context-provider';
import { Field as FormikField, FieldArray, Form, Formik, getIn } from 'formik';
import Papa from 'papaparse';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from 'react-apollo';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useWindowSize } from '@magento/peregrine';
import { Field } from '@corratech/form-components';
import MUTATION_ORDER_BY_SKU from './graphql/MUTATION_ORDER_BY_SKU';
import { Link } from 'react-router-dom';
import { useTitle } from 'react-use';
import classNames from 'classnames/bind';
import style from '@corratech/form-components/Message/Message.less';
import { Plus, X as CloseIcon } from 'react-feather';
import './OrderBySku.less';

const Input = ({ field, form: { errors }, label, index, isFile, ...rest }) => {
    const errorMessage = getIn(errors, field.name);
    let examineClasses = classNames.bind(style);
    const className =
        errorMessage && !isFile
            ? examineClasses('order-by-sku-fields field-required')
            : examineClasses('order-by-sku-fields');

    return (
        <div className={className}>
            <Field
                label={index === 0 && label}
                className={`order-by-sku-field-${label}`}
                required={true}
                enableError={false}
            >
                <input {...field} {...rest} />
                {/*
                !isFile has to be used, there is no easy way to conditionally validate the file field
                using yup schema when order by SKU is submitted using a file.
                The following condition will make sure that form fields will not display
                error when a file is submitted.
                */}
                {errorMessage && !isFile && (
                    <div className={'message-root'}>
                        <span className={'root_error'}>{errorMessage}</span>
                    </div>
                )}
            </Field>
        </div>
    );
};

export const OrderBySku = () => {
    const [t] = useTranslation();
    const { cartState, dispatch } = React.useContext(CartStore);
    const [isFile, setIsFile] = useState(false);
    const [fileSubmissionErrors, setFileSubmissionErrors] = useState([]);
    const windowSize = useWindowSize();
    const isMobile = windowSize.innerWidth <= 767;
    const [mutationErrorState, setMutationErrorState] = useState(null);
    const [mutationSuccessMessage, setMutationSuccessMessage] = useState(null);
    const [
        mutationFailedItemsMessage,
        setMutationFailedItemsMessage
    ] = useState(null);

    const inputFile = useRef(null);
    let cartItemsCount = 0;
    let failedItemsCount = 0;
    let addedItemsCount = 0;

    useTitle(t('Order By SKU'));
    const [
        addProductsToCart,
        { loading: removeLoading, error: mutationError }
    ] = useMutation(MUTATION_ORDER_BY_SKU, {
        //on successful completion:
        onCompleted: res => {
            //copy locally stored cart from context provider
            const updatedCart = cartState.cart;
            //update fields on the copied cart based on results of mutation's query
            updatedCart.items = res.orderBySku.cart.items;
            updatedCart.prices = res.orderBySku.cart.prices;
            //use the dispatch from cartstore to open the minicart and set the stored cart to the updated cart

            failedItemsCount = res.orderBySku.failed_items.length;
            addedItemsCount = res.orderBySku.added_count;

            if (0 !== addedItemsCount) {
                let message = 'You have added an item to Cart';
                dispatch({
                    type: 'SHOULD_OPEN_DRAWER',
                    shouldOpenDrawer: true
                });

                dispatch({
                    type: 'SET_CART',
                    cart: updatedCart
                });

                if (addedItemsCount > 1) {
                    message =
                        'You have added ' + addedItemsCount + ' items to Cart';
                }

                setMutationSuccessMessage(message);
            } else {
                setMutationSuccessMessage(null);
            }

            if (failedItemsCount > 1) {
                setMutationFailedItemsMessage(
                    failedItemsCount + ' Products in Cart needs attention!'
                );
            } else if (0 !== failedItemsCount) {
                setMutationFailedItemsMessage(
                    'A Product in Cart needs attention!'
                );
            } else {
                setMutationFailedItemsMessage(null);
            }
        }
    });

    // casting mutationError into mutationErrorState in useEffect to be able to reset it on formReset()
    useEffect(() => {
        if (mutationError) {
            setMutationErrorState(mutationError);
        }
    }, [mutationError]);

    const handleSubmit = (values, { resetForm, setSubmitting }) => {
        // initializing cart items to use later in mutation
        let cartItems = [];

        // 1. first get data from form fields if present
        if (values.products[0].sku) {
            cartItems = values.products.map(item => {
                if (item.sku && item.qty) {
                    return {
                        data: {
                            sku: item.sku,
                            quantity: item.qty
                        }
                    };
                }
            });
        }

        cartItems = cartItems.filter(function(element) {
            return element !== undefined;
        });

        // 2. append data from file if present
        if (values.file) {
            Papa.parse(values.file, {
                header: true,
                skipEmptyLines: true,
                transformHeader: header => header.toLowerCase(),
                complete: results => {
                    if (results.errors.length > 0) {
                        setSubmitting(false);
                        const errorMessages = results.errors.map(
                            errorItem => errorItem.message
                        );
                        setFileSubmissionErrors([
                            ...fileSubmissionErrors,
                            ...errorMessages
                        ]);
                    }
                    let fileCartItems = results.data.map(item => {
                        const itemKeys = Object.keys(item);
                        if (
                            !itemKeys.includes('sku') &&
                            !itemKeys.includes('qty')
                        ) {
                            setSubmitting(false);
                            setFileSubmissionErrors([
                                "There is no 'sku' and 'qty' column in the file"
                            ]);
                        } else if (!itemKeys.includes('sku')) {
                            setSubmitting(false);
                            setFileSubmissionErrors([
                                "There is no 'sku' column in the file"
                            ]);
                        } else if (!itemKeys.includes('qty')) {
                            setSubmitting(false);
                            setFileSubmissionErrors([
                                "There is no 'qty' column in the file"
                            ]);
                        } else if (
                            itemKeys.includes('qty') &&
                            isNaN(item.qty)
                        ) {
                            setSubmitting(false);
                            setFileSubmissionErrors([
                                'Please enter a valid number for quantity'
                            ]);
                        }

                        if (item.sku && item.qty) {
                            return {
                                data: {
                                    sku: item.sku,
                                    quantity: parseFloat(item.qty)
                                }
                            };
                        }
                    });

                    fileCartItems = fileCartItems.filter(function(element) {
                        return element !== undefined;
                    });

                    cartItems = [...cartItems, ...fileCartItems];

                    addProductsToCart({
                        variables: {
                            input: {
                                cart_id: cartState.cartId,
                                cart_items: cartItems
                            }
                        }
                    })
                        .then(res => {
                            if (res) {
                                inputFile.current.value = null;
                                resetForm();
                                setIsFile(false);
                            }
                        })
                        .catch(res => {
                            console.log(res);
                            setSubmitting();
                        });
                }
            });

            return;
        }

        addProductsToCart({
            variables: {
                input: {
                    cart_id: cartState.cartId,
                    cart_items: cartItems
                }
            }
        })
            .then(res => {
                if (res) {
                    resetForm();
                    setIsFile(false);
                }
            })
            .catch(res => {
                setSubmitting();
                console.log(res);
            });
    };

    return (
        <>
            <h1>{t(`Order by SKU`)}</h1>
            {mutationSuccessMessage && (
                <div className="order-by-sku-mutation-sucess">
                    <div>{mutationSuccessMessage}</div>
                </div>
            )}
            {mutationErrorState && fileSubmissionErrors.length === 0 && (
                <div className="order-by-sku-mutation-error">
                    <div>
                        {t(
                            `We are encountered error while processing your request.`
                        )}
                        <br />
                        {t(
                            `Please contact the site administrator providing with data you are trying to submit and the following error message`
                        )}
                        :
                    </div>
                    <br />
                    <div>{`${mutationError.message
                        .replace('GraphQL error:', '')
                        .trim()}`}</div>
                </div>
            )}

            {mutationFailedItemsMessage && (
                <div className="order-by-sku-mutation-error failed-items-notice">
                    <div>
                        {mutationFailedItemsMessage}{' '}
                        <Link to={'/my-cart'} title={t('Review Cart')}>
                            {t('Review Cart')}
                        </Link>{' '}
                    </div>
                </div>
            )}

            <Formik
                initialValues={{
                    products: [{ sku: '', qty: '' }],
                    file: null
                }}
                validate={values => {
                    const errors = {};
                    const products = [];

                    if (!values.file) {
                        values.products.map((item, index) => {
                            if (index === 0) {
                                if (item.sku === '' && item.qty === '') {
                                    products[index] = {
                                        sku: 'Please enter a valid SKU key.',
                                        qty: 'Please enter a valid number.'
                                    };
                                }
                            }
                            if (item.sku === '' && item.qty !== '') {
                                products[index] = {
                                    sku: 'Please enter a valid SKU key.'
                                };
                            } else if (item.sku !== '' && item.qty === '') {
                                products[index] = {
                                    qty: 'Please enter a valid number.'
                                };
                            }

                            if (
                                values.products[0].sku === '' &&
                                values.products[0].qty === ''
                            ) {
                                if (index > 0) {
                                    if (item.sku === '' && item.qty === '') {
                                        products[index] = {
                                            sku:
                                                'Please enter a valid SKU key.',
                                            qty: 'Please enter a valid number.'
                                        };
                                    }
                                }
                            }

                            if (item.qty !== '' && item.qty <= 0) {
                                products[index] = {
                                    qty:
                                        'Please enter a number greater than 0 in this field.'
                                };
                            }
                        });

                        if (products.length) {
                            errors['products'] = products;
                        }
                    }

                    setMutationErrorState(null);
                    setFileSubmissionErrors([]);

                    return errors;
                }}
                onSubmit={handleSubmit}
            >
                {({
                    values,
                    errors,
                    setFieldValue,
                    resetForm,
                    isSubmitting,
                    isValid
                }) => (
                    <Form noValidate>
                        <FieldArray name="products">
                            {({ push, remove }) => (
                                <div>
                                    {values.products.map((_, index) => {
                                        return (
                                            <div
                                                className={`order-by-sku-row`}
                                                key={index}
                                            >
                                                <FormikField
                                                    name={`products[${index}].sku`}
                                                    component={Input}
                                                    type="text"
                                                    label="SKU"
                                                    id="sku"
                                                    index={index}
                                                    isFile={isFile}
                                                />

                                                <FormikField
                                                    name={`products[${index}].qty`}
                                                    component={Input}
                                                    type="number"
                                                    label="QTY"
                                                    id="qty"
                                                    index={index}
                                                    isFile={isFile}
                                                />
                                                <div className="order-by-sku-remove-button-container">
                                                    {index !== 0 && (
                                                        <Link
                                                            to={'#'}
                                                            onClick={() =>
                                                                remove(index)
                                                            }
                                                            title={t(
                                                                `Remove Row`
                                                            )}
                                                        >
                                                            {!isMobile ? (
                                                                t(
                                                                `Remove Row`
                                                                )
                                                            ) : (
                                                                <CloseIcon color="#393838" />
                                                            )}
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    <Link
                                        className="add-row"
                                        to={'#'}
                                        onClick={() =>
                                            push({ sku: '', qty: '' })
                                        }
                                        title={t(`Add Row`)}
                                    >
                                        <Plus color="#393838" />
                                    </Link>
                                </div>
                            )}
                        </FieldArray>
                        <div className={'file-section'}>
                            <Field
                                label={t('File')}
                                className="order-by-sku-form-group"
                                enableError={false}
                            >
                                <div className={'field upload skus'}>
                                    <input
                                        id="customer_sku_csv"
                                        ref={inputFile}
                                        name="sku_file"
                                        type="file"
                                        onClick={() => {
                                            inputFile.current.value = null;
                                            setMutationErrorState(null);
                                            setFileSubmissionErrors([]);
                                            resetForm();
                                            setIsFile(false);
                                        }}
                                        onChange={event => {
                                            setIsFile(true);
                                            setFieldValue(
                                                'file',
                                                event.currentTarget.files[0]
                                            );
                                        }}
                                        accept=".csv"
                                    />
                                    {fileSubmissionErrors.length > 0 &&
                                        fileSubmissionErrors.map(
                                            (errorItem, idx) => (
                                                <div
                                                    key={idx}
                                                    className={'message-root'}
                                                >
                                                    <span
                                                        className={'root_error'}
                                                    >
                                                        {errorItem}
                                                    </span>
                                                </div>
                                            )
                                        )}
                                </div>
                            </Field>
                            <div className={'reset-btn'}>
                                <Link
                                    to={'#'}
                                    title={t('Reset')}
                                    className={'links'}
                                    onClick={() => {
                                        inputFile.current.value = null;
                                        setMutationErrorState(null);
                                        setMutationFailedItemsMessage(null);
                                        setMutationSuccessMessage(null);
                                        setFileSubmissionErrors([]);
                                        resetForm();
                                        setIsFile(false);
                                    }}
                                >
                                    {t('Reset')}
                                </Link>
                            </div>
                        </div>
                        <div className="note">
                            <p>{t(`File extensions allowed: .csv`)}</p>
                            <p>
                                {t(
                                    `Your csv file must include "sku" and "qty" columns.`
                                )}
                            </p>
                        </div>
                        <div className={'actions-bar'}>
                            <Button
                                size="lg"
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting && removeLoading}
                            >
                                {t(`Submit`)}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </>
    );
};
