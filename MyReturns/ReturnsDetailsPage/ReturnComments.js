import React, { Fragment, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {combine, Field, isRequired, TextInput} from "@corratech/form-components";
import {Button} from "react-bootstrap";

export const ReturnComments = props => {
    const { itemData, returnCommentsTitle } = props;
    const [t] = useTranslation();
    const { comments } = itemData;
debugger
    const getReturnComments = useMemo(
        () =>
            comments.map((comment, key) => (
                <div key={key}>
                    <div className="col comment">
                        {comment.is_admin 
                            ? t('Customer Service ')
                            : t('customer name ')
                        }
                        {comment.created_at}
                     <div>   {comment.comment} </div>
                    </div>
                </div>
            )),
        [comments]
    );

const submitReturnComments = (
    <form>
        <Field
            label={t('Leave comment')}
            labelText={'comment'}
        >
            <TextInput
                type={'text'}
                field="comment"
                id="comment"
                validateOnBlur
            />
        </Field>
        <Button
            size="lg"
            variant="primary"
            type="submit"
        >
            {t('Submit Comment')}
        </Button>
    </form>
);
    return (
        <div className="return-comments-container">
            <div>{t(returnCommentsTitle)}</div>
            <div className="return-comments">
                <div>{comments && getReturnComments}</div>
                <div>{submitReturnComments}</div>
            </div>
        </div>
    );
};
