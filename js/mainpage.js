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
var isScanning = false;

$('#phoneBtn').click(function(){
        $(function() {
        var params = {
            // Request parameters
            // "emailAddress": "{string}",
            "phoneNumber": $('#phoneInput').val()
            // "name": "{string}",
            // "postalAddress": "{string}",
            // "latitude": "{number}",
            // "longitude": "{number}",
            // "range": "{integer}",
        };
      
        $.ajax({
            url: "https://locpinpartnertest.azure-api.net/Delivery/api/Locpins?" + $.param(params),
            beforeSend: function(xhrObj){
                // Request headers
                xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key","09a3083ac93e4a17a69a780b04f71875");
            },
            type: "GET"
        })
        .done(function(data) {
            //alert("success");
            
            $('#modalBody').html('<div id="locpinList" class="list-group"></div>');
            for(var i=0; i<data.locpins.length;i++){
                var gpsCoordinates = data.locpins[i].latitude + ',' + data.locpins[i].longitude;
                $('#locpinList').append(
                    '<dl class="dl-horizontal list-group-item">\
                        <dt>Noms</dt>\
                        <dd>' + data.locpins[i].labels + '</dd>\
                        <dt>Latitude, Longitude</dt>\
                        <dd> ' + data.locpins[i].latitude + ', ' + data.locpins[i].longitude + '<br/>\
                            <!-- Standard button -->\
                            <a href="geo:' + gpsCoordinates + "?q=" + gpsCoordinates + '" type="button" class="btn btn-default"><span class="glyphicon glyphicon-map-marker"></span> Navigation</a>\
                        </dd>\
                        <dt>Note</dt>\
                        <dd>' + data.locpins[i].note + '</dd>\
                    </dl>'
                );
            }
            $('#infosModal').modal('show');
        })
        .fail(function(data) {
            if(data.status == 400)
            {
                alert("Mauvaise requete. Spécifiez un numéro de téléphone, un nom ou une adresse e-mail.");
            }
            else alert("Impossible de contacter les serveurs Locpin.");
        });
    });
});

$('#qaggaBtn').click(function(){
    if(isScanning){
        Qagga.stop();
    }
    else{
        Quagga.init({
            inputStream : {
              name : "Live",
              type : "LiveStream",
              target: document.querySelector('#qaggaDiv')    // Or '#yourElement' (optional)
            },
            decoder : {
              readers : ["ean_reader"]
            }
          }, function(err) {
              if (err) {
                  console.log(err);
                  return
              }
              console.log("Initialization finished. Ready to start");
              Quagga.start();
              isScanning = true;
        });
    }
});