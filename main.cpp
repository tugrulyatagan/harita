#include <QApplication>
#include <QQmlApplicationEngine>
#include <QtQml>
#include <QQmlContext>

#include "MapImageProvider.h"

int main(int argc, char *argv[]){
    QApplication app(argc, argv);
    MapImageProvider *prov = new MapImageProvider();
    DataFun *dataFun = DataFun::getInstance();

    QQmlApplicationEngine engine;
    engine.addImageProvider(QLatin1String("maps"), prov); // ismi degistitirsen aci cekersin
    engine.clearComponentCache();
    engine.rootContext()->setContextProperty("dataFun", dataFun);
    engine.load(QUrl(QStringLiteral("qrc:///main.qml")));

    return app.exec();
}
