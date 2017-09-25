/* Key owner : Tom Solacroup */
var GStaticMapsKey = "AIzaSyDkopOaAfNpTcySf81Ji_hk9qUHDe7rHVQ";

var isScanning = false;
var pos;

$(window).on('load',function(){
    $("#loading").fadeOut();
});

$('#geolocBtn').click(function(){
    $('#geolocBtn').prop('disabled', true);
    $('#geolocBtn').html('Géolocalisation en cours...')
    navigator.geolocation.watchPosition(geo_success, geo_error, {enableHighAccuracy:true, maximumAge:3000, timeout:27000});
});

function geo_success(position){
    $('#geolocBtn').prop('disabled', true);
    $('#geolocBtn').html('Géolocalisation activée')
    $('#collapseOne').collapse();
    pos = position;
}

function geo_error(error){
    $('#geolocBtn').prop('disabled', false);
    $('#geolocBtn').html('Activer la géolocalisation')
    alert("Echec de la géolocalisation");
}

$('#personBtn').click(function(){
    if(pos){
        // Request parameters
        var params = {
            "name": $('#personInput').val(),
            "latitude": pos.coords.latitude,
            "longitude": pos.coords.longitude,
            "range": 5000 //range (in meters?)
        };
        displayModal(params);
    }
    else console.log("No geoloc available.");
});

$('#personInput').keypress(function (e) {
 var key = e.which;
 if(key == 13)  // the enter key code
  {
    $('#personBtn').click();
    return false;  
  }
});
$('#phoneInput').keypress(function (e) {
 var key = e.which;
 if(key == 13)  // the enter key code
  {
    $('#phoneBtn').click();
    return false;  
  }
});

$('#phoneBtn').click(function(){
    var params = {
        // Request parameters
        "phoneNumber": $('#phoneInput').val()
    };
    displayModal(params);
});

/* old Ocp-Apim-Subscription-Key Locpin :   09a3083ac93e4a17a69a780b04f71875 */
/* old url Locpin : "https://locpinpartnertest.azure-api.net/Delivery/api/Locpins?" */
/* Key owner : Hervé Marimbordes */
function displayModal(params){
    $('#infosModal').modal('show');
    $.ajax({
        url: "https://locpin.azure-api.net/Delivery/api/Locpins?" + $.param(params),
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","6d1732a7d7e44850a07c8d7f0c30118d");
        },
        type: "GET"
    })
    .done(function(data) {
        if(data.locpins.length < 1){
            $('#modalBody').html('<p>Aucun Locpin correspondant aux détails fournis.</p>');
        }
        else {
            $('#modalBody').html('<div id="locpinList" class="list-group"></div>');
            for(var i=0; i<data.locpins.length;i++){
                var gpsCoordinates = data.locpins[i].latitude + ',' + data.locpins[i].longitude;
                w = Math.floor($(window).width() * 0.9);
                h = Math.floor($(window).height() * 0.9);

                //Add this at the end of the string to pinpoint the postal adress
                //+ '&markers=label:L%7C' + gpsCoordinates + '&markers=size:mid%7Ccolor:0xf7ea85%7Clabel:P%7C' + data.locpins[i].line4 + ' ' + data.locpins[i].postCode
                var imgsrc = 'http://maps.googleapis.com/maps/api/staticmap?zoom=18&maptype=satellite&size='+w+'x'+h+'&key=' + GStaticMapsKey + '&markers=label:L%7C' + gpsCoordinates;
                
                $('#locpinList').append(
                    '<dl class="dl-horizontal list-group-item">\
                        <address>\
                          '+
                          //here are some dank ternaries
                          (data.locpins[i].line1?('<strong>'+data.locpins[i].line1+'</strong><br>'):'')+'\
                          '+(data.locpins[i].line2?(data.locpins[i].line2+' '+data.locpins[i].line3+'<br>'):'')+'\
                          '+(data.locpins[i].line4?(data.locpins[i].line4+'<br>'):'')+'\
                          '+(data.locpins[i].postCode?(data.locpins[i].postCode+' '+data.locpins[i].city+'<br>'):'')+'\
                        </address>\
                        <dt>Latitude, Longitude</dt>\
                        <dd> ' + data.locpins[i].latitude + ', ' + data.locpins[i].longitude + '<br/>\
                            <!-- Standard button -->\
                            <div class="btn-group" role="group">\
                                '+ createNavigationLink(gpsCoordinates) +'\
                                <a href="'+imgsrc+'" target="_blank" id="satelliteViewBtn" type="button" class="btn btn-default"><span class="glyphicon glyphicon-road"></span> Carte</a>\
                            </div>\
                        </dd>\
                        <dt>Labels</dt>\
                        <dd>' + data.locpins[i].labels + '</dd>\
                        <dt>Note</dt>\
                        <dd>' + data.locpins[i].note + '</dd>\
                        <dt>Voisin</dt>\
                        <dd>' + data.locpins[i].preferredNeighbour + '</dd>\
                    </dl>'          
                );
            }
        }
    })
    .fail(function(data) {
        $('#infosModal').modal('hide');
        if(data.status == 400)
        {
            alert("Mauvaise requete. Spécifiez un numéro de téléphone, un nom ou une adresse e-mail.");
        }
        else alert("Impossible de contacter les serveurs Locpin.");
    });
}

$('#scanModal').on('hidden.bs.modal', function () {
    isScanning = false;
    Quagga.stop();
    $('#quaggaDiv').html("");
})

$('#infosModal').on('hidden.bs.modal', function () {
    $('#modalBody').html('<img src="assets/img/ajax-loader.gif" style="width: 10%; display: block; margin: 0 auto;"/>');
})

function createNavigationLink(gpsCoordinates){
    //Use Geo URI on Android to enable use with multiple apps.
    //For other platforms, the Apple interface should redirect most devices to their most appropriate app or website (ie Apple Maps for iOS, Bing for Windows Phone...)
    var elementWithGeoURI = '<a href="geo:' + gpsCoordinates + "?q=" + gpsCoordinates + '" type="button" class="btn btn-default"><span class="glyphicon glyphicon-map-marker"></span> Navigation</a>'
    var elementWithAppleURI = '<a href="https://maps.apple.com/?q=' + gpsCoordinates + '" type="button" class="btn btn-default"><span class="glyphicon glyphicon-map-marker"></span> Navigation</a>'
    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1;
    if(isAndroid) {
      return elementWithGeoURI;
    }
    else return elementWithAppleURI;

    //IMPORTANT: About the maps.apple.com link for the "Navigation" button!
                    //This is an interface provided by Apple that should launch your device's native maps app.
                    //The downside is that you can't choose between multiple installed maps apps (choosing between Google Maps, Waze, Uber... on click)
}

// $('#quaggaBtn').click(function(){
//     $('#scanModal').modal('show');
//     Quagga.init({
//         inputStream : {
//           name : "Live",
//           type : "LiveStream",
//           target: document.querySelector('#quaggaDiv')    // Or '#yourElement' (optional)
//         },
//         decoder : {
//           readers : ["ean_reader"]
//         },
//         debug: {
//           drawBoundingBox: true,
//           showFrequency: true,
//           drawScanline: true,
//           showPattern: true
//         },
//         multiple: true
//       }, function(err) {
//           if (err) {
//               console.log(err);
//               return
//           }
//           console.log("Initialization finished. Ready to start");
//           isScanning = true;
//           Quagga.start();
//     });

//     Quagga.onProcessed(function(result) {
//         var drawingCtx = Quagga.canvas.ctx.overlay,
//             drawingCanvas = Quagga.canvas.dom.overlay;

//         if (result) {
//             if (result.boxes) {
//                 drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
//                 result.boxes.filter(function (box) {
//                     return box !== result.box;
//                 }).forEach(function (box) {
//                     Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
//                 });
//             }

//             if (result.box) {
//                 Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
//             }

//             if (result.codeResult && result.codeResult.code) {
//                 Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
//             }
//         }
//     });

//     Quagga.onDetected(function(result) {
//         var code = result.codeResult.code;
//         alert(code);
//     });
// });
