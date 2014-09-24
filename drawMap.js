var myCanvas;
var myMouse;
var myGpsSource;

var upperLeftTileX,upperLeftTileY,lowerRightTileX,lowerRightTileY
var tileZoom,maxZoomLevel;
var upperLeftTilePixPosX,upperLeftTilePixPosY;
var upperLeftLat,upperLeftLon,lowerRightLat,lowerRightLon;

var changeHoldX,changeHoldY;
var drawChangePixelTreshold;
var effectiveDrawChangePixelTreshold;
var isNetworkActive;

var gpsPositionCalled = false;
var gpsPositionCalledContinuously = false
var gpsItemId = -1;

var myLoadedTilesList = new LoadedTilesList();
var myPinItemList = new PinItemList();

function initMap(){
    maxZoomLevel = 21;
    isNetworkActive = true;
    drawChangePixelTreshold = 10; // sayi azaldikca hareket basina cizim sayisi artar
    effectiveDrawChangePixelTreshold = drawChangePixelTreshold*drawChangePixelTreshold;

    var ayasofyaID = addItemToCoord("icons/map_pin.png",41.008492,28.980115,-32,-75 );
    var galataID = addItemToCoord("icons/map_pin.png",41.025628,28.974161,-32,-75 );
    //removeItemWithID(galataID);

    goToCenterCoord(41.027731,28.985281,13);
}

function motionHappened(motionX, motionY){
    var ctx = myCanvas.getContext("2d");
    ctx.clearRect(0,0,myCanvas.width,myCanvas.height);

    //console.log("loaded array lenght:",myLoadedTilesList.data_mysize,myLoadedTilesList.data.length);

    if (motionX > 0){ //move to right
        if(upperLeftTilePixPosX - motionX > -256){
            upperLeftTilePixPosX = (upperLeftTilePixPosX - motionX) % 256;
        }
        else{
            upperLeftTileX = upperLeftTileX - Math.ceil((upperLeftTilePixPosX - motionX)/256);
            upperLeftTilePixPosX = (upperLeftTilePixPosX - motionX) % 256;
        }
    }
    else{ //move to left
        if(upperLeftTilePixPosX - motionX <= 0){
            upperLeftTilePixPosX = (upperLeftTilePixPosX - motionX) % 256;
        }
        else{
            upperLeftTileX = upperLeftTileX - Math.ceil((upperLeftTilePixPosX - motionX)/256);
            upperLeftTilePixPosX = ((upperLeftTilePixPosX - motionX) % 256) - 256;
        }
    }

    if (motionY > 0){ //move to down
        if(upperLeftTilePixPosY - motionY > -256){
            upperLeftTilePixPosY = (upperLeftTilePixPosY - motionY) % 256;
        }
        else{
            upperLeftTileY = upperLeftTileY - Math.ceil((upperLeftTilePixPosY - motionY)/256);
            upperLeftTilePixPosY = (upperLeftTilePixPosY - motionY) % 256;
        }
    }
    else{ //move to up
        if(upperLeftTilePixPosY - motionY <= 0){
            upperLeftTilePixPosY = (upperLeftTilePixPosY - motionY) % 256;
        }
        else{
            upperLeftTileY = upperLeftTileY - Math.ceil((upperLeftTilePixPosY - motionY)/256);
            upperLeftTilePixPosY = ((upperLeftTilePixPosY - motionY) % 256) - 256;
        }
    }

    if (upperLeftTileX < 0){
        upperLeftTileX = 0;
        upperLeftTilePixPosX = 0;
    }
    if (upperLeftTileY < 0){
        upperLeftTileY = 0;
        upperLeftTilePixPosY = 0;
    }
    if (Math.pow(2,tileZoom) <= upperLeftTileX){
        upperLeftTileX = Math.pow(2,tileZoom) - 1;
    }
    if (Math.pow(2,tileZoom) <= upperLeftTileY){
        upperLeftTileY = Math.pow(2,tileZoom) - 1;
    }

    var lowerRightTileX = Math.ceil((myCanvas.width+Math.abs(motionX))/256) + upperLeftTileX + 1;
    var lowerRightTileY = Math.ceil((myCanvas.height+Math.abs(motionY))/256) + upperLeftTileY + 1;

    // Load and draw
    for(var rowNum = 0; rowNum <= 1 + (myCanvas.width+Math.abs(motionX))/256; rowNum++){
        for(var colNum = 0; colNum <= 1 + (myCanvas.height+Math.abs(motionY))/256; colNum++){
            var tilePixPosX = (rowNum*256)+upperLeftTilePixPosX;
            var tilePixPosY = (colNum*256)+upperLeftTilePixPosY;
            var tileX = upperLeftTileX+rowNum;
            var tileY = upperLeftTileY+colNum;
            var imageUrl = "image://maps/" + tileZoom + "/" + tileX + "/" + tileY;

            if (myLoadedTilesList.searchTile(imageUrl) === -1){
                if(dataFun.checkFile(imageUrl) || (isNetworkActive)){
                    myCanvas.loadImage(imageUrl);
                    myLoadedTilesList.pushTile(imageUrl,tileX,tileY,tilePixPosX,tilePixPosY);
                }
            }

            if (myCanvas.isImageLoaded(imageUrl)){
                ctx.drawImage(imageUrl,tilePixPosX,tilePixPosY);
            }
            else {
                var parentTileX = Math.floor(tileX/2);
                var parentTileY = Math.floor(tileY/2);
                var parentImageUrl = "image://maps/" + (tileZoom-1) + "/" + parentTileX + "/" + parentTileY;
                if (dataFun.checkFile(parentImageUrl)){ // zoom in scale
                    if (myCanvas.isImageLoaded(parentImageUrl)){
                        ctx.drawImage(parentImageUrl,128*(tileX%2),128*(tileY%2),128,128,tilePixPosX,tilePixPosY,256,256);
                    }
                    else if (myLoadedTilesList.searchTile(parentImageUrl) === -1){
                        myCanvas.loadImage(parentImageUrl);
                        myLoadedTilesList.pushTile(parentImageUrl,parentTileX,parentTileY);
                    }
                }
                else { // zoom out scale
                    for (var i = 0; i < 2; i++){
                        for (var j = 0; j < 2; j++){
                            var childTileX = tileX*2 + i;
                            var childTileY = tileY*2 + j;
                            var childImageUrl = "image://maps/" + (tileZoom+1) + "/" + childTileX + "/" + childTileY;
                            if (dataFun.checkFile(childImageUrl)){
                                if (myCanvas.isImageLoaded(childImageUrl)){
                                    ctx.drawImage(childImageUrl,0,0,256,256,tilePixPosX+128*i,tilePixPosY+128*j,128,128);
                                }
                                else if (myLoadedTilesList.searchTile(childImageUrl) === -1){ ////////
                                    myCanvas.loadImage(childImageUrl);
                                    myLoadedTilesList.pushTile(childImageUrl,childTileX,childTileY);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Unload
    for (var i=0; i < myLoadedTilesList.data_mysize; i++){
        if(!(((myLoadedTilesList.data[i].tileX >= upperLeftTileX-1)
              && (myLoadedTilesList.data[i].tileX <= lowerRightTileX+1)
              && (myLoadedTilesList.data[i].tileY >= upperLeftTileY-1)
              && (myLoadedTilesList.data[i].tileY <= lowerRightTileY+1))
             || ((myLoadedTilesList.data[i].tileX >= (upperLeftTileX/2)-1) // zoom in
                 && (myLoadedTilesList.data[i].tileX <= (lowerRightTileX/2)+1)
                 && (myLoadedTilesList.data[i].tileY >= (upperLeftTileY/2)-1)
                 && (myLoadedTilesList.data[i].tileY <= (lowerRightTileY/2)+1))
             || ((myLoadedTilesList.data[i].tileX >= (upperLeftTileX*2)-1) // zoom out
                 && (myLoadedTilesList.data[i].tileX <= (lowerRightTileX*2)+1)
                 && (myLoadedTilesList.data[i].tileY >= (upperLeftTileY*2)-1)
                 && (myLoadedTilesList.data[i].tileY <= (lowerRightTileY*2)+1))
             )){
            if (myCanvas.isImageLoaded(myLoadedTilesList.data[i].imageUrl)){
                //console.log("unloaded",myLoadedTilesList.data[i].imageUrl,"in",upperLeftTileX,upperLeftTileY,lowerRightTileX,lowerRightTileY);
                myCanvas.unloadImage(myLoadedTilesList.data[i].imageUrl);
                myLoadedTilesList.removeTile(i);
            }
        }
    }

    // Pin Items
    var n = Math.PI-2*Math.PI*upperLeftTileY/Math.pow(2,tileZoom);
    upperLeftLat = 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)));
    upperLeftLon = (upperLeftTileX/Math.pow(2,tileZoom)*360-180);
    n = Math.PI-2*Math.PI*lowerRightTileY/Math.pow(2,tileZoom);
    lowerRightLat = 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)));
    lowerRightLon = (lowerRightTileX/Math.pow(2,tileZoom)*360-180);
    myPinItemList.areThereItemsInCanvas();

    myCanvas.requestPaint();
}


function drawLoaded(){
    var ctx = myCanvas.getContext("2d");

    for(var rowNum = 0; rowNum <= 1 + myCanvas.width/256; rowNum++){
        for(var colNum = 0; colNum <= 1 + myCanvas.height/256; colNum++){
            var tilePixPosX = (rowNum*256)+upperLeftTilePixPosX;
            var tilePixPosY = (colNum*256)+upperLeftTilePixPosY;
            var tileX = upperLeftTileX+rowNum;
            var tileY = upperLeftTileY+colNum;
            var imageUrl = "image://maps/" + tileZoom + "/" + tileX + "/" + tileY;

            if (myCanvas.isImageLoaded(imageUrl)){
                ctx.drawImage(imageUrl,tilePixPosX,tilePixPosY);
            }
            else {
                var parentTileX = Math.floor(tileX/2);
                var parentTileY = Math.floor(tileY/2);
                var parentImageUrl = "image://maps/" + (tileZoom-1) + "/" + parentTileX + "/" + parentTileY;
                if (myCanvas.isImageLoaded(parentImageUrl)){
                    ctx.drawImage(parentImageUrl,128*(tileX%2),128*(tileY%2),128,128,tilePixPosX,tilePixPosY,256,256);
                }
            }
        }
    }

    myPinItemList.areThereItemsInCanvas();
    // myCanvas.requestPaint();
}

function zoomChanged(zoomDirection,pixPosX,pixPosY){
    //console.log(pixPosX,pixPosY,upperLeftTileX,upperLeftTileY,upperLeftTilePixPosX,upperLeftTilePixPosY);

    var zoomPointParentTileX = upperLeftTileX + Math.floor((pixPosX - upperLeftTilePixPosX)/256);
    var zoomPointParentTileY = upperLeftTileY + Math.floor((pixPosY - upperLeftTilePixPosY)/256);

    var zoomPointInParentTilePixPosX = (pixPosX - upperLeftTilePixPosX)%256;
    var zoomPointInParentTilePixPosY = (pixPosY - upperLeftTilePixPosY)%256;

    if (zoomDirection === "down"){
        if(tileZoom === maxZoomLevel){
            return;
        }
        else{
            tileZoom++;
        }

        var zoomPointTileX = zoomPointParentTileX * 2;
        var zoomPointInTilePixPosX = (zoomPointInParentTilePixPosX%128)*2; ;
        if (zoomPointInParentTilePixPosX > 128){
            zoomPointTileX++;
        }

        var zoomPointTileY = zoomPointParentTileY * 2;
        var zoomPointInTilePixPosY = (zoomPointInParentTilePixPosY%128)*2; ;
        if (zoomPointInParentTilePixPosY > 128){
            zoomPointTileY++;
        }
    }
    else if (zoomDirection === "up"){
        if(tileZoom === 0){
            return;
        }
        else{
            tileZoom--;
        }

        var zoomPointTileX = Math.floor(zoomPointParentTileX / 2);
        var zoomPointInTilePixPosX = Math.floor((zoomPointParentTileX%2)*128+ zoomPointInParentTilePixPosX/2);

        var zoomPointTileY = Math.floor(zoomPointParentTileY / 2);
        var zoomPointInTilePixPosY = Math.floor((zoomPointParentTileY%2)*128+ zoomPointInParentTilePixPosY/2);
    }
    upperLeftTileX =  zoomPointTileX - Math.ceil((pixPosX - zoomPointInTilePixPosX)/256);
    upperLeftTileY =  zoomPointTileY - Math.ceil((pixPosY - zoomPointInTilePixPosY)/256);
    upperLeftTilePixPosX = ((pixPosX - zoomPointInTilePixPosX + 256)%256)-256;
    upperLeftTilePixPosY = ((pixPosY - zoomPointInTilePixPosY + 256)%256)-256;
    motionHappened(0,0);
}

function swipeMap(){
    function calculateDistance(x1, y1, x2, y2 ){
        return (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
    }
    if(myMouse.pressed){
        if (calculateDistance(changeHoldX,changeHoldY,myMouse.mouseX,myMouse.mouseY) > effectiveDrawChangePixelTreshold){
            MyMap.motionHappened(changeHoldX - myMouse.mouseX,changeHoldY - myMouse.mouseY);
            changeHoldY =  myMouse.mouseY;
            changeHoldX =  myMouse.mouseX;
        }
    }
}


//LOADED TILE LIST
function LoadedTilesList(){
    function LoadedTile(newurl,tx,ty) {
        this.imageUrl = newurl;
        this.tileX = tx;
        this.tileY = ty;
    }

    this.data = [];
    this.data.length = 200;
    this.data_mysize = 0;
    this.pushTile = function(url,tx,ty){
        var newTile = new LoadedTile(url,tx,ty);
        this.data[this.data_mysize++] = newTile;
        //console.log("loaded",url);
    }
    this.removeTile = function(index) {
        while (index<this.data_mysize) {
            this.data[index] = this.data[index+1];
            index++
        }
        this.data_mysize--;
    }
    this.searchTile = function(searchUrl){
        for (var i = 0; i < this.data_mysize; i++){
            if(this.data[i].imageUrl === searchUrl){
                return i;
            }
        }
        return -1;
    }
    this.printList = function(){
        for (var i = 0; i < this.data_mysize; i++){
            console.log(this.data[i].imageUrl);
        }
    }
}


// PIN ITEM LIST
function PinItemList(){
    function PinItem(newurl,newlat,newlon,newiconOffsetX,newiconOffsetY,newid) { // Pin Item Class
        this.itemID = newid;
        this.imageUrl = newurl;
        this.lat = newlat;
        this.lon = newlon;
        this.iconOffsetX = newiconOffsetX;
        this.iconOffsetY = newiconOffsetY;

        this.tileX = null;
        this.tileY = null;
        this.pixPosInTileX = null;
        this.pixPosInTileY = null;
        this.pixPosX = null;
        this.pixPosY = null;

        this.calculateItemsTile = function(){
            var doubleTileX = (this.lon+180)/360*Math.pow(2,tileZoom);
            var doubleTileY = (1-Math.log(Math.tan(this.lat*Math.PI/180) + 1/Math.cos(this.lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,tileZoom);

            this.tileX = Math.floor(doubleTileX);
            this.tileY = Math.floor(doubleTileY);
            this.pixPosInTileX = Math.round((doubleTileX % 1)*256);
            this.pixPosInTileY = Math.round((doubleTileY % 1)*256);

            this.pixPosX = ((this.tileX-upperLeftTileX)*256) + upperLeftTilePixPosX + this.pixPosInTileX + this.iconOffsetX;
            this.pixPosY = ((this.tileY-upperLeftTileY)*256) + upperLeftTilePixPosY + this.pixPosInTileY + this.iconOffsetY;
        }
        this.isItemInCanvas = function(upperLeftLat,upperLeftLon,lowerRightLat,lowerRightLon){
            //console.log(this.lat,this.lon,"is in ",upperLeftLat,upperLeftLon,lowerRightLat,lowerRightLon)
            if ((upperLeftLat >= this.lat) && (lowerRightLat <= this.lat) && (upperLeftLon <= this.lon) && (lowerRightLon >= this.lon)){
                return true;
            }
            return false;
        }
    }

    this.data = [];
    this.data.length = 100;
    this.data_mysize = 0;

    this.areThereItemsInCanvas = function(){
        var d = this.data;
        for (var i = 0; i < this.data_mysize; i++){
            if(d[i].isItemInCanvas(upperLeftLat,upperLeftLon,lowerRightLat,lowerRightLon)){
                d[i].calculateItemsTile();
                //  console.log(d[i].imageUrl, d[i].tileX, d[i].tileY, d[i].pixPosInTileX, d[i].pixPosInTileY,"founded");
                if(myCanvas.isImageLoaded(d[i].imageUrl)){
                    var ctx = myCanvas.getContext("2d");
                    ctx.drawImage(d[i].imageUrl,d[i].pixPosX,d[i].pixPosY);
                }
                else{
                    if(!myCanvas.isImageLoading(d[i].imageUrl)){
                        myCanvas.loadImage(d[i].imageUrl);
                    }
                }
            }
        }
    }

    this.pushItem = function(newimageUrl,newlat,newlon,newiconOffsetX,newiconOffsetY){
        var newItem = new PinItem(newimageUrl,newlat,newlon,newiconOffsetX,newiconOffsetY,this.data_mysize);
        this.data[this.data_mysize] = newItem;
        return this.data_mysize++;
    }

    this.removeItem = function(id){
        var d = this.data;
        for (var i = 0; i < this.data_mysize; i++){
            if(d[i].itemID === id){
                myCanvas.unloadImage(d[i].imageUrl);
                while (i<this.data_mysize) {
                    this.data[i] = this.data[i+1];
                    i++
                }
                this.data_mysize--;
                return;
            }
        }
    }
}

function findGpsPosition(){
    if (gpsPositionCalled === true){
        var gpsCoord = myGpsSource.position.coordinate;
        if (!gpsPositionCalledContinuously){ // eger surekli gps degilse
            gpsPositionCalled = false;
            myGpsSource.stop(); // gps bulundugunda kapanir
        }
        goToCenterCoord(gpsCoord.latitude,gpsCoord.longitude,tileZoom);
        if (gpsItemId !== -1){
            removeItemWithID(gpsItemId);
        }
        gpsItemId = addItemToCoord("icons/gps_home.png",gpsCoord.latitude,gpsCoord.longitude,-64,-64);
    }
}

// EXTRA FUNCTIONS
function addItemToCoord(imageUrl,lat,lon,iconOffsetX,iconOffsetY){
    return myPinItemList.pushItem(imageUrl,lat,lon,iconOffsetX,iconOffsetY);
}

function removeItemWithID(id){
    myPinItemList.removeItem(id);
}

function goToCenterCoord(lat,lon,zoom){
    console.log("Goto position:",lat, lon);
    tileZoom = zoom;
    var doubleTileX = (lon+180)/360*Math.pow(2,tileZoom);
    var doubleTileY = (1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,tileZoom);

    var tileX = Math.floor(doubleTileX);
    var tileY = Math.floor(doubleTileY);

    var pixPosInTileX = Math.round((doubleTileX % 1)*256);
    var pixPosInTileY = Math.round((doubleTileY % 1)*256);

    //console.log("Tile:",tileX, tileY, pixPosInTileX, pixPosInTileY);

    upperLeftTileX =  tileX - Math.ceil(((myCanvas.width/2) - pixPosInTileX)/256);
    upperLeftTileY =  tileY - Math.ceil(((myCanvas.height/2) - pixPosInTileY)/256);

    upperLeftTilePixPosX = (((myCanvas.width/2) - pixPosInTileX + 256)%256)-256;
    upperLeftTilePixPosY = (((myCanvas.height/2) - pixPosInTileY + 256)%256)-256;

    motionHappened(0,0);
}

function findCoord(pixPosX,pixPosY){
    var pressTileX = upperLeftTileX + (pixPosX - upperLeftTilePixPosX)/256;
    var pressTileY = upperLeftTileY + (pixPosY - upperLeftTilePixPosY)/256;

    var n = Math.PI-2*Math.PI*pressTileY/Math.pow(2,tileZoom);
    var lat = 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)));
    var lon = pressTileX/Math.pow(2,tileZoom)*360-180;
    console.log(lat,lon);
}
