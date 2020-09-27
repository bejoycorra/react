import { CorraContextProvider, CartStore } from '@corratech/context-provider';
import { withKnobs } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import React from 'react';
import { OrderBySku } from '..';
import OrderBySkuNotes from './OrderBySku.md';

storiesOf('ZZZ_BACKLOG/Composites/Account Dashboard/OrderBySku', module)
    .addDecorator(withKnobs)
    .addDecorator(story => (
        <CorraContextProvider apiBase={'/graphql'}>
            {story()}
        </CorraContextProvider>
    ))
    .add(
        //   CHANGE STRING TO CORRECT STORY NAME
        //   Examples: "Dropdown", "Dropdown - Starts Open", "Tacony Dropdown"
        'OrderBySku - default',
        () => <StoryComponent />,
        {
            // SET NOTES
            notes: OrderBySkuNotes
        }
    );

const StoryComponent = () => {
    const { cartState } = React.useContext(CartStore);
    const cartItems = cartState.cart.items;

    var cartItemCount = 0;
    if (Array.isArray(cartItems)) {
        // getting cart item quantity for each items
        cartItemCount = cartItems
            .map(item => item.quantity)
            // adding quantities together
            .reduce(function(a, b) {
                return a + b;
            }, 0);
    }

    return (
        <>
            <OrderBySku />
            <p style={{ color: 'red', marginTop: '20px', fontSize: '15px' }}>
                Items in cart: {cartItemCount}
            </p>
        </>
    );
};
