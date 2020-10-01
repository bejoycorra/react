import React, {useState, useContext, useEffect} from 'react';
import {useTitle} from "react-use";
import {useTranslation} from "react-i18next";
import {Link, useParams} from "react-router-dom";
import {useMutation, useQuery} from "react-apollo";
import getRmaItemsWithAttribute from '../Queries/Rma/getRmaFormItemsWithAttribute.graphql';
import createReturnRequest from '../Queries/Rma/createRmaRequest.graphql';
import {LoaderStore} from "@corratech/context-provider";
import { OrderAddress } from "../OrderDetailsPage/OrderAddress";
import {Alert, Button} from "react-bootstrap";
import { Field, Form, Formik, FieldArray } from 'formik';
import {useWindowSize} from "@magento/peregrine";
import {AlertContext} from "@corratech/account-dashboard/src/Data/Context/AlertProvider";
import * as yup from 'yup';
import {Field as CorraField} from "@corratech/checkout/forms/Field";
import { SelectInputFormik, TextInputFormik } from '@corratech/form-components';
import { ReturnOrderInfo} from './ReturnOrderInfo';

export const Returns = props => {
    const { orderId } = useParams();
    const [t] = useTranslation();
    useTitle(t(props.returnsPageTitle));
    const windowSize = useWindowSize();
    const { addMessage } = useContext(AlertContext);
    const isMobile = windowSize.innerWidth <= 767;
    const LoadingIndicator = useContext(LoaderStore);
    const [rmaFinal, setRmaFinal] = useState([]);
    const [totalAvailableQty, setTotalAvailableQty] = useState(0);

    const {
        data: dataRmaItems,
        loading: loadingRmaItems,
        error: errorRmaItems
    } = useQuery(getRmaItemsWithAttribute, {
        fetchPolicy: 'no-cache',
        variables: { orderId: orderId }
    });

    useEffect(() => {
        if (dataRmaItems) {
            let total = 0;
            const returnsData = {
                rmaAttributes: dataRmaItems.getRmaFormAttributes.attributes,
                productItems: dataRmaItems.getRmaFormItems.return_items,
                selectedItem: false,
                selectedQty: 0,
                reason: ''
            }
            setRmaFinal([returnsData]);
            returnsData.productItems.map((value,key) => {
                total += Number(value.available_qty);
            })
            setTotalAvailableQty(total);
        }
    }, [dataRmaItems]);

    const validationSchema = yup.object().shape({
        custom_contact_email: yup
            .string()
            .email(t('Email must be a valid email')),
        products: yup.array()
            .of(
                yup.object().shape({
                    rma_item: yup.string().required('Please select an item'),
                    item_qty: yup.number().required('Please enter valid quantity'),
                    item_resolution: yup.string().required('Please select a resolution'),
                    item_condition: yup.string().required('Please select a condition'),
                    item_reason: yup.string().required('Please select a reason')
                })
            )
            .required('Must have items')
    });

    const [
        submitReturnItems,
        {loading: removeLoading}
    ] = useMutation(createReturnRequest, {
        onCompleted: res => {
            if (null !== res.createRmaRequest.response) {
                addMessage({
                    message: res.createRmaRequest.response,
                    type: 'success',
                    presist: true
                });
            } else {
                addMessage({
                    message: t('Unable to submit your request. Please correct items submitted.'),
                    type: 'danger'
                });
            }
            window.scrollTo({ behavior: 'smooth', top: 0 });
        }
    });

    const handleSubmit = (values, {setSubmitting}) => {
        let returnItems = [];
        values.products.map(item => {
            if (item.rma_item && item.item_qty && item.item_resolution && item.item_condition && item.item_reason) {
                returnItems.push({
                    order_item_id: item.rma_item,
                    qty_requested: item.item_qty,
                    resolution: item.item_resolution,
                    condition: item.item_condition,
                    reason: item.item_reason,
                    reason_other: item.item_reason_other
                });
            }
        });
        submitReturnItems({
            variables: {
                "orderId": orderId,
                "customerCustomEmail": custom_contact_email.value,
                "items": returnItems,
                "rmaComment": rma_comment.value
            }
        });
    }

    const getRmaItemOptions = (rmaItems) => {
        let items = [];
        items = [
            { value: '', label: 'Please select an item'}
        ];
        rmaItems.map(rmaItem => {
            items.push({
                value: rmaItem.order_item_id,
                label: rmaItem.product_name
            });
        });
        return items;
    }

    const getRmaAttributeOptions = (rmaAttributes, code) => {
        let attributes = [];
        attributes = [
            { value: '', label: 'Please select one'}
        ];
        rmaAttributes.map(rmaAttribute => {
            attributes.push({
                value: rmaAttribute.option_id,
                label: rmaAttribute.option_value
            });
        });
        if ('reason' == code) {
            attributes.push({ value: 'other', label: 'Other'});
        }
        return attributes;
    }

    const valueOnChange = (index,value,code) => {
        if ('reason' == code) {
            let tmpData = rmaFinal;
            tmpData[index].reason = value;
            setRmaFinal(tmpData);
        }
    }

    const selectItemChanged = (index,value) => {
        let tmpData = rmaFinal;
        tmpData[index].selectedItem = value;
        setRmaFinal(tmpData);
        let selectQty = selectQtyChanged(index,rmaFinal[index].selectedQty);
        return selectQty > 0 ? selectQty : '';
    }

    const selectQtyChanged = (index,value) => {
        if (value > 0) {
            let tmpData = rmaFinal;
            let result = tmpData[index].productItems.filter(val => val.order_item_id == tmpData[index].selectedItem);
            let remainingQty = tmpData[index].selectedQty;
            if (result[0]) {
                remainingQty = result[0].available_qty;
            }
            rmaFinal.map((value,key) => {
                if (value.selectedItem == tmpData[index].selectedItem && key != index) {
                    remainingQty -= value.selectedQty;
                }
            })
            let finalQty = remainingQty >= value ? value : remainingQty;
            tmpData[index].selectedQty = finalQty;
            setRmaFinal(tmpData);
            return finalQty;
        }
    }

    const getRemainingQty = (index) => {
        const selectedItem = rmaFinal[index].selectedItem;
        if (selectedItem == false) {
            return '';
        }
        let result = rmaFinal[index].productItems.filter(val => val.order_item_id == selectedItem);
        let availableQty = '';
        if (result[0]) {
            availableQty = result[0].available_qty;
        }
        rmaFinal.map((value,key) => {
            if (value.selectedItem == selectedItem) {
                availableQty -= value.selectedQty;
            }
        })
        return availableQty;
    }

    const isMaxQtyReached = () => {
        let total = 0;
        rmaFinal.map((value,key) => {
            if (value.selectedItem != '') {
                total += Number(value.selectedQty);
            }
        })
        return total >= totalAvailableQty;
    }

    const addReturnSplit = () => {
        if (dataRmaItems) {
            const returnsData = {
                rmaAttributes: dataRmaItems.getRmaFormAttributes.attributes,
                productItems: dataRmaItems.getRmaFormItems.return_items,
                selectedItem: false,
                selectedQty: 0,
                reason: ''
            }
            setRmaFinal([...rmaFinal, returnsData]);
        }
    }

    const removeReturnSplit = (index) => {
        let tmpData = rmaFinal;
        tmpData.splice(index, 1);
        setRmaFinal(tmpData);
    }

    if (loadingRmaItems) return <LoadingIndicator />;
    if (errorRmaItems) return `${t('Error: Something went wrong!')}`;

    return rmaFinal[0] &&
    rmaFinal[0].productItems.length > 0 ? (
        <div className={`returns content-wrapper`}>
            <div className="account-header">
                <h1 className={'my-account__page-title'}>
                    {t('Create New Return')}
                </h1>
                <ReturnOrderInfo orderId={orderId} />
                <div className="return-order-form-wrapper">
                    <Formik
                        initialValues={{
                            products: [{
                                rma_item: '',
                                item_qty: '',
                                item_resolution: '',
                                item_condition: '',
                                item_reason: '',
                                item_reason_other: '',
                            }]
                        }}
                        onSubmit={handleSubmit}
                        validationSchema={validationSchema}
                    >
                        {({
                              values,
                              isSubmitting,
                              setFieldValue
                          }) => (
                            <Form>
                                <div className={'return-contact-email'}>
                                    <CorraField
                                        label={t('Contact Email Address')}
                                        labelText={t('Contact Email Address')}
                                    >
                                        <Field
                                            name="custom_contact_email"
                                            component={TextInputFormik}
                                            type="text"
                                            id="custom_contact_email"
                                        />
                                    </CorraField>
                                </div>
                                <div className={'return-form-fields'}>
                                    <h2 className={'my-account__block-title'}>
                                        {t('Return Items Information')}
                                    </h2>
                                    <FieldArray name="products">
                                        {({ push, remove }) => (
                                            <div className={`field-wrapper`}>
                                                {rmaFinal.map((value, index) => {
                                                    return (
                                                        <div
                                                            className={`order-return-row`}
                                                            key={index}
                                                        >
                                                            <CorraField
                                                                label="Item Return"
                                                                labelText={t(`Item Return`)}
                                                                required={true}
                                                            >
                                                                <Field
                                                                    name={`products[${index}].rma_item`}
                                                                    component={SelectInputFormik}
                                                                    label="Item Return"
                                                                    id={`products[${index}].rma_item`}
                                                                    items={getRmaItemOptions(value.productItems)}
                                                                    onChange={(e) => {
                                                                        setFieldValue(`products[${index}].rma_item`, e.target.value);
                                                                        setFieldValue(`products[${index}].item_qty`, selectItemChanged(index, e.target.value));
                                                                    }}
                                                                />
                                                            </CorraField>
                                                            <CorraField
                                                                label="Quantity To Return"
                                                                labelText={t(`Quantity To Return`)}
                                                                required={true}
                                                            >
                                                                <Field
                                                                    name={`products[${index}].item_qty`}
                                                                    component={TextInputFormik}
                                                                    type="number"
                                                                    id={`products[${index}].item_qty`}
                                                                    onChange={(e) => {
                                                                        setFieldValue(`products[${index}].item_qty`, selectQtyChanged(index, e.target.value))
                                                                    }}
                                                                />
                                                                <div className={'remaining-qty'}>
                                                                    <label>Remaining Quantity:</label>
                                                                    <span id={`products[${index}].remaining_qty`}>{getRemainingQty(index)}</span>
                                                                </div>
                                                            </CorraField>

                                                            {value.rmaAttributes &&
                                                            value.rmaAttributes.map((attribute, key) => (
                                                                <div>
                                                                    {attribute.type == 'select' && (
                                                                        <CorraField
                                                                            label={attribute.label}
                                                                            labelText={attribute.label}
                                                                            required={true}
                                                                        >
                                                                            <Field
                                                                                name={`products[${index}].item_${attribute.code}`}
                                                                                component={SelectInputFormik}
                                                                                label={attribute.label}
                                                                                id={`products[${index}].item_${attribute.code}`}
                                                                                items={getRmaAttributeOptions(attribute.values, attribute.code)}
                                                                                onChange={(e) => {
                                                                                    valueOnChange(index, e.target.value, attribute.code);
                                                                                    setFieldValue(`products[${index}].item_${attribute.code}`, e.target.value);
                                                                                }}
                                                                            />
                                                                        </CorraField>
                                                                    )}
                                                                    {(attribute.type == 'text' && value.reason == 'other') &&(
                                                                        <div>
                                                                            <CorraField
                                                                                label={attribute.label}
                                                                                labelText={attribute.label}
                                                                            >
                                                                                <Field
                                                                                    name={`products[${index}].item_${attribute.code}`}
                                                                                    component={TextInputFormik}
                                                                                    type="text"
                                                                                    id={`products[${index}].item_${attribute.code}`}
                                                                                />
                                                                            </CorraField>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}

                                                            <div className="order-return-remove-button-container">
                                                                {index !== 0 && (
                                                                    <Link
                                                                        to={'#'}
                                                                        onClick={() =>
                                                                            removeReturnSplit(index)
                                                                        }
                                                                        title={t(
                                                                            `Remove Item`
                                                                        )}
                                                                    >
                                                                        {!isMobile ? (
                                                                            <span>
                                                                            {t(
                                                                                `Remove`
                                                                            )}
                                                                        </span>
                                                                        ) : (
                                                                            <CloseIcon color="#393838" />
                                                                        )}
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                <Button
                                                    onClick={() => {
                                                        addReturnSplit()
                                                        push({ rma_item: '', item_qty: '', item_resolution: '',
                                                            item_condition: '', item_reason: '' })
                                                    }
                                                    }
                                                    size="lg"
                                                    variant="secondary"
                                                    title={t(`Add Item`)}
                                                    disabled={isMaxQtyReached()}
                                                >
                                                    {t('Add Item To Return')}
                                                </Button>
                                            </div>
                                        )}
                                    </FieldArray>
                                </div>
                                <div className={'return-comment'}>
                                    <CorraField
                                        label={t('Comments')}
                                        labelText="comments"
                                    >
                                        <Field
                                            name="rma_comment"
                                            component="textarea"
                                            id="rma_comment"
                                        />
                                    </CorraField>
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
                </div>
            </div>
        </div>
    ) : (
        <Alert variant={'warning'}>
            {t(` You have no items to return for this order.`)}
        </Alert>
    );
};
