# Account Dashboard

Exports
`<Wishlist/>, <ShareWishlist/>, <MyAccount/>, <AddressBook/>, <AddressForm/>, <AddressList/>, <Dashboard/>, <ChangePassword/>, <NameForm/>, <Newsletter/>, <Orders/>, <OrdersList/>, <Wishlist/>, <OrderBySku/>, <MyReturns/>`

###Changelog
2.0.0: added wishlist functionality and bugfixes

##Usage

**MyAccount**

Dashboard page itself, contains Account Navigation, Defines Routes for all nav links.

```
`<Route exact path="/my-account" component={MyAccount} />`
```

**AddressBook**

Represents Customer's address book.

`<AddressBook />`

**AddressForm**

Component is responsible for creating new customer addresses and editing existed ones.

To create a new address:

```
<Route exact path="/my-account/address/new" component={AddressForm} />
```

To edit existed:

```
<Route key="edit-address" exact path="/my-account/address/edit/:id" component={AddressForm} />
```

**AddressList**

List of all customer's addresses.

`<AddressList addresses={addresses} />`

| **props** | **type** | **required/default** | **info**               |
| :-------: | :------: | :------------------: | :--------------------- |
| addresses |  array   |       required       | array of all addresses |

**Dashboard**

Provides customer with a possability to change password, change contact info, see latest orders, see default addresses.

`<Route exact path="/my-account" component={Dashboard} />`

|   **props**    | **type** |   **required/default**   | **info**                                           |
| :------------: | :------: | :----------------------: | :------------------------------------------------- |
| addressTitle   | string   | required                 | the title of the page                              |
| pageTitle      | string   | default: `My Account`    | the title of the page in title tag                 |
| pageSizeValue  | int      | default: `5`             | limit to show orders                               |

**ChangePassword**

Change Customer's password. Consules list of Password strength requirements. The list of available requirements can be checked here https://www.npmjs.com/package/react-password-strength

```
<ChangePassword
    passwordRequirements={{
        minLength: 5,
        minScore: 2,
        scoreWords: [
            'weak',
            'okay',
            'good',
            'strong',
            'stronger'
        ]
    }}
/>
```

|      **props**       | **type** | **required/default** | **info**                                                 |
| :------------------: | :------: | :------------------: | :------------------------------------------------------- |
| passwordRequirements |  object  |       required       | Contains password strength requirements for new password |

**NameForm**

Change customer's Name, Middle Name, Last Name.

```
<NameForm
     customerData={customerData}
     changeCallback={getCustomerData}
 />
```

|   **props**    | **type** |   **required/default**   | **info**                                           |
| :------------: | :------: | :----------------------: | :------------------------------------------------- |
|  customerData  |  object  |         required         | customer data object                               |
| changeCallback |   func   | default - empty function | function to be executed after successfully changed |

**Newsletter**

Is in charge of subscribing/unsubscribing customer on newsletters.

`<Route exact path="/my-account/newsletter" component={Newsletter} />`

**Orders**

Loads customer's orders.

|   **props**    | **type** |   **required/default**   | **info**                                           |
| :------------: | :------: | :----------------------: | :------------------------------------------------- |
| orderTitle     | string   | required                 | the title of the page                              |
| pageTitle      | string   | default: `My Orders`     | the title of the page in title tag                 |
| pageSizeValue  | int      | default: `10`            | limit to show orders                               |

`<Route path="/my-account/orders" component={Orders} />`

**OrderBySku**

Order products in bulk by using SKU or as a csv file import.

`<Route path="/my-account/order-by-sku" component={OrderBySku} />`

**OrdersList**

Represents customer's orders.

`<OrdersList orderItems={orderItems} />`

| **props**  | **type** | **required/default** | **info**            |
| :--------: | :------: | :------------------: | :------------------ |
| orderItems |  array   |       required       | array of all orders |

**Wishlist**

Loads customer's wishlist.

`<Route exact path="/my-account/wishlist" component={Wishlist} />`

**Saved Cards**

Manage to view and remove the stored payment cards.

`<Route exact path="/my-account/saved-cards" component={SavedCards} />`

```js
<ModalConfirmation
    handleClose={handleClose}
    removeItem={deletePayment}
    show={show}
    hashId={hashId}
/>
```

| **props** | **type** | **required/default** | **info**      |
| :-------: | :------: | :------------------: | :------------ |
|   show    | boolean  |       default        | flag show     |
|  hashId   |  string  |       required       | Card Hash Key |

**My Account Invoice Tab**

Manage to view and print the Invoices.

`<Route exact path="/my-account/invoice/print/:orderId" component={InvoicePrintPage} />`

| **props** | **type** | **required/default** | **info** |
| :-------: | :------: | :------------------: | :------- |
|  orderId  |   int    |       required       | Order Id |

**OrderBySku**
Allows customer to order in bulk by SKU (simple and config Products).

`<Route exact path="/my-account/order-by-sku" component={OrderBySku} />`

BE Support : Corra_AdvancedCheckoutGraphQl

**MyReturns**
Allows customer to see list of returns requested.

`<MyReturns myReturnsTitle={myReturnsTitle} />`

**ReturnsDetailsPage**
Allows customer to see details of return requested.
`<Route exact path="/my-account/returns/view/:returnId" component={ReturnsDetailsPage}/>`

BE Support : Corra_RmaExtendedGraphQl

##Install

`yarn add @corratech/account-dashboard`
