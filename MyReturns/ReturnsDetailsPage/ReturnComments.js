import React, {Fragment, useMemo, useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
import {combine, Field, isRequired, TextInput} from "@corratech/form-components";
import {Button} from "react-bootstrap";
import {useMutation} from "react-apollo";
import submitReturnComment from "../Queries/submitReturnComment.graphql"
import PropTypes from "prop-types";

export const ReturnComments = props => {
    const { itemData, returnCommentsTitle } = props;
    const [t] = useTranslation();
    const [returncomments, setReturncomments] = useState(itemData.comments);
    const [comment, setComment] = useState('');

    const getReturnComments = useMemo(
        () =>
            returncomments.map((comment, key) => (
                <div key={key}>
                    <div className="col comment">
                        {comment.is_admin
                            ? t('Customer Service')
                            : itemData.customer_name
                        }
                        <span> {comment.created_at}</span>
                        <div>   {comment.comment} </div>
                    </div>
                </div>
            )),
        [returncomments]
    );
    const [saveComment] = useMutation(
        submitReturnComment,
        {
            onCompleted: res => {
                debugger
                console.log('comment'+res.addRmaComment.comments);
                setReturncomments(res.addRmaComment.comments);
            }
        }
    );
    const saveReturnComment = async (comment) => {
        await saveComment({
            variables: {
                id: itemData.entity_id,
                comment
            }
        });
    };
    const submitForm = event => {
        event.preventDefault();
        if(comment !==''){
            saveReturnComment(comment);
        }

    };
    const submitReturnComments = (
        <form onSubmit={submitForm}>
            <Field
                label={t(props.commentFieldLabel)}
                labelText={props.commentFieldLabelText}
            >
                <TextInput
                    type={'text'}
                    autoFocus
                    field="comment"
                    id="comment"
                    validate={combine([
                        {
                            fn: isRequired,
                            text: t(props.requiredText)
                        }
                    ])}
                    placeholder={t(props.commentFieldPlaceholder)}
                    initialValue={''}
                    validateOnBlur
                    onChange={event =>
                        setComment(event.target.value)
                    }
                />
            </Field>
            <Button
                size="lg"
                variant="primary"
                type="submit"
            >
                {t(props.submitButtonText)}
            </Button>
        </form>
    );
    return (
        <div className="return-comments-container">
            <div>{t(returnCommentsTitle)}</div>
            <div className="return-comments">
                <div>{returncomments && getReturnComments}</div>
                <div>{submitReturnComments}</div>
            </div>
        </div>
    );
};

ReturnComments.propTypes = {
    requiredText: PropTypes.string,
    submitButtonText: PropTypes.string,
    commentFieldPlaceholder: PropTypes.string,
    commentFieldLabelText: PropTypes.string,
    commentFieldLabel: PropTypes.string
};

ReturnComments.defaultProps = {
    requiredText: 'This is a required field',
    submitButtonText: 'Submit Comment',
    commentFieldPlaceholder: 'Return Comment',
    commentFieldLabelText: 'comment',
    commentFieldLabel: 'Leave comment',
};