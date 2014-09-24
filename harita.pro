TEMPLATE = app

QT += qml quick widgets positioning
MOBILITY +=

SOURCES += main.cpp \
    MapImageProvider.cpp \
    ImageDownloader.cpp \
    DataFun.cpp

RESOURCES += qml.qrc

# Additional import path used to resolve QML modules in Qt Creator's code model
QML_IMPORT_PATH =

# Default rules for deployment.
include(deployment.pri)

HEADERS += \
    MapImageProvider.h \
    DataFun.h \
    Variables.h \
    ImageDownloader.h

OTHER_FILES += \
    drawMap.js

QMAKE_CXXFLAGS -= -O1
QMAKE_CXXFLAGS -= -O2
QMAKE_CXXFLAGS += -O3

QMAKE_CFLAGS -= -O1
QMAKE_CFLAGS -= -O2
QMAKE_CFLAGS += -O3
