#include "MapImageProvider.h"

QString CACHE_DIR;
QString IMAGE_PATH_TEMPLATE;

MapImageProvider::MapImageProvider(): QQuickImageProvider(QQuickImageProvider::Pixmap){
    serverOrder=0;
    CACHE_DIR = QStandardPaths::writableLocation( QStandardPaths::CacheLocation) + IMAGE_CACHE_FOLDER;
    IMAGE_PATH_TEMPLATE = CACHE_DIR + "/%1/%2/%3";
}

QPixmap MapImageProvider::requestPixmap(const QString &id, QSize *size, const QSize &requestedSize){
    QStringList splitted = id.split("/");
    int z = splitted[0].toInt();
    int x = splitted[1].toInt();
    int y = splitted[2].toInt();

    QString imagePATH = IMAGE_PATH_TEMPLATE.arg(QString::number(z), QString::number(x), QString::number(y));
    QFileInfo image(imagePATH);
    QDateTime creationTime = image.lastModified();
    int daysPassed = creationTime.daysTo(QDateTime::currentDateTime());
    if((!image.exists()) || (daysPassed > IMAGE_CACHE_LIFETIME) || (!image.size())) {
        QString imageDir = (CACHE_DIR+"/%1/%2").arg(QString::number(z), QString::number(x));
        if(!QDir(imageDir).exists()){
            QDir().mkpath(imageDir);
        }

        serverOrder = (serverOrder + 1) % MAPS_URL_TEMPLATES.length();
        QString imageURL = MAPS_URL_TEMPLATES[serverOrder].arg(QString::number(x), QString::number(y), QString::number(z));

        ImageDownloader *imageDownloader = new ImageDownloader(serverOrder);
        imageDownloader->setFile(imageURL,imagePATH);

        QEventLoop loop;
        QObject::connect(imageDownloader,SIGNAL(downloadFinished()),&loop,SLOT(quit()));
        loop.exec();
    }
    pixmap.load(imagePATH);
    return pixmap;
}
