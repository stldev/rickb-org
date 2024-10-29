if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js').then(function (registration) {
            console.log('Service worker successfully registered on scope', registration.scope);
        }).catch(function (error) {
            console.log('Service worker failed to register', error);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // firebase.auth().onAuthStateChanged(user => { });
    // firebase.messaging().requestPermission().then(() => { });
    // firebase.storage().ref('/path/to/ref').getDownloadURL().then(() => { });

    firebase.database().ref('/rbbHeading').on('value', snapshot => {
        var rbbHeading = snapshot.val();
        if (rbbHeading && typeof rbbHeading === "string") {
            document.getElementById("rbbHeading").innerHTML = rbbHeading || "?";
        } else {
            console.log("hmm...what happened? snapshot.val() = ", snapshot.val());
        }
    });
});