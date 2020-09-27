import React, { useContext, useEffect, useState, Fragment } from 'react';
import { number } from 'prop-types';
import { useLazyQuery } from 'react-apollo';
import { useTitle } from 'react-use';
import { useTranslation } from 'react-i18next';
import { OrdersList } from './OrdersList';
import { LoaderStore } from '@corratech/context-provider';
import { customerSalesOrders } from './Queries/customerSalesOrders.graphql';
import { PaginationToolbar } from '../PaginationToolbar';

export const Orders = props => {
    const [t] = useTranslation();
    const {
        pageSizeValue,
        warningIco,
        configProductAddToCartGraphql,
        simpleProductAddToCartGraphql,
        orderTitle,
        pageTitle
    } = props;
    const [runQuery, queryResponse] = useLazyQuery(customerSalesOrders, {
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

    //Update the title
    useTitle(t(pageTitle));

    useEffect(() => {
        runQuery({
            variables: {
                pageSize: Number(pageSize),
                currentPage: Number(currentPage)
            }
        });
    }, [runQuery, currentPage, pageSize]);

    /**
     * Handle error state
     * set the page to inital value
     */
    useEffect(() => {
        if (error && !loading && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [currentPage, error, loading, setCurrentPage]);

    /**
     * When data gets updated
     */
    useEffect(() => {
        if (data) {
            const totalOrdersCount = data.customerSalesOrders
                ? data.customerSalesOrders.total_count
                : 1;
            const totalPageCount = Math.ceil(totalOrdersCount / pageSize);

            setTotalCount(totalOrdersCount);
            setTotalPages(totalPageCount);
        }
    }, [data, setTotalPages]);

    if (error) return `${t('Error:')} ${error}`;

    const { items } = data ? data.customerSalesOrders : [];

    return (
        <div className={props.className} css={props.css}>
            <h1>{t(`${orderTitle}`)}</h1>
            {loading ? (
                <LoadingIndicator />
            ) : (
                <Fragment>
                    <OrdersList
                        orderItems={items ? items : []}
                        warningIco={warningIco}
                        configProductAddToCartGraphql={
                            configProductAddToCartGraphql
                        }
                        simpleProductAddToCartGraphql={
                            simpleProductAddToCartGraphql
                        }
                    />
                </Fragment>
            )}
            <PaginationToolbar pageControl={pageControl} />
        </div>
    );
};

Orders.propTypes = {
    pageSizeValue: number
};

Orders.defaultProps = {
    pageSizeValue: 10,
    pageTitle: 'My Orders'
};
