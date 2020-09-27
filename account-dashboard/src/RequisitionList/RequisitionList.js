import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getAllRequisitionLists } from './Queries';
import { useQuery } from 'react-apollo';
import { LoaderStore } from '@corratech/context-provider';
import { ListForm } from '@corratech/add-to-requisition';
import './RequisitionList.less';
import { PaginationToolbar } from '@corratech/pagination';
import { Check as CheckIcon } from 'react-feather';
import { Alert } from 'react-bootstrap';
import { useTitle } from 'react-use';

export const RequisitionList = props => {
    const [t] = useTranslation();
    const LoadingIndicator = useContext(LoaderStore);

    const [showAlert, setShowAlert] = useState(false);

    useTitle(t('Requisition Lists'));

    const {
        data: dataLists,
        loading: loadingLists,
        error: errorLists,
        refetch: refetchLists
    } = useQuery(getAllRequisitionLists, {
        fetchPolicy: 'no-cache',
        notifyOnNetworkStatusChange: true
    });

    if (errorLists) {
        return (
            <p>
                {t(
                    'Error while fetching your requisition lists. Please try again.'
                )}
            </p>
        );
    }

    if (!dataLists) {
        return <LoadingIndicator />;
    }

    const { requisitionList: lists } = dataLists;

    return (
        <div
            className={`requisition-page ${
                props.className ? props.className : ''
            }`}
        >
            <div className={'toolbar'}>
                <h1>{t('Requisition Lists')}</h1>
                <ListForm
                    callback={() => {
                        refetchLists().then(() => setShowAlert(true));
                    }}
                />
            </div>

            {loadingLists ? <LoadingIndicator /> : ''}

            {showAlert ? (
                <Alert variant={'success'}>
                    {props.successIcon ? (
                        props.successIcon
                    ) : (
                        <CheckIcon size="14" strokeWidth={'4'} color={'#000'} />
                    )}
                    {t(props.createdSuccessfully)}
                </Alert>
            ) : (
                ''
            )}

            {!loadingLists ? (
                <div
                    className={'lists-table'}
                    aria-label={t('Requisition Lists Table')}
                >
                    <div className={'row head'}>
                        <div className={'name'}>{t('Name & Description')}</div>
                        <div className={'items'}>{t('Items')}</div>
                        <div className={'activity'}>{t('Latest Activity')}</div>
                        <div className={'action'}>{t('Action')}</div>
                    </div>
                    {lists.requisitionList.length > 0 ? (
                        <PaginationToolbar
                            repeatInTop={false}
                            enableScroll={true}
                            availableItemsPerPage={[20, 30, 50, 100, 200]}
                            id={1}
                            initialItemsQty={20}
                            children={lists.requisitionList.map(
                                (requisitionListItem, index) => {
                                    return (
                                        <div
                                            className={'row'}
                                            key={requisitionListItem.id}
                                        >
                                            <div className={'name'}>
                                                <span
                                                    className={'mobile-label'}
                                                >
                                                    {t('Name & Description:')}
                                                </span>
                                                <div className={'wrapper'}>
                                                    <div>
                                                        <span
                                                            className={
                                                                'product-name'
                                                            }
                                                        >
                                                            {' '}
                                                            {
                                                                requisitionListItem.name
                                                            }{' '}
                                                        </span>
                                                    </div>
                                                    {requisitionListItem.description ? (
                                                        <div
                                                            className={
                                                                'product-description'
                                                            }
                                                        >
                                                            {
                                                                requisitionListItem.description
                                                            }
                                                        </div>
                                                    ) : (
                                                        ''
                                                    )}
                                                </div>
                                            </div>
                                            <div className={'items'}>
                                                <span
                                                    className={'mobile-label'}
                                                >
                                                    {t('Items:')}
                                                </span>
                                                <div className={'wrapper'}>
                                                    {
                                                        requisitionListItem
                                                            .items.length
                                                    }
                                                </div>
                                            </div>
                                            <div className={'activity'}>
                                                <span
                                                    className={'mobile-label'}
                                                >
                                                    {t('Latest Activity:')}
                                                </span>
                                                <div className={'wrapper'}>
                                                    {
                                                        requisitionListItem.updatedAt
                                                    }
                                                </div>
                                            </div>
                                            <div className={'action'}>
                                                <span
                                                    className={'mobile-label'}
                                                >
                                                    {t('Action:')}
                                                </span>
                                                <div className={'wrapper'}>
                                                    <Link
                                                        to={`/my-account/requisition-list/${requisitionListItem.id}`}
                                                        title={t('View List')}
                                                    >
                                                        <button>
                                                            {t('View')}
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                            )}
                            childrenQty={lists.requisitionList.length}
                        />
                    ) : (
                        <div className={'row'}>
                            <div className={'wrapper'}>
                                {t(`We couldn't find any records.`)}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                ''
            )}
        </div>
    );
};

RequisitionList.propTypes = {
    createNewList: PropTypes.string,
    requiredText: PropTypes.string,
    createdSuccessfully: PropTypes.string
};

RequisitionList.defaultProps = {
    createNewList: 'Create New Requisition List',
    requiredText: 'This is a required field',
    createdSuccessfully: 'Requisition List was successfully created!'
};
