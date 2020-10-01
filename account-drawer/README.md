# Account Drawer

Exports
`<AccountForm />, <SignedInDropDown />, <SlideSteps />, <ForgotPasswordForm />, <ArrowLeft />, <LoginForm/>, <ReLoginForm />, <RegisterForm />, <ResetPasswordForm />`

**Note: to enable "Keep me signed in", pass `showKeepMeSignedIn={true}` to AccountForm AND CorraContextProvider**

**For the Admin Panel setting to control the "Keep me Signed In" persistence time, persistent_life_time token should be added to the store config query, and the correct backend extension should be added to fetchStaticData query**.

Another option to control this without backend dependency is to add the code below to the project config. **The Admin Panel setting for token lifetime must be the same or greater than this value** when converted to the same units. This setting can be found in Admin -> Stores -> Configuration -> OAuth -> Access Token Expiration -> Customer Token Lifetime

```js
module.exports = {
    ...
    account-drawer: {
        persistent_life_time: VALUE_IN_SECONDS
    },
    ...
}
```

If neither of those are added, "Keep me Signed In" will default to 1 hour.

##Usage

**AccountForm**

Usually the only component you need to use from this package. A component which renders the login/register form in a dropdown for guests, and the account nav links as a dropdown for a registered user.

```js
// In Header.js
const sampleAccountLinksConfig = [
    {
        label: t('My Account'),
        link: '/my-account'
    },
    {
        label: t('My Orders'),
        link: '/my-account/orders/'
    },
    {
        label: t('My Wishlist'),
        link: '/my-account/wishlist/'
    },
    {
        label: t('Store Credit'),
        link: '/my-account/store-credit/'
    }
];

<AccountForm myAccountLinksConfig={sampleAccountLinksConfig} />;
```

| **Account Form**         |          |               |                  |                                                                                                                                        |
| ------------------------ | -------- | ------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Prop Name**            | **type** | **required?** | **default**      | **info**                                                                                                                               |
| showKeepMeSignedIn       | boolean  | no            | false            | This will show/hide the "Keep me Signed In" feature. Please see the note above on how to control the persistence time of this feature. |
| displayLabelSignedUser   | string   | no            | "Account"        | Dropdown label when signed in.                                                                                                         |
| displayLabelGuestUser    | string   | no            | "Account"        | Dropdown label when signed out f showing.                                                                                              |
| myAccountLinksConfig     | object   | yes           | sample above     | Links to show in signed-in dropdown                                                                                                    |
| submitButtonText         | string   | no            | "Create Account" | Default text for the Create Account button                                                                                             |
| showSubTitle             | boolean  | no            | false            | Determines whether or not to show the Subtitle on "Forgot Password"                                                                    |
| termsAndConditionsHandle | function | no            |                  | sets action on click of "View Terms and Conditions" For example, can be used to show a modal with T&C                                  |
| hideLinkAfterLoggedIn    | boolean  | no            | false            | Hides the dropdown after sign-in                                                                                                       |
| SuccessIcon\*            | object   | no            |                  | Rendered Component like <Icon>: shown on successful account creation                                                                   |
| ErrorIcon                | object   | no            |                  | Rendered Component like <Icon>: shown on error in account creation                                                                     |

**ForgotPasswordForm**

Provides customer with a possibility to change password

```
<ForgotPasswordForm
    updateEmail={updateEmail}
    enteredEmail={email}
    signInClick={signInClick}
    SuccessIcon={SuccessIcon}
    ErrorIcon={ErrorIcon}
    showSubTitle={props.showSubTitle}
/>
```

|  **props**   | **type**  | **required/default** |         **info**          |
| :----------: | :-------: | :------------------: | :-----------------------: |
| updateEmail  |   func    |       required       | function to update email  |
| enteredEmail |  string   |       required       | email entered by customer |
| signInClick  |   func    |       required       |                           |
| SuccessIcon  | component |       default        |   default success icon    |
|  ErrorIcon   | component |       default        |    default error icon     |

**LoginForm**

Helps the user to Log In

```
<LoginForm
    requiredText={requiredText}
    invalidEmailText={invalidEmailText}
    EyeIcon={EyeIcon}
    EyeOffIcon={EyeOffIcon}
/>
```

|    **props**     | **type**  | **required/default** | **info** |
| :--------------: | :-------: | :------------------: | :------: |
|   requiredText   |  string   |       required       |          |
| invalidEmailText |  string   |       required       |          |
|     EyeIcon      | component |       default        |          |
|    EyeOffIcon    | component |       default        |          |

**RegisterForm**

Helps the user to Register

```
<RegisterForm
    termsAndConditionsHandle = {termsAndConditionsHandle}
    newsletterSubscriptionHandle = {newsletterSubscriptionHandle}
 />
```

**ReLoginForm**

Helps the user to login again.

**ResetPasswordForm**

Helps the user to reset password.

**GoogleRecaptcha V3 (Invisible)**
```
import { ReactGoogleRecaptchaV3 } from "@corratech/google-recaptcha-v3";
```
```
const [isCaptchaEnabled, setisCaptchaEnabled] = useState(false);
const [captchaIsValid, setCaptchaIsValid] = useState(false);
const [captchaInValidMsg, setCaptchaInValidMsg] = useState('Captcha validation error');
```
```
if (isCaptchaEnabled && !captchaIsValid){
            setNotification(
                'danger',
                t(captchaInValidMsg),
                1000000
            );
            return null;
        }
```
```
<ReactGoogleRecaptchaV3
      setCaptchaIsValid = {setCaptchaIsValid}
      recaptchaAction = 'customer_create'
      setCaptchaInValidMsg = {setCaptchaInValidMsg}
      setisCaptchaEnabled = {setisCaptchaEnabled}/>
```

|    **props**          | **type**  | **required/default** | **info**                           |
| :--------------:      | :-------: | :------------------: | :------:                           |
| setCaptchaIsValid     |  boolean  |       required       |  Check Captcha score and set varaible                                 |
| recaptchaAction       |  string   |       required       |  This is Captcha action, few set of values are allowed from magento admin (eg:customer_forgot_password,customer_login,customer_create)        |
| setCaptchaInValidMsg  |  string   |       default        |  Set Captcha validation message                                  |
| setisCaptchaEnabled   |  boolean  |       default        |  Check if captcha enable for given action                                   |

##Install

`yarn add @corratech/account-drawer`
