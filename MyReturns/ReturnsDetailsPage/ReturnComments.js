import React, { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const ReturnComments = props => {
    const { itemData, returnCommentsTitle } = props;
    const [t] = useTranslation();
    const { comments } = itemData;
debugger
    const getReturnItems = useMemo(
        () =>
            comments.map((comment, key) => (
                <div key={key}>
                    <div className="col comment">
                        {comment.is_admin && t('Customer Service')}
                        {comment.is_admin == 0 && t('customer')} {comment.created_at}
                     <div>   {comment.comment} </div>
                    </div>
                </div>
            )),
        [comments]
    );

    return (
        <div className="return-comments-container">
            <div>{t(returnCommentsTitle)}</div>
            <div className="return-comments">
                <div>{comments && getReturnItems}</div>
            </div>
        </div>
    );
};
