#include "DataFun.h"

extern QString CACHE_DIR;
extern QString IMAGE_PATH_TEMPLATE;

static DataFun* self = NULL;

DataFun::DataFun(QObject *parent):QObject(parent){
    networkControl = new QNetworkConfigurationManager();
    connect(networkControl,SIGNAL(onlineStateChanged(bool)),this,SLOT(netStatChange(bool)));
}

DataFun *DataFun::getInstance(){
    if (!self){
        self = new DataFun();
    }
    return self;
}

bool DataFun::checkFile(QString imageName){
    QFileInfo image(CACHE_DIR + imageName.remove(0,12)); // "maps" için
    if(image.exists()) {
        return true;
    }
    return false;
}

bool DataFun::deleteCache(){
    if(QDir(CACHE_DIR).exists()){
        return QDir(CACHE_DIR).removeRecursively();
    }
    return false;
}

void DataFun::netStatChange(bool stat){
    networkStatus = stat;
    emit netChanged(stat);

    if(stat){
        qDebug() << "Network is online";
    }
    else{
        qDebug() << "Network is offline";
    }
}
