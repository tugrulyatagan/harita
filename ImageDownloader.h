#ifndef IMAGEDOWNLOADER_H
#define IMAGEDOWNLOADER_H

#include <QObject>
#include <QNetworkAccessManager>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QFile>
#include <QStringList>
#include <QTimer>

#include "Variables.h"
#include "DataFun.h"

#define MULTIPLE_NETWORK_INSTANCE

class ImageDownloader : public QObject{
    Q_OBJECT
public:
    explicit ImageDownloader(int serverorder = 0, QObject *parent = 0);
    virtual ~ImageDownloader();
    void setFile(QString fileURL, QString fileName);
    int success;
private:
#ifdef MULTIPLE_NETWORK_INSTANCE
    QNetworkAccessManager *manager;
#endif
    QString path;
    QNetworkReply *reply;
    QTimer *timeOutCounter;
public slots:
    void onReplyFinished();
    void onTimeOut();
signals:
    void downloadFinished();
    void networkChanged();
};

#endif // ImageDownloader_H
