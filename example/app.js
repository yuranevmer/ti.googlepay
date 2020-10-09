var googlepay = require("ti.googlepay");

var win = Ti.UI.createWindow({
    backgroundColor: "white"
});

win.open();

var gpay = googlepay.getPaymentsClient({
    environment: "ENVIRONMENT_TEST"
});
gpay.isReadyToPay({
    allowedPaymentMethods: ['PAYMENT_METHOD_CARD', 'PAYMENT_METHOD_TOKENIZED_CARD']
}, function(e) {
    if (e.success) {
        var button = googlepay.createGooglePayButton({
            width: '60%',
            height: 44,
            bottom: 50,
            layout: 'buy_with_google_pay_button'
        });
        button.addEventListener('click', makePayment);
        win.add(button);
    }
});

function makePayment() {
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
            //send data to backend
        } else {
            alert(e.error);
        }
    });
}
