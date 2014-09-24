#ifndef MAPIMAGEPROVIDER_H
#define MAPIMAGEPROVIDER_H

#include <QQuickImageProvider>
#include <QPixmap>
#include <QObject>
#include <QEventLoop>
#include <QFileInfo>
#include <QDir>
#include <QStandardPaths>
#include <QDebug>

#include "Variables.h"
#include "ImageDownloader.h"
#include "DataFun.h"

class MapImageProvider :public QObject, public QQuickImageProvider {
private:
    QPixmap pixmap;
    int serverOrder;
public:
    MapImageProvider();
    QPixmap requestPixmap(const QString &tile, QSize *size, const QSize &requestedSize);
};

#endif // MAPIMAGEPROVIDER_H
