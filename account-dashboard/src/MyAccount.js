import React, { useEffect, useContext } from 'react';
import { bool, array, node, string } from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Route, Switch, useHistory } from 'react-router-dom';
import { isSignedIn, AuthStore } from '@corratech/context-provider';
import { MyAccountNavigation } from '@corratech/my-account-navigation';
import { AddressBook } from './AddressBook';
import { AddressForm as NewAddressForm } from './AddressBook/AddressForms';
import { Dashboard } from './Dashboard';
import { ACCOUNT_LINKS, B2B_ACCOUNT_LINKS } from './NavItems';
import { Newsletter } from './Newsletter';
import { OrderBySku } from './OrderBySku';
import { Orders, OrderDetailsPage } from './Orders';
import { OrderDetailsPrintPage } from './Orders/Print';
import { ShareWishlist, Wishlist } from './Wishlist';
import { RequisitionList, RequisitionItems } from './RequisitionList';
import { AccountInformation } from './AccountInformation';
import { requisitionListAvailable } from './Data';
import { StoreCredit } from './StoreCredit';
import { GiftCard } from './GiftCard';
import { AlertProvider } from './Data';
import { Alerts } from './Alerts';
import { ScrollToTop } from '@corratech/scroll-to-top';
import './MyAccount.less';
import { SavedCards } from './SavedCards';
import { InvoicePrintPage } from './Orders/Print/InvoicePrintPage';
import { Returns } from "./Orders/Returns";
import { MyReturns, ReturnsDetailsPage } from './MyReturns';

export const MyAccount = props => {
    const { authState } = useContext(AuthStore);
    const history = useHistory();

    const {
        isB2B,
        accountLinks,
        b2bAccountLinks,
        SuccessIco,
        WarningIco,
        ErrorIco,
        redirectOnSignout,
        redirectLink,
        configProductAddToCartGraphql,
        simpleProductAddToCartGraphql,
        addressValidationName,
        orderTitle,
        addressTitle,
        newsletterTitle,
        savedCardsTitle,
        returnsPageTitle,
        myReturnsTitle
    } = props;
    //Check if it should render the b2b links along with the b2c lnks
    const links = isB2B ? b2bAccountLinks : accountLinks;
    const [t] = useTranslation();

    /**
     * Redirect to homepage for non authenicated
     * users
     */
    useEffect(() => {
        if (redirectOnSignout && !authState.token) history.push(redirectLink);
    }, [authState]);

    return (
        <Switch>
            <ScrollToTop>
                <AlertProvider>
                    {isSignedIn() ? (
                        <div className={`myaccount-wrap container-width`}>
                            <MyAccountNavigation
                                items={links}
                                newsletterTitle={newsletterTitle}
                            />

                            <div className={'myaccount-content'}>
                                <Alerts
                                    SuccessIco={SuccessIco}
                                    WarningIco={WarningIco}
                                    ErrorIco={ErrorIco}
                                />
                                <Route
                                    exact
                                    path="/my-account"
                                    component={() => (
                                        <Dashboard
                                            configProductAddToCartGraphql={
                                                configProductAddToCartGraphql
                                            }
                                            simpleProductAddToCartGraphql={
                                                simpleProductAddToCartGraphql
                                            }
                                            addressTitle={addressTitle}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path="/my-account/address"
                                    component={() => (
                                        <AddressBook
                                            addressValidationName={
                                                addressValidationName
                                            }
                                            addressTitle={addressTitle}
                                        />
                                    )}
                                />
                                <Route
                                    key="edit-address"
                                    exact
                                    path="/my-account/address/edit/:id"
                                    component={() => (
                                        <NewAddressForm
                                            addressValidationName={
                                                addressValidationName
                                            }
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path="/my-account/orders/"
                                    component={() => (
                                        <Orders
                                            warningIco={WarningIco}
                                            configProductAddToCartGraphql={
                                                configProductAddToCartGraphql
                                            }
                                            simpleProductAddToCartGraphql={
                                                simpleProductAddToCartGraphql
                                            }
                                            orderTitle={orderTitle}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path="/my-account/newsletter"
                                    component={() => (
                                        <Newsletter
                                            newsletterTitle={newsletterTitle}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path="/my-account/address/new"
                                    component={() => (
                                        <NewAddressForm
                                            addressValidationName={
                                                addressValidationName
                                            }
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path="/my-account/wishlist"
                                    component={Wishlist}
                                />
                                <Route
                                    exact
                                    path="/my-account/wishlist/:addedItem"
                                    component={Wishlist}
                                />
                                <Route
                                    exact
                                    path="/my-account/wishlist/:addedItem/:id"
                                    component={Wishlist}
                                />
                                <Route
                                    exact
                                    path="/my-account/wishlist/share/id/:id"
                                    component={ShareWishlist}
                                />
                                <Route
                                    exact
                                    path="/my-account/requisition-lists"
                                    component={RequisitionList}
                                />
                                <Route
                                    exact
                                    path="/my-account/requisition-list/:id"
                                    component={RequisitionItems}
                                />
                                <Route
                                    exact
                                    path="/my-account/requisition-list/:id/:flag"
                                    component={RequisitionItems}
                                />
                                <Route
                                    exact
                                    path="/my-account/order-by-sku"
                                    component={OrderBySku}
                                />
                                <Route
                                    exact
                                    path="/my-account/account-information"
                                    component={AccountInformation}
                                />
                                <Route
                                    exact
                                    path="/my-account/account-information/:flag"
                                    component={AccountInformation}
                                />
                                <Route
                                    exact
                                    path="/my-account/store-credit/"
                                    component={StoreCredit}
                                />
                                <Route
                                    exact
                                    path="/my-account/gift-card/"
                                    component={GiftCard}
                                />
                                <Route
                                    exact
                                    path="/my-account/saved-cards/"
                                    component={() => (
                                        <SavedCards
                                            savedCardsTitle={savedCardsTitle}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path="/my-account/orders/view/:orderId"
                                    component={() => (
                                        <OrderDetailsPage
                                            configProductAddToCartGraphql={
                                                configProductAddToCartGraphql
                                            }
                                            simpleProductAddToCartGraphql={
                                                simpleProductAddToCartGraphql
                                            }
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path="/my-account/orders/print/:orderId"
                                    component={OrderDetailsPrintPage}
                                />
                                <Route
                                    exact
                                    path="/my-account/invoice/print/:orderId"
                                    component={InvoicePrintPage}
                                />
                                <Route
                                    exact
                                    path="/my-account/orders/returns/:orderId"
                                    component={() => (
                                        <Returns
                                            returnsPageTitle={returnsPageTitle}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path="/my-account/my-returns/"
                                    component={() => (
                                        <MyReturns
                                            myReturnsTitle={myReturnsTitle}
                                        />
                                    )}
                                />
                                <Route
                                    exact
                                    path="/my-account/returns/view/:returnId"
                                    component={ReturnsDetailsPage}
                                />
                            </div>
                        </div>
                    ) : (
                        <p className={'login-info'}>
                            {t('Please login to continue')}
                        </p>
                    )}
                </AlertProvider>
            </ScrollToTop>
        </Switch>
    );
};

MyAccount.propTypes = {
    isB2B: bool,
    accountLinks: array,
    b2bAccountLinks: array,
    SuccessIco: node,
    WarningIco: node,
    ErrorIco: node,
    redirectOnSignout: bool,
    redirectLink: string,
    orderTitle: string,
    addressTitle: string,
    newsletterTitle: string,
    savedCardsTitle: string,
    returnsPageTitle: string,
    myReturnsTitle: string
};

MyAccount.defaultProps = {
    isB2B: false,
    accountLinks: ACCOUNT_LINKS,
    b2bAccountLinks: B2B_ACCOUNT_LINKS,
    redirectOnSignout: false,
    redirectLink: '/',
    orderTitle: 'My Orders',
    addressTitle: 'Address Book',
    newsletterTitle: 'Newsletter Subscriptions',
    savedCardsTitle: 'Saved Cards',
    returnsPageTitle: 'Create New Return',
    myReturnsTitle: 'My Returns'
};
