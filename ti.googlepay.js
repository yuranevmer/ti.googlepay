import Activity from 'android.app.Activity';
import AutoResolveHelper from 'com.google.android.gms.wallet.AutoResolveHelper';
import IsReadyToPayRequest from 'com.google.android.gms.wallet.IsReadyToPayRequest';
import OnCompleteListener from 'com.google.android.gms.tasks.OnCompleteListener';
import PaymentData from 'com.google.android.gms.wallet.PaymentData';
import PaymentDataRequest from 'com.google.android.gms.wallet.PaymentDataRequest';
import Wallet from 'com.google.android.gms.wallet.Wallet';
import WalletConstants from 'com.google.android.gms.wallet.WalletConstants';
import TiApplication from 'org.appcelerator.titanium.TiApplication';
import TiBaseActivity from 'org.appcelerator.titanium.TiBaseActivity';
import OnActivityResultEvent from 'org.appcelerator.titanium.TiLifecycle.OnActivityResultEvent';
import OnClickListener from 'android.view.View.OnClickListener';
import Context from 'android.content.Context';
import Inflater from 'android.view.LayoutInflater';

module.exports = {
	createGooglePayButton(options = {}) {
		const activity = new Activity(Ti.Android.currentActivity);
		const inflater = Inflater.cast(activity.getApplicationContext().getSystemService(Context.LAYOUT_INFLATER_SERVICE));
		// Load the "main_content.xml" from [app]/platform/android/res/layout/
		// This can also be used for other kind of resources, like images, colors and values
		const resId = activity.getResources().getIdentifier(options.layout || 'googlepay_button', 'layout', activity.getPackageName());
		const button = inflater.inflate(resId, null);
		const container = Ti.UI.createView(options);
		const inner = Ti.UI.createView({ top: -3, left: -3, bottom: -3, right: -3 });
		button.setOnClickListener(new OnClickListener({
			onClick: () => container.fireEvent("click", { type: "click", source: container })
		}));
		inner.add(button);
		container.add(inner);
		return container;
	},
	getPaymentsClient(options = {}) {
		const paymentsClientOptions = new Wallet.WalletOptions.Builder()
			.setEnvironment(WalletConstants[options.enviorment || "ENVIRONMENT_TEST"])
			.setTheme(WalletConstants[options.theme || "THEME_LIGHT"])
			.build();
		const paymentsClient = Wallet.getPaymentsClient(Titanium.Android.currentActivity, paymentsClientOptions);

		return {
			isReadyToPay(options = {}, cb) {
				const isReadyRequest = IsReadyToPayRequest.fromJson(JSON.stringify(options));
				paymentsClient
					.isReadyToPay(isReadyRequest)
					.addOnCompleteListener(new OnCompleteListener({
						onComplete: function(e) {
							cb({ success: e.isSuccessful() });
						}
					}));
			},
			makePayment(options = {}, cb) {
				const activity = TiBaseActivity.cast(TiApplication.getAppCurrentActivity());
				const LOAD_PAYMENT_DATA_REQUEST_CODE = activity.getUniqueResultCode();
				activity.addOnActivityResultListener(new OnActivityResultEvent({
					onActivityResult: function(context, requestCode, resultCode, data) {
						if (requestCode == LOAD_PAYMENT_DATA_REQUEST_CODE) {
							switch (resultCode) {
							case Activity.RESULT_OK:
								const result = PaymentData.getFromIntent(data).toJson();
								cb({ success: true, result });
								break;
							case Activity.RESULT_CANCELED:
								// Nothing to here normally - the user simply cancelled without selecting a
								// payment method.
								break;
							case AutoResolveHelper.RESULT_ERROR:
								const status = AutoResolveHelper.getStatusFromIntent(data);
								cb({ error: status.getStatusCode() });
								break;
							}
						}
					}
				}));
				const request = PaymentDataRequest.fromJson(JSON.stringify(options));
				AutoResolveHelper.resolveTask(paymentsClient.loadPaymentData(request), activity, LOAD_PAYMENT_DATA_REQUEST_CODE);
			}
		};
	}
};
