#1.9.8-dev.3

-   Added Google invisible reCAPTCHA V3 in registration and forgotpassword form

#1.9.8

-   When guest user logs in after clicking on wishlist button, item is added after auth
-   Fixed AccountFormLink memory leak

#1.9.7

-   Removed the dot at the end of the sentence (`successTextBeforeEmail`)

#1.9.6

-   Closing login/registration slider after redirected to policy page.

#1.9.5

-   Changed react-icons to react-feather

#1.9.4

-   Updated readme

#1.9.3

-   Updated readme
-   Changed default persistence to 1 hour to match the Magento Backend Default

#1.9.2

-   Updated ReLogin form

#1.9.1

-   Removed `defaultToken` prop.
-   Added `EyeIcon` prop with default prop.
-   Added `EyeOffIcon` with default prop.

#1.8.23

-   Published old, correct version over bad version

#1.8.15

-   Added `showKeepMeSignedIn` in account form which is given a default value false. It should be set to true to see the "Keep me signed in" checkbox.
-   Added `defaultToken` which will set a default value for user who have not checked the "Keep me signed in" button.

#1.8.12

-   Added the dot at the end of errors messages.

#1.8.11

-   Fixed auto open `ResetPasswordForm` when you reset password by following the link
-   Removed `validateOnBlur` in login form for a password field. When You click on the Forgot password link the first time it doesn't take you to the next page and shows "this field is required"
