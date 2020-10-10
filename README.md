# ti.googlepay

<img src="https://pay.google.com/about/static_kcs/images/logos/google-pay-logo.svg" width=100/>

Axway Titanium Hyperloop module for GooglePay

## Installation

1. Enable `hyperloop` module in `tiapp.xml`
2. Copy `ti.googlepay.js` into `app/lib` folder.
3. Add dependency in `app/platform/android/gradle.build`
    ```
    dependencies {
        implementation 'com.google.android.gms:play-services-wallet:18.0.0'
    }
    ```
4. (optional) If you want to use `Pay with GPay` button, copy [assets](https://developers.google.com/pay/api/download-assets/android/Google-Pay-Payment-Buttons.zip) from [brand guideline page](https://developers.google.com/pay/api/android/guides/brand-guidelines?hl=en) into `app/platform/android/res`


## Methods

- `createGooglePayButton`(options) - returns `Ti.UI.View` with GooglePay inside.
    - options - any `Ti.UI.View` properties

        options.layout: `googlepay_button`, `pay_with_googlepay_button`

- `createPaymentsClient`(options, callback) - returns
`paymentClient`
    - options

        options.enviorment: `ENVIRONMENT_TEST`, `ENVIRONMENT_PROD`

        options.theme: `THEME_LIGHT`, `THEME_DARK`

    ```js
    const googlepay = require('ti.googlepay');

    const gpay = googlepay.getPaymentsClient({
        environment: "ENVIRONMENT_TEST",
        theme: "THEME_LIGHT"
    });
    ```

`paymentClient` methods:
- `isReadyToPay`(options, callback)

    - options - [isReadyToPayRequest](https://developers.google.com/pay/api/android/reference/request-objects?hl=ru#IsReadyToPayRequest)

    ```js
    gpay.isReadyToPay({
        allowedPaymentMethods: ['PAYMENT_METHOD_CARD', 'PAYMENT_METHOD_TOKENIZED_CARD']
    }, function(e) {
        if (e.success) {
            //Show GPay button
        }
    });
    ```

- `makePayment`(options, callback)
    
    - options - [paymentDataRequest](https://developers.google.com/pay/api/android/reference/request-objects?hl=ru#PaymentDataRequest)

    ```js
    gpay.makePayment({
        apiVersion: 2,
        apiVersionMinor: 0,
        merchantInfo: {
            merchantName: "Example Merchant"
        },
        allowedPaymentMethods: [
            {
                type: "CARD",
                parameters: {
                    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                    allowedCardNetworks: ["MASTERCARD", "VISA"]
                },
                tokenizationSpecification: {
                    type: "PAYMENT_GATEWAY",
                    parameters: {
                        gateway: "exmpleGateway",
                        gatewayMerchantId: "exampleGatewayMerchantId"
                    }
                }
            }
        ],
        transactionInfo: {
            totalPriceStatus: "FINAL",
            totalPrice: "12.34",
            currencyCode: "USD"
        }
    }, function(e) {
        if (e.success) {
            console.log(e.result);
        } else {
            alert(e.error);
        }
    });
    ```
