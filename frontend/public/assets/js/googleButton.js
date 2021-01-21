function onSignIn(googleUser) {

    var id_token = googleUser.getAuthResponse().id_token;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/login/Google');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {

        backend = JSON.parse(xhr.responseText);
        if (backend.ok) {

            // save backend token returned
            var xhrSave = new XMLHttpRequest();
            xhrSave.open('POST', `/login/saveToken/${backend.token}`);
            xhrSave.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhrSave.onload = function() {

                frontend = JSON.parse(xhrSave.responseText);
                if (frontend.ok) {
                    document.location.href = '/';

                } else {

                    console.log('Error al ingresar. Token invalido');
                }
            }
            xhrSave.send();

        } else {

            console.log('Error al ingresar mientras conectaba con Google');
        }
    };
    xhr.send('idtoken=' + id_token);

}


function onSignInDashboard(googleUser) {

    var id_token = googleUser.getAuthResponse().id_token;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:3000/login/Google');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function() {

        backend = JSON.parse(xhr.responseText);

        if (!backend.ok) {
            document.location.href = '/';
        }
    };
    xhr.send('idtoken=' + id_token);
}

function signOut() {

    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function() {

        console.log('Saliendo...');

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/logout');
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onload = function() {

            frontend = JSON.parse(xhr.responseText);
            if (frontend.ok) {
                document.location.href = '/';
            }
        };
        xhr.send();

    });
}