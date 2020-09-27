export function getCurrencySymbol(code) {
    var currencySymbol;
    //TODO: Use this switch-case to add international currency support
    switch (code) {
        case 'USD':
            currencySymbol = '$';
            break;
        default:
            currencySymbol = '$';
            break;
    }
    return currencySymbol;
}
