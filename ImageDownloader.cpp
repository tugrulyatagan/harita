#include "ImageDownloader.h"

#ifdef MULTIPLE_NETWORK_INSTANCE
static QNetworkAccessManager **managerList = NULL;
#else
static QNetworkAccessManager *manager = NULL;
#endif

ImageDownloader::ImageDownloader(int serverOrder,QObject *parent) :QObject(parent){
#ifdef MULTIPLE_NETWORK_INSTANCE
    if(!managerList){
        managerList = new QNetworkAccessManager*[MAPS_URL_TEMPLATES.length()];
        for(int i = 0; i < MAPS_URL_TEMPLATES.length();i++){
            managerList[i] = new QNetworkAccessManager();
        }
    }
    manager = managerList[serverOrder];
#else
    if(!manager){
        manager = new QNetworkAccessManager();
    }
#endif
}

ImageDownloader::~ImageDownloader(){
    reply->deleteLater();
}

void ImageDownloader::setFile(QString fileURL, QString saveFilePath){
    path = saveFilePath;
    QNetworkRequest request;
    request.setAttribute(QNetworkRequest::HttpPipeliningAllowedAttribute, true);
    request.setUrl(QUrl(fileURL));

    reply = manager->get(request);

    timeOutCounter = new QTimer;
    timeOutCounter->setSingleShot(true);
    timeOutCounter->start(NETWORK_TIME_OUT);

    connect(timeOutCounter,SIGNAL(timeout()),this,SLOT(onTimeOut()));
    connect(reply,SIGNAL(finished()),this,SLOT(onReplyFinished()));
}

void ImageDownloader::onReplyFinished(){
    timeOutCounter->stop();
    if(reply->error() > QNetworkReply::NoError) { // Error
        qDebug() << reply->url().toString() << reply->errorString();
    }
    else {
        int v = reply->attribute(QNetworkRequest::HttpStatusCodeAttribute).toInt();
        if (v >= 200 && v < 300) {  // Success
            QFile file;
            file.setFileName(path);
            file.open(QIODevice::WriteOnly);
            if(file.isOpen()){
                file.write(reply->readAll());
                file.close();
                qDebug() << reply->url().toString() << "to" << path << "Downloaded Successfully.";
            }
        }
    }
    emit downloadFinished();
}

void ImageDownloader::onTimeOut(){
    qDebug() << reply->url().toString() << NETWORK_TIME_OUT << " ms exceeded Timeout Error";
    //reply->abort();
}
