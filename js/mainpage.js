// Quagga.init({
//     inputStream : {
//       name : "Live",
//       type : "LiveStream",
//       target: document.querySelector('#yourElement')    // Or '#yourElement' (optional)
//     },
//     decoder : {
//       readers : ["code_128_reader"]
//     }
//   }, function(err) {
//       if (err) {
//           console.log(err);
//           return
//       }
//       console.log("Initialization finished. Ready to start");
//       Quagga.start();
//   });

/* Key owner : Tom Solacroup */
var GStaticMapsKey = "AIzaSyDkopOaAfNpTcySf81Ji_hk9qUHDe7rHVQ";

var isScanning = false;
var pos;

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
            // "range": "{integer}",
        };
        displayModal(params);
    }
    else console.log("No geoloc available.");
});

$('#phoneBtn').click(function(){
    var params = {
        // Request parameters
        "phoneNumber": $('#phoneInput').val()
    };
    displayModal(params);
});


function displayModal(params){
    $('#infosModal').modal('show');
    $.ajax({
        url: "https://locpinpartnertest.azure-api.net/Delivery/api/Locpins?" + $.param(params),
        beforeSend: function(xhrObj){
            // Request headers
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","09a3083ac93e4a17a69a780b04f71875");
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

                //add + '&markers=label:L%7C' + gpsCoordinates + '&markers=size:mid%7Ccolor:0xf7ea85%7Clabel:P%7C' + data.locpins[i].line4 + ' ' + data.locpins[i].postCode at the end to pinpoint the postal adress
                var imgsrc = 'http://maps.googleapis.com/maps/api/staticmap?zoom=18&maptype=satellite&size='+w+'x'+h+'&key=' + GStaticMapsKey + '&markers=label:L%7C' + gpsCoordinates;
                
                $('#locpinList').append(
                    '<dl class="dl-horizontal list-group-item">\
                        <address>\
                          '+(data.locpins[i].line1?('<strong>'+data.locpins[i].line1+'</strong><br>'):'')+'\
                          '+(data.locpins[i].line2?(data.locpins[i].line2+' '+data.locpins[i].line3+'<br>'):'')+'\
                          '+(data.locpins[i].line4?(data.locpins[i].line4+'<br>'):'')+'\
                          '+(data.locpins[i].postCode?(data.locpins[i].postCode+' '+data.locpins[i].city+'<br>'):'')+'\
                        </address>\
                        <dt>Latitude, Longitude</dt>\
                        <dd> ' + data.locpins[i].latitude + ', ' + data.locpins[i].longitude + '<br/>\
                            <!-- Standard button -->\
                            <div class="btn-group" role="group">\
                                <a href="geo:' + gpsCoordinates + "?q=" + gpsCoordinates + '" type="button" class="btn btn-default"><span class="glyphicon glyphicon-map-marker"></span> Navigation</a>\
                                <!--<a href="http://maps.googleapis.com/maps/api/streetview?size=320x240&key=' + GStaticMapsKey + '&location=' + gpsCoordinates + "?q=" + gpsCoordinates + '" type="button" class="btn btn-default"><span class="glyphicon glyphicon-picture"></span> Photo proche</a>-->\
                                <a href="'+imgsrc+'" target="_blank" id="satelliteViewBtn" type="button" class="btn btn-default"><span class="glyphicon glyphicon-road"></span> Carte</a>\
                            </div>\
                        </dd>\
                        <dt>Labels</dt>\
                        <dd>' + data.locpins[i].labels + '</dd>\
                        <dt>Note</dt>\
                        <dd>' + data.locpins[i].note + '</dd>\
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

$('#quaggaBtn').click(function(){
    $('#scanModal').modal('show');


    Quagga.init({
        inputStream : {
            name : "Live",
            type : "LiveStream",
            target: document.querySelector('#quaggaDiv')    // Or '#yourElement' (optional)
            // constraints: {
            //     width: {max: 320},
            //     height: {max: 240}
            // }
        },
        decoder : {
          readers : ["ean_reader"]
        },
        debug: {
          drawBoundingBox: true,
          showFrequency: true,
          drawScanline: true,
          showPattern: true
        },
        multiple: true
      }, function(err) {
          if (err) {
              console.log(err);
              return
          }
          console.log("Initialization finished. Ready to start");
          isScanning = true;
          Quagga.start();
    });

    Quagga.onProcessed(function(result) {
        var drawingCtx = Quagga.canvas.ctx.overlay,
        drawingCanvas = Quagga.canvas.dom.overlay;

        if (result) {
            if (result.boxes) {
                drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                result.boxes.filter(function (box) {
                    return box !== result.box;
                }).forEach(function (box) {
                    Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
                });
            }

            if (result.box) {
                Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
            }

            if (result.codeResult && result.codeResult.code) {
                Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
            }
        }
    });

    Quagga.onDetected(function(result) {
        var code = result.codeResult.code;
        alert(code);
    });
    
});