import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { Price } from '@corratech/price';
import { useWindowSize } from '@magento/peregrine';
import { ListDropdown } from '@corratech/dropdown';
import { QuantitySelector } from '@corratech/quantity-selector';
import {
    Check as CheckIcon,
    X as ErrorIcon,
    Edit3 as EditIcon
} from 'react-feather';

export const WishlistItem = props => {
    const [t] = useTranslation();
    const {
        addToCart,
        removeItem,
        moveItemToWishlist,
        wishlistsArray,
        wishlistItems,
        wishlistId,
        createNewWishlist,
        copyItemToWishlist,
        checked
    } = props;

    const [item, setItem] = useState(wishlistItems[props.index]);
    const [qty, setQty] = useState(wishlistItems[props.index].qty);
    const [comment, setComment] = useState(
        wishlistItems[props.index].description
            ? wishlistItems[props.index].description
            : ''
    );

    useEffect(() => {
        setItem(wishlistItems[props.index]);
        setComment(
            wishlistItems[props.index].description
                ? wishlistItems[props.index].description
                : ''
        );
        setQty(wishlistItems[props.index].qty);
    }, [wishlistItems]);

    let configProduct;

    if (item.selectedProductId) {
        const itemName = item.product.name;
        const itemUrl = item.product.url_key;
        configProduct = item.product.variants.find(el => {
            return item.selectedProductId == el.product.id;
        });
        configProduct.product.name = itemName;
        configProduct.product.url_key = itemUrl;
    }

    const product = configProduct ? configProduct.product : item.product;
    const categoryUrlSuffix = '.html';
    const previewImageSize = 300;

    const MOBILE_VIEWPORT = 767;
    const windowSize = useWindowSize();
    const isMobile = windowSize.innerWidth <= MOBILE_VIEWPORT;

    const imageParam = '?auto=webp&format=pjpg&width=' + previewImageSize;

    return (
        <div className={'wishlist-item'} key={product.id}>
            {!isMobile ? (
                <>
                    <div className={'product-image'}>
                        <img
                            src={`${product.small_image.url}${imageParam}`}
                            alt={product.name}
                        />
                    </div>
                    <div className={'product-name'}>
                        <label
                            className={'root-checkbox'}
                            htmlFor={'product_checkbox_' + product.id}
                        >
                            <span className={'icon-checkbox'}>
                                {checked.length && checked[props.index] ? (
                                    <CheckIcon size={18} />
                                ) : (
                                    ''
                                )}
                            </span>
                            <input
                                type={'checkbox'}
                                className={'input-checkbox'}
                                checked={
                                    checked.length
                                        ? !!checked[props.index]
                                        : false
                                }
                                id={'product_checkbox_' + product.id}
                                onChange={e => {
                                    checked[props.index] = e.target.checked;
                                    props.setChecked([...props.checked]);
                                }}
                            />
                        </label>

                        <Link
                            to={`/${product.url_key}${categoryUrlSuffix}`}
                            title={product.name}
                        >
                            {product.name}
                        </Link>
                    </div>
                    <div className={'product-price'}>
                        <Price product={product} />
                    </div>
                    {item.selectedProductId ? (
                        <OverlayTrigger
                            placement={'bottom-start'}
                            overlay={props =>
                                renderTooltip(
                                    props,
                                    { style: { left: 10 } },
                                    configProduct,
                                    t
                                )
                            }
                        >
                            <span>{t(`See Details`)}</span>
                        </OverlayTrigger>
                    ) : (
                        ''
                    )}
                </>
            ) : (
                <div className={'product-info'}>
                    <div className={'image'}>
                        <label
                            className={'root-checkbox'}
                            htmlFor={'product_checkbox_' + product.id}
                        >
                            <span className={'icon-checkbox'}>
                                {checked.length && checked[props.index] ? (
                                    <CheckIcon size={18} />
                                ) : (
                                    ''
                                )}
                            </span>
                            <input
                                type={'checkbox'}
                                className={'input-checkbox'}
                                checked={
                                    checked.length
                                        ? !!checked[props.index]
                                        : false
                                }
                                id={'product_checkbox_' + product.id}
                                onChange={e => {
                                    props.checked[props.index] =
                                        e.target.checked;
                                    props.setChecked([...props.checked]);
                                }}
                            />
                        </label>
                        <div className={'product-image'}>
                            <img
                                src={`${product.small_image.url}${imageParam}`}
                                alt={product.name}
                            />
                        </div>
                    </div>
                    <div className={''}>
                        <Link
                            to={`/${product.url_key}${categoryUrlSuffix}`}
                            title={product.name}
                        >
                            {product.name}
                        </Link>
                        <div className={'product-price'}>
                            <Price product={product} />
                        </div>
                        {item.selectedProductId ? (
                            <OverlayTrigger
                                placement={'bottom-start'}
                                overlay={props =>
                                    renderTooltip(
                                        props,
                                        { style: { left: 10 } },
                                        configProduct,
                                        t
                                    )
                                }
                            >
                                <span>{t(`See Details`)}</span>
                            </OverlayTrigger>
                        ) : (
                            ''
                        )}
                    </div>
                </div>
            )}
            <div className={'product-inner'}>
                <div className={'product-comment'}>
                    <textarea
                        name={`products[${item.id}][description]`}
                        id={`products[${item.id}]`}
                        placeholder={t('Comment')}
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />
                </div>
                {!isMobile ? (
                    <>
                        <div className={'product-qty'}>
                            <label htmlFor={`products[${item.id}][qty]`}>
                                <span>{t('Qty')}</span>
                            </label>

                            <div className={'qty-fields'}>
                                <QuantitySelector
                                    setQuantity={setQty}
                                    quantity={qty}
                                    placeholder={'QTY'}
                                    minQuantity={0}
                                    name={`products[${item.id}][qty]`}
                                />

                                <Button
                                    variant={'primary'}
                                    size={'lg'}
                                    title={t('Add to cart')}
                                    onClick={() =>
                                        addToCart(
                                            item.id,
                                            item.qty,
                                            item.product.id
                                        )
                                    }
                                >
                                    {t('Add to Cart')}
                                </Button>
                            </div>
                        </div>
                        <ListDropdown
                            dropdownTitle={t('Move to Wishlist')}
                            dropdownHandler={moveItemToWishlist.bind(
                                null,
                                item.id,
                                qty
                            )}
                            namesArray={wishlistsArray}
                            listId={wishlistId}
                            additionalLink={
                                wishlistsArray.length < 5 ? (
                                    <Link
                                        to={'#'}
                                        className={'create-wishlist-button'}
                                        onClick={e => {
                                            e.preventDefault();
                                            createNewWishlist(
                                                moveItemToWishlist.bind(
                                                    null,
                                                    item.id,
                                                    qty
                                                )
                                            );
                                        }}
                                        title={t('Create New Wishlist')}
                                    >
                                        <button>
                                            {t('+ Create New Wishlist')}
                                        </button>
                                    </Link>
                                ) : (
                                    ''
                                )
                            }
                        />
                        <ListDropdown
                            dropdownTitle={t('Copy to Wishlist')}
                            dropdownHandler={copyItemToWishlist.bind(
                                null,
                                item.id,
                                qty
                            )}
                            namesArray={wishlistsArray}
                            listId={wishlistId}
                            additionalLink={
                                wishlistsArray.length < 5 ? (
                                    <Link
                                        to={'#'}
                                        className={'create-wishlist-button'}
                                        onClick={e => {
                                            e.preventDefault();
                                            createNewWishlist(
                                                copyItemToWishlist.bind(
                                                    null,
                                                    item.id,
                                                    qty
                                                )
                                            );
                                        }}
                                        title={t('Create New Wishlist')}
                                    >
                                        <button>
                                            {t('+ Create New Wishlist')}
                                        </button>
                                    </Link>
                                ) : (
                                    ''
                                )
                            }
                        />
                        <Link
                            to={`/${product.url_key}${categoryUrlSuffix}`}
                            title={product.name}
                            className={'edit-link'}
                        >
                            <button className={'cross-button'}>
                                {props.editIcon ? props.editIcon : <EditIcon />}
                            </button>
                        </Link>
                        <Link
                            to={'#'}
                            onClick={e => {
                                e.preventDefault();
                                removeItem(item.id);
                            }}
                            title={t('Delete item')}
                            className={'remove-link'}
                        >
                            <button className={'cross-button'}>
                                {props.crossIcon ? (
                                    props.crossIcon
                                ) : (
                                    <ErrorIcon size={18} />
                                )}
                            </button>
                        </Link>
                    </>
                ) : (
                    <>
                        <div className={'wishlist-action-wrapper'}>
                            <div className={'wishlist-qty-wrapper'}>
                                <label htmlFor={`products[${item.id}][qty]`}>
                                    <span>{t('Qty')}</span>
                                </label>
                                <QuantitySelector
                                    setQuantity={setQty}
                                    quantity={qty}
                                    placeholder={'QTY'}
                                    minQuantity={0}
                                    name={`products[${item.id}][qty]`}
                                />
                            </div>
                            <div className={'wishlist-action-links'}>
                                <Button
                                    type={'primary'}
                                    size={'lg'}
                                    title={t('Add to Cart')}
                                    onClick={() =>
                                        addToCart(
                                            item.id,
                                            item.qty,
                                            item.product.id
                                        )
                                    }
                                >
                                    {t('Add to Cart')}
                                </Button>
                                <Link
                                    to={`/${product.url_key}${categoryUrlSuffix}`}
                                    title={product.name}
                                >
                                    <button className={'cross-button'}>
                                        {props.editIcon ? (
                                            props.editIcon
                                        ) : (
                                            <EditIcon />
                                        )}
                                    </button>
                                </Link>
                                <Link
                                    to={'#'}
                                    onClick={e => {
                                        e.preventDefault();
                                        removeItem(item.id);
                                    }}
                                    title={t('Delete item')}
                                    className={'remove-link'}
                                >
                                    <button className={'cross-button'}>
                                        {props.crossIcon ? (
                                            props.crossIcon
                                        ) : (
                                            <ErrorIcon size={18} />
                                        )}
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

const renderTooltip = (props, arrowProps, product, t) => (
    <Tooltip
        {...props}
        arrowProps={arrowProps}
        show={props.show.toString()}
        id={`tooltip-${props.placement}`}
    >
        <p className={'tooltip-title'}>{t('Options Details')}</p>
        {product.attributes.map(el => (
            <div key={el.code}>
                <strong>{t(el.code)}</strong>
                <p>{t(el.label)}</p>
            </div>
        ))}
    </Tooltip>
);
