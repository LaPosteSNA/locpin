$(function() {
    var App = {
        init: function() {
            App.attachListeners();
        },
        attachListeners: function() {
            var self = this;

            $("#photoBtn").on("change", function(e) {
                if (e.target.files && e.target.files.length) {
                    App.decode(URL.createObjectURL(e.target.files[0]));
                }
            });
        },
        _accessByPath: function(obj, path, val) {
            var parts = path.split('.'),
                depth = parts.length,
                setter = (typeof val !== "undefined") ? true : false;

            return parts.reduce(function(o, key, i) {
                if (setter && (i + 1) === depth) {
                    o[key] = val;
                }
                return key in o ? o[key] : {};
            }, obj);
        },
        _convertNameToState: function(name) {
            return name.replace("_", ".").split("-").reduce(function(result, value) {
                return result + value.charAt(0).toUpperCase() + value.substring(1);
            });
        },
        detachListeners: function() {
            $("#photoBtn").off("change");
        },
        decode: function(src) {
            var self = this,
                config = $.extend({}, self.state, {src: src});

            Quagga.decodeSingle(config, function(result) {});
        },
        setState: function(path, value) {
            var self = this;

            if (typeof self._accessByPath(self.inputMapper, path) === "function") {
                value = self._accessByPath(self.inputMapper, path)(value);
            }

            self._accessByPath(self.state, path, value);

            console.log(JSON.stringify(self.state));
            App.detachListeners();
            App.init();
        },
        inputMapper: {
            inputStream: {
                size: function(value){
                    return parseInt(value);
                }
            },
            numOfWorkers: function(value) {
                return parseInt(value);
            },
            decoder: {
                readers: function(value) {
                    if (value === 'ean_extended') {
                        return [{
                            format: "ean_reader",
                            config: {
                                supplements: [
                                    'ean_5_reader', 'ean_2_reader'
                                ]
                            }
                        }];
                    }
                    return [{
                        format: value + "_reader",
                        config: {}
                    }];
                }
            }
        },
        state: {
            inputStream: {
                size: 800,
                singleChannel: false
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            decoder: {
                readers: [{
                            format: "ean_reader",
                            config: {
                                //enable the supplements for ean-extended reader
                                //
                                // supplements: [
                                //     'ean_5_reader', 'ean_2_reader'
                                // ]
                            }
                        }]
            },
            locate: true,
            src: null
        }
    };

    App.init();

    function calculateRectFromArea(canvas, area) {
        var canvasWidth = canvas.width,
            canvasHeight = canvas.height,
            top = parseInt(area.top)/100,
            right = parseInt(area.right)/100,
            bottom = parseInt(area.bottom)/100,
            left = parseInt(area.left)/100;

        top *= canvasHeight;
        right = canvasWidth - canvasWidth*right;
        bottom = canvasHeight - canvasHeight*bottom;
        left *= canvasWidth;

        return {
            x: left,
            y: top,
            width: right - left,
            height: bottom - top
        };
    }

    Quagga.onProcessed(function(result) {
        //you can put some code here to draw shapes, which can help debugging things out

    //     var drawingCtx = Quagga.canvas.ctx.overlay,
    //         drawingCanvas = Quagga.canvas.dom.overlay,
    //         area;

    //     if (result) {
    //         if (result.boxes) {
    //             drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
    //             result.boxes.filter(function (box) {
    //                 return box !== result.box;
    //             }).forEach(function (box) {
    //                 Quagga.ImageDebug.drawPath(box, {x: 0, y: 1}, drawingCtx, {color: "green", lineWidth: 2});
    //             });
    //         }

    //         if (result.box) {
    //             Quagga.ImageDebug.drawPath(result.box, {x: 0, y: 1}, drawingCtx, {color: "#00F", lineWidth: 2});
    //         }

    //         if (result.codeResult && result.codeResult.code) {
    //             Quagga.ImageDebug.drawPath(result.line, {x: 'x', y: 'y'}, drawingCtx, {color: 'red', lineWidth: 3});
    //         }

    //         if (App.state.inputStream.area) {
    //             area = calculateRectFromArea(drawingCanvas, App.state.inputStream.area);
    //             drawingCtx.strokeStyle = "#0F0";
    //             drawingCtx.strokeRect(area.x, area.y, area.width, area.height);
    //         }
    // }
    });

    Quagga.onDetected(function(result) {
        console.log(result.codeResult.code);
        $("#barcode").text(result.codeResult.code);
        clearFileInput(document.getElementById("photoBtn"));
    }); 
});

function clearFileInput(ctrl) {
  try {
    ctrl.value = null;
  } catch(ex) { }
  if (ctrl.value) {
    ctrl.parentNode.replaceChild(ctrl.cloneNode(true), ctrl);
  }
}