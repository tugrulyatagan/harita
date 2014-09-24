#ifndef VARIABLES_H
#define VARIABLES_H

#include <QString>
#include <QStringList>
#include <QNetworkAccessManager>

const int IMAGE_CACHE_LIFETIME = 5;
const int NETWORK_TIME_OUT = 10000; // ms
const QString IMAGE_CACHE_FOLDER = "/tiles_cache";
const QStringList MAPS_URL_TEMPLATES = QStringList()
        << "http://mt0.google.com/vt/x=%1&y=%2&z=%3"
        << "http://mt1.google.com/vt/x=%1&y=%2&z=%3"
        << "http://mt2.google.com/vt/x=%1&y=%2&z=%3"
        << "http://mt3.google.com/vt/x=%1&y=%2&z=%3";

static bool networkStatus;

#endif // VARIABLES_H
