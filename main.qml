import QtQuick 2.3 as QQ
import QtQuick.Controls 1.2
import QtPositioning 5.3
import "drawMap.js" as MyMap

ApplicationWindow {
    id: root
    visible: true
    width: 800
    height: 640

    menuBar: MenuBar {
        Menu {
            title: qsTr("File")
            MenuItem {
                text: qsTr("Exit")
                onTriggered: Qt.quit();
            }
            MenuItem {
                id: gpsbut
                visible: false
                text: qsTr("Find GPS location")
                onTriggered: {
                    gpssrc.start();
                    gpssrc.update();
                    MyMap.gpsPositionCalled = true;
                    MyMap.gpsPositionCalledContinuously = false;
                }
            }
            MenuItem {
                id: gpsbutcon
                visible: false
                text: qsTr("Find GPS continuously")
                onTriggered: {
                    gpssrc.start();
                    gpssrc.update();
                    MyMap.gpsPositionCalled = true;
                    MyMap.gpsPositionCalledContinuously = true;
                    gpsbutconstop.visible = true;
                    gpsbutcon.visible = false;
                }
            }
            MenuItem {
                id: gpsbutconstop
                visible: false
                text: qsTr("Stop continuous GPS")
                onTriggered: {
                    gpssrc.stop();
                    MyMap.gpsPositionCalledContinuously = false;
                    gpsbutconstop.visible = false;
                    gpsbutcon.visible = true;
                }
            }
            MenuItem {
                text: qsTr("Delete Cache")
                onTriggered:{
                    dataFun.deleteCache();
                }
            }
        }
    }

    PositionSource {
        id: gpssrc
        updateInterval: 1000
        active: false
        preferredPositioningMethods: PositionSource.AllPositioningMethods

        QQ.Component.onCompleted: {
            if (gpssrc.valid){
                gpsbut.visible = true;
                gpsbutcon.visible = true;
                MyMap.myGpsSource = gpssrc;
            }
        }

        onSourceErrorChanged: {
            if(sourceError === PositionSource.AccessError){
                console.log("GPS AccessError");
            }
            else if (sourceError === PositionSource.ClosedError){
                console.log("GPS ClosedError");
            }
            else if (sourceError === PositionSource.UnknownSourceError){
                console.log("GPS UnknownSourceError");
            }
            else if (sourceError === PositionSource.SocketError){
                console.log("GPS SocketError");
            }
            else if (sourceError === PositionSource.NoError){
                console.log("GPS NoError");
            }
        }

        onPositionChanged: {
            if (sourceError === PositionSource.NoError){
                MyMap.findGpsPosition();
            }
            else if(sourceError === PositionSource.AccessError){
                console.log("GPS AccessError");
            }
            else if (sourceError === PositionSource.ClosedError){
                console.log("GPS ClosedError");
            }
            else if (sourceError === PositionSource.UnknownSourceError){
                console.log("GPS UnknownSourceError");
            }
            else if (sourceError === PositionSource.SocketError){
                console.log("GPS SocketError");
            }
        }
    }

    QQ.Connections {
        target: dataFun
        onNetChanged: {
            MyMap.isNetworkActive = netStat;
        }
    }

    QQ.Canvas {
        id: can
        anchors.fill: parent

        QQ.Component.onCompleted: {
            MyMap.myCanvas = can;
            MyMap.myMouse = mo;

        }
        onAvailableChanged: {
            MyMap.initMap();
        }

        focus: true
        QQ.Keys.onPressed: {
            if (event.key === Qt.Key_Right){
                MyMap.motionHappened(50,0);
            }
            if (event.key === Qt.Key_Left){
                MyMap.motionHappened(-50,0);
            }
            if (event.key === Qt.Key_Up){
                MyMap.motionHappened(0,-50);
            }
            if (event.key === Qt.Key_Down){
                MyMap.motionHappened(0,50);
            }
            if (event.key === Qt.Key_Plus){
                MyMap.zoomChanged("down",width/2,height/2);
            }
            if (event.key === Qt.Key_Minus){
                MyMap.zoomChanged("up",width/2,height/2);
            }
        }

        QQ.PinchArea {
            id: pin
            anchors.fill: parent

            onPinchFinished: {
                if (pinch.scale < 1) {
                    MyMap.zoomChanged("up",pinch.startCenter.x,pinch.startCenter.y)
                } else if (pinch.scale > 1) {
                    MyMap.zoomChanged("down",pinch.startCenter.x,pinch.startCenter.y)
                }
            }

            QQ.MouseArea {
                id: mo
                anchors.fill: parent
                hoverEnabled: true
                acceptedButtons: Qt.LeftButton
                onPressed: {
                    MyMap.changeHoldX = mouseX;
                    MyMap.changeHoldY = mouseY;
                }

                onPositionChanged: {
                    MyMap.swipeMap();
                }

                onDoubleClicked: {
                    if (mouse.button == Qt.LeftButton){
                        MyMap.zoomChanged("down",mouseX,mouseY);
                    }
                }

                onPressAndHold: {
                    //                    if (mouse.button == Qt.LeftButton){
                    //                        MyMap.findCoord(mouseX,mouseY);
                    //                    }
                }

                onWheel: {
                    if (wheel.angleDelta.y > 0){
                        MyMap.zoomChanged("down",mouseX,mouseY);
                    }
                    else{
                        MyMap.zoomChanged("up",mouseX,mouseY);
                    }
                }
            }
        }

        onImageLoaded: {
            requestPaint();
        }
        onPaint: {
            MyMap.drawLoaded();
        }
    }
}
