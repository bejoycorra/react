import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Check as CheckIcon,
    Edit3 as EditIcon,
    Trash2 as TrashIcon
} from 'react-feather';
import { Price, useWindowSize } from '@magento/peregrine';
import { useTranslation } from 'react-i18next';
import {
    combine,
    hasLengthAtMost,
    isNumber,
    isRequired,
    TextInput
} from '@corratech/form-components';
import PropTypes from 'prop-types';

export const RequisitionItem = props => {
    const [t] = useTranslation();

    const {
        index,
        item,
        checkedItems,
        setCheckedItems,
        setRemovingSpecificItem,
        setShowRemoveModal
    } = props;
    const windowSize = useWindowSize();
    const MOBILE_VIEWPORT = 767;
    const isMobile = windowSize.innerWidth <= MOBILE_VIEWPORT;

    const categoryUrlSuffix = '.html',
        previewImageSize = 300,
        imageParam = '?auto=webp&format=pjpg&width=' + previewImageSize;

    const [qty, setQty] = useState(item.qty);

    return (
        <tr key={item.itemId}>
            <th scope={'row'} className={'number'}>
                {index + 1}
                {isMobile ? (
                    <Link
                        to={`/${item.product.url_key}${categoryUrlSuffix}`}
                        title={t('Edit product')}
                    >
                        <button>
                            {props.editIcon ? (
                                props.editIcon
                            ) : (
                                <EditIcon size={14} />
                            )}
                        </button>
                    </Link>
                ) : (
                    ''
                )}
            </th>
            <td className={'item'}>
                <label
                    className={'root-checkbox'}
                    htmlFor={'product_checkbox_' + item.itemId}
                >
                    <span className={'icon-checkbox'}>
                        {checkedItems.length && checkedItems[index] ? (
                            <CheckIcon size={18} />
                        ) : (
                            ''
                        )}
                    </span>
                    <input
                        type={'checkbox'}
                        className={'input-checkbox'}
                        checked={
                            checkedItems.length ? !!checkedItems[index] : false
                        }
                        id={'product_checkbox_' + item.itemId}
                        onChange={e => {
                            checkedItems[index] = e.target.checked;
                            setCheckedItems([...checkedItems]);
                        }}
                    />
                </label>
                {!isMobile ? (
                    <div className={'product-image'}>
                        <img
                            src={`${item.product.small_image.url}${imageParam}`}
                            alt={item.product.name}
                        />
                    </div>
                ) : (
                    ''
                )}
                <div className={'product-options'}>
                    <span className={'mobile-label'}> {t('Product:')} </span>
                    <Link
                        to={`/${item.product.url_key}${categoryUrlSuffix}`}
                        title={item.product.name}
                    >
                        <button className={'cross-button'}>
                            {item.product.name}
                        </button>
                    </Link>
                    <div>
                        <strong>{t('SKU: ')}</strong>
                        {item.sku}
                    </div>
                </div>
            </td>
            <td className={'price'}>
                <span className={'mobile-label'}> {t('Price:')} </span>
                <Price
                    value={item.product.price.regularPrice.amount.value}
                    currencyCode={
                        item.product.price.regularPrice.amount.currency
                    }
                />
            </td>
            <td className={'qty'}>
                <span className={'mobile-label'}> {t('Qty:')} </span>
                <TextInput
                    type={'text'}
                    field={`products[${item.itemId}][qty]`}
                    id={`products[${item.itemId}][qty]`}
                    validate={combine([
                        {
                            fn: isRequired,
                            text: t(props.requiredField)
                        },
                        {
                            fn: isNumber,
                            text: t(props.mustBeNumber)
                        },
                        {
                            fn: hasLengthAtMost,
                            param: 12,
                            text: t(props.maxQtyLength)
                        }
                    ])}
                    validateOnBlur
                    initialValue={`${qty}`}
                    onChange={e => {
                        let value = e.target.value;
                        setQty(value);
                        item.qty = value;
                    }}
                />
            </td>
            <td className={'subtotal'}>
                <div className={'subtotal-wrapper'}>
                    <span className={'mobile-label'}> {t('Subtotal:')} </span>
                    <span>
                        <Price
                            value={
                                item.product.price.regularPrice.amount.value *
                                item.qty
                            }
                            currencyCode={
                                item.product.price.regularPrice.amount.currency
                            }
                        />
                    </span>
                </div>
                {!isMobile ? (
                    <div className={'actions'}>
                        <Link
                            to={`/${item.product.url_key}${categoryUrlSuffix}`}
                            title={t('Edit product')}
                        >
                            <button>
                                {props.editIcon ? (
                                    props.editIcon
                                ) : (
                                    <EditIcon size={14} />
                                )}
                            </button>
                        </Link>
                        <Link
                            to={'#'}
                            onClick={e => {
                                e.preventDefault();
                                setRemovingSpecificItem(item.itemId);
                                setShowRemoveModal(true);
                            }}
                        >
                            <button>
                                <TrashIcon size={14} />
                            </button>
                        </Link>
                    </div>
                ) : (
                    <Link
                        to={'#'}
                        onClick={e => {
                            e.preventDefault();
                            setRemovingSpecificItem(item.itemId);
                            setShowRemoveModal(true);
                        }}
                    >
                        <button>
                            <TrashIcon size={14} />
                        </button>
                    </Link>
                )}
            </td>
        </tr>
    );
};

RequisitionItem.propTypes = {
    maxQtyLength: PropTypes.string,
    mustBeNumber: PropTypes.string,
    requiredField: PropTypes.string
};

RequisitionItem.defaultProps = {
    maxQtyLength: 'Please enter no more than 12 characters.',
    mustBeNumber: 'Please enter a valid positive number',
    requiredField: 'This is a required field'
};
