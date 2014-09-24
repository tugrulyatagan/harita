#ifndef DATAFUN_H
#define DATAFUN_H

#include <QObject>
#include <QDir>
#include <QNetworkConfigurationManager>
#include <QDebug>

#include "Variables.h"

class DataFun : public QObject{
    Q_OBJECT
private:
    DataFun(QObject *parent = 0);
    QNetworkConfigurationManager *networkControl = NULL;
public:
    static DataFun *getInstance();
    Q_INVOKABLE bool checkFile(QString imageName);
    Q_INVOKABLE bool deleteCache();
signals:
    void netChanged(bool netStat);
public slots:
    void netStatChange(bool);
};

#endif // DATAFUN_H
