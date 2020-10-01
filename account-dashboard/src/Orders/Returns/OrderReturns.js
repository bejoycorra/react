import React, { useContext, useEffect, useState, Fragment } from 'react';
import { number } from 'prop-types';
import { useLazyQuery } from 'react-apollo';
import { useTitle } from 'react-use';
import { useTranslation } from 'react-i18next';
import { LoaderStore } from '@corratech/context-provider';
import { ReturnsList } from '../../MyReturns/ReturnsList';
import { listReturnsByOrder } from '../Queries/Rma/listReturnsByOrder.graphql';
import { PaginationToolbar } from '../../PaginationToolbar';

export const OrderReturns = props => {
    const [t] = useTranslation();
    const {
        pageSizeValue,
        warningIco,
        orderId
    } = props;
    const [runQuery, queryResponse] = useLazyQuery(listReturnsByOrder, {
        fetchPolicy: 'no-cache'
    });
    const { loading, error, data } = queryResponse;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);
    const [totalCount, setTotalCount] = useState(null);
    const [pageSize, setPageSize] = useState(pageSizeValue);
    const LoadingIndicator = useContext(LoaderStore);

    const pageControl = {
        currentPage,
        setPage: setCurrentPage,
        totalPages,
        pageSize: pageSize,
        setPageSize,
        totalCount: totalCount
    };

    useEffect(() => {
        runQuery({
            variables: {
                orderId: orderId,
                pageSize: Number(pageSize),
                currentPage: Number(currentPage)
            }
        });
    }, [runQuery, currentPage, pageSize]);
    
    useEffect(() => {
        if (error && !loading && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [currentPage, error, loading, setCurrentPage]);
    
    useEffect(() => {
        if (data) {
            const totalCount = data.listReturnsByOrder
                ? data.listReturnsByOrder.total_count
                : 1;
            const totalPageCount = Math.ceil(totalCount / pageSize);

            setTotalCount(totalCount);
            setTotalPages(totalPageCount);
        }
    }, [data, setTotalPages]);

    if (error) return `${t('Error:')} ${error}`;

    const { returns_by_order } = data ? data.listReturnsByOrder : [];

    return (
        <div className={props.className} css={props.css}>
            {loading ? (
                <LoadingIndicator />
            ) : (
                <Fragment>
                    <ReturnsList
                        returnItems={returns_by_order ? returns_by_order : []}
                        warningIco={warningIco}
                    />
                </Fragment>
            )}
            <PaginationToolbar pageControl={pageControl} />
        </div>
    );
};

OrderReturns.propTypes = {
    pageSizeValue: number
};

OrderReturns.defaultProps = {
    pageSizeValue: 10
};
