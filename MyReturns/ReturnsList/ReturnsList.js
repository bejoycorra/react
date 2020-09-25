/** @jsx jsx */
import { jsx } from '@emotion/core';
import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { ReturnItems } from './ReturnItems';
import { Alert } from 'react-bootstrap';
import { AlertTriangle as Warning } from 'react-feather';
import './ReturnsList.less';

export const ReturnsList = props => {
    const {
        returnItems,
        css,
        className,
        warningIco
        
        
    } = { ...props };
    const [t] = useTranslation();

    return returnItems.length > 0 ? (
        <div className={'table-wrapper'}>
            <table
                className={`returns-list ${className || ''}`}
                cellSpacing="0"
                cellPadding="0"
                css={css}
            >
                <caption className="table-caption sr-only">
                    {t('My Returns')}
                </caption>
                <thead>
                    <tr>
                        <th scope="col" className="col id">
                            {t('Return #')}
                        </th>
                        <th scope="col" className="col date">
                            {t('Requested Date')}
                        </th>
                        <th scope="col" className="col shipfrom">
                            {t('Ship From')}
                        </th>
                        <th scope="col" className="col status">
                            {t('Return Status')}
                        </th>
                        <th scope="col" className="col action">
                            {t('Action')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <ReturnItems
                        items={returnItems}
                    />
                </tbody>
            </table>
        </div>
    ) : (
        <Alert variant={'warning'}>
            {warningIco}
            {t(` You have placed no returns.`)}
        </Alert>
    );
};
ReturnsList.propTypes = {
    returnItems: PropTypes.array.isRequired,
    css: PropTypes.string
};

ReturnsList.defaultProps = {
    warningIco: <Warning size={20} strokeWidth={'2'} color={'#c07600'} />
};
