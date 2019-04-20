#!/bin/sh

opt=
PROGRAM_NAME=
TOTAL_PRIME_NUMBERS=0
DELAY=2
PROGRAM_LIST="PYTHON(py,Python,python) PHP(php) JAVASCRIPT(js,JavaScript,javascript,JS) JAVA(Java,java) C++(c++,cpp) C(c) C#(c#,cs)"
prepare() {
    local _lang=$1
    echo ""
    echo Testing $_lang multithreading for validating $TOTAL_PRIME_NUMBERS prime numbers...
    sleep $DELAY
}
machine="`uname -s`"
SCRIPT_NAME="`basename $0`"
CUR_DIR="`dirname $0`"
cd $CUR_DIR
show_help() {
    cat << EOF

$SCRIPT_NAME [options]

    -p  Choose programs to run
        Use -p all to run all
        Use -p "program1 program2" to run multiple
    -b  Build program
    -c  Clean program
    -n  Total prime numbers to calculate
    -d  Delay before next program run
    -l  List all available programs
    
EOF
}

run_program() {
    local program_name=$1
    case "$program_name" in
        Python|python|PYTHON|py|all)
            prepare Python
            python ThreadPython.py $TOTAL_PRIME_NUMBERS 2>/dev/null
        ;;
        PHP|php|all)
            prepare PHP
            php ThreadPHP.php $TOTAL_PRIME_NUMBERS 2>/dev/null
        ;;
        JavaScript|javascript|JAVASCRIPT|js|JS|all)
            prepare JavaScript
            node --experimental-worker ThreadJavaScript.js $TOTAL_PRIME_NUMBERS 2>/dev/null
        ;;
        Java|JAVA|java|all)
            prepare Java
            java -cp . ThreadJava $TOTAL_PRIME_NUMBERS 2>/dev/null
        ;;
        C++|c++|cpp|all)
            prepare C++
            ./ThreadCPP.run $TOTAL_PRIME_NUMBERS 2>/dev/null
        ;;
        C|c|all)
            prepare C
            ./ThreadC.run $TOTAL_PRIME_NUMBERS 2>/dev/null
        ;;
        "C#"|"c#"|cs|all)
            prepare "C#"
            dotnet bin/Release/netcoreapp2.2/ThreadCS.dll -- $TOTAL_PRIME_NUMBERS 2>/dev/null
        ;;
    esac
}

build_program() {
    local program_name=$1
    case "$program_name" in
        Python|python|PYTHON|py|all)
            echo Rebuild Python...
        ;;
        PHP|php|all)
            echo Rebuild PHP...
        ;;
        JavaScript|javascript|JAVASCRIPT|js|JS|all)
            echo Rebuild JavaScript...
        ;;
        Java|JAVA|java|all)
            echo Rebuild Java...
            javac -cp . ThreadJava.java 1>/dev/null
        ;;
        C++|c++|cpp|all)
            echo Rebuild C++...
            if [ "$machine" = "Darwin" ]; then
                clang++ --std=c++11 -pthread -I. -o ThreadCPP.run ThreadCPP.cpp 1>/dev/null
            else
                g++ -pthread -I. -o ThreadCPP.run ThreadCPP.cpp 1>/dev/null
            fi
        ;;
        C|c|all)
            echo Rebuild C...
            gcc -pthread -I. -o ThreadC.run ThreadC.c 1>/dev/null
        ;;
        "C#"|"c#"|cs|all)
            echo "Rebuild C#..."
            dotnet publish -o build -v q -c Release 1>/dev/null
        ;;
    esac
}

SHOW_PROGRAM=

for i in "$@"; do
    case "$opt" in
        "PROGRAM_NAME")
            PROGRAM_NAME="$i"
            opt=
        ;;
        "BUILD_PROGRAM")
            BUILD_PROGRAM="$i"
            opt=
        ;;
        "TOTAL_PRIME_NUMBERS")
            TOTAL_PRIME_NUMBERS="$i"
            opt=
        ;;
        "DELAY")
            DELAY="$i"
            opt=
        ;;
        "BUILD")
            BUILD_PROGRAM="1"
            opt=
        ;;
        "CLEAN")
            CLEAN="1"
            opt=
        ;;
    esac;
    case "$i" in
        "-p")
            opt="PROGRAM_NAME"
        ;;
        "-n")
            opt="TOTAL_PRIME_NUMBERS"
        ;;
        "-d")
            opt="DELAY"
        ;;
        "-b")
            opt="BUILD"
            BUILD_PROGRAM="1"
        ;;
        "-c")
            opt="CLEAN"
            CLEAN="1"
        ;;
        "-l")
            SHOW_PROGRAM=1
        ;;
    esac
done

if [ ! -z "$CLEAN" ]; then
    echo Clean up build...
    rm -rf bin build obj ./*.class ./*.run __pycache__ ./*.pyc
    exit 0
fi

if [ ! -z "$SHOW_PROGRAM" ]; then
    for p in $PROGRAM_LIST; do
        echo "$p"
    done
    exit 0
fi

if [ "$PROGRAM_NAME" = "all" ]; then
    PROGRAM_NAME="PYTHON PHP JAVASCRIPT JAVA C++ C C#"
fi
if [ ! -z "$PROGRAM_NAME" ]; then
    for p in $PROGRAM_NAME; do
        if [ ! -z "$BUILD_PROGRAM" ]; then
            build_program $p
        else
            run_program $p
        fi
    done
    exit 0
else
    show_help
fi