function app() {
    function _i(i) {
        return document.getElementById(i);
    }
    var info = {
        success: _i('info-success'),
        run: _i('info-run'),
        build: _i('info-build'),
        input: _i('prime-input'),
        form: _i('nav_form')
    };
    var num = chartData().totalPrimeNumbers || 0;
    info.input.value = num;
    info.form.addEventListener('submit', function(e) {
        info.form.action = './run?num=' + info.input.value;
        return true;
    }, false);

    if (chartData().running || chartData().rebuilding) {
        if (chartData().rebuilding) {
            info.build.classList.remove('hide');
            setTimeout(function() {
                window.location.href = './';
            }, 3000);
        }
        if (chartData().running) {
            info.run.classList.remove('hide');
            setTimeout(function() {
                window.location.href = './';
            }, 3000);
        }
        _i('container').classList.add('hide');
        return;
    } else {
        info.success.classList.remove('hide');
    }
    

    var allTotal = chartData().total || 0;
    var pie = new Chart('pie', {
        type: 'pie',
        options: {
            responsive: true,
            scales: {
                yAxes: [{
                    gridLines: {
                        drawBorder: false,
                        display: false
                    },
                    ticks: {
                        display: false,
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    gridLines: {
                        drawBorder: false,
                        display: false
                    },
                    ticks: {
                        display: false
                    }
                }]
            },
            tooltips: {
                callbacks: {
                    label: function(item, data) {
                        var sets = data.datasets[item.datasetIndex];
                        var value = sets.data[item.index];
                        var label = data.labels[item.index];
                        var total = allTotal;
                        var percentage = parseFloat((value/total)*100).toFixed(2);
                        return ' '+label + ': '+percentage+'% CPU usage ('+ value + ' of '+total+' ms)';
                    }
                }
            }
        },
        data: chartData().pie || {}
    });

    var col = new Chart('column', {
        type: 'horizontalBar',
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            legend: {
                display: false
            },
            tooltips: {
                custom: function(tooltip) {
                    if (!tooltip) return;
                    tooltip.displayColors = false;
                },
                callbacks: {
                    label: function(item, data) {
                        return data.datasets[item.datasetIndex].data[item.index] + ' ms';
                    }
                }
            }
        },
        data: chartData().column || {}
    });
    pie.canvas.parentNode.style.height = '700px';
    col.canvas.parentNode.style.height = '700px';

    _i('raw').innerText = chartData().raw;
    var ms = 0;
    _i('tpn').innerText = num;
    _i('ms').innerText = allTotal;
    var tbody = _i('tbody');
    var tables = chartData().tables;
    
    var trs = [];
    for (var i in tables) {
        var row = tables[i];
        trs.push({
            row: row,
            cpu: parseFloat((row.total / allTotal) * 100).toFixed(2),
            realCpu: (row.total / allTotal) * 100,
            total: row.total
        });
    }
    trs.sort(function(a, b) {
        return a.total > b.total ? 1 : -1;
    });
    var hasWinner = false;
    var cpus = 0;
    for (var i in trs) {
        var row = trs[i].row;
        winner = '';
        if (!hasWinner) {
            hasWinner = true;
            winner = ' <span class="label label-success pull-right"><i class="glyphicon glyphicon-star"></i> winner</span>';
        }
        cpus+= trs[i].realCpu;
        var exClass = '';
        var colr = '#333';
        if (trs[i].cpu >= 69) {
            exClass = 'progress-bar-danger';
            colr = '#fff';
        }
        var bar = '<div class="progress danger progress-striped active" style="height: 20px">\
            <div class="progress-bar '+exClass+'" aria-valuenow="'+trs[i].realCpu+'" aria-valuemin="0" aria-valuemax="100" style="width: '+trs[i].realCpu+'%">\
                <b style="color:'+colr+';">&nbsp;&nbsp;'+trs[i].cpu+'%</b>\
            </div>\
        </div>';
        tbody.innerHTML += '<tr><td>'+row.title+winner+'</td><td class="text-right">'+row.values.join(', ')+'</td><td class="text-right">'+row.total+'</td><td>'+bar+'</td></tr>';
    }

    tbody.innerHTML += '<tr><td class="text-right" colspan="2">Total</td><td class="text-right">'+allTotal+'</td><td class="text-center">'+cpus+'%</td></tr>'

    _i('_run').addEventListener('click', function(e) {
        try {
            e.preventDefault();
        } catch (e){}
        _i('f_run').submit();
        return false;
    }, false);
    _i('_build').addEventListener('click', function(e) {
        try {
            e.preventDefault();
        } catch (e){}
        _i('f_rebuild').submit();
        return false;
    }, false);
}
function getRandomRgb() {
    var clr = Math.round(0xffffff * Math.random());
    var r = clr >> 16;
    var g = clr >> 8 & 255;
    var b = clr & 255;
    return 'rgb(' + r + ', ' + g + ', ' + b + ')';
}
function build(num, delay) {
    if (isNaN(delay)) {
        delay = 5;
    }
    var enable_build = !(process.env.REBUILD && process.env.REBUILD == 'false');
    var debug = process.env.DEBUG && process.env.DEBUG.toLowerCase() == 'true';
    var port = process.env.PORT || 9000;
    var http = require('http');
    var fs = require('fs');
    var url = require('url');
    var spawn = require('child_process').spawn;
    var indexFile = __dirname + '/index.html';
    var app_js = '';
    var index_html = '';
    var data_js = {};
    var data_raw = '';
    fs.readFile(__filename, function(err, data) {
        if (!err) app_js = data;
    });
    fs.readFile(indexFile, function(err, data) {
        if (!err) index_html = data;
    });

    var runScript = __dirname + '/run.sh';
    var spawnOpt = {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        detach: true
    };

    function rebuild(callback) {
        callback = callback || function() {};
        if (data_js.rebuilding) {
            return callback();
        }
        data_js.rebuilding = true;
        var cbTriggered = false;
        var rebuild = spawn(runScript, ['-b', '-p', 'all'], spawnOpt);
        rebuild.stdout.on('data', function(data) {
            process.stdout.write(data);
        });
        rebuild.stderr.on('data', function(data) {
            process.stdout.write(data);
        });
        rebuild.on('exit', function(code) {
            if (code == 0) {
                data_js.rebuilding = false;
                if (!cbTriggered) {
                    console.log('Build complete');
                    cbTriggered = true;
                    callback();
                }
            } else {
                process.exit(code);
            }
        });
        rebuild.on('close', function(code) {
            if (code == 0) {
                data_js.rebuilding = false;
                if (!cbTriggered) {
                    console.log('Build complete');
                    cbTriggered = true;
                    callback();
                }
            } else {
                process.exit(code);
            }
        });
    }

    function start(skipServer) {
        if (data_js.running || data_js.rebuilding) {
            return;
        }
        data_js.pie = {};
        data_js.column = {};
        data_js.running = true;
        data_js.totalPrimeNumbers = num;
        var bench = spawn(runScript, ['-n', num, '-d', delay, '-p', 'all'], spawnOpt);
        var arrBuffer = [];
        var arrErrors = [];
        bench.stdout.on('data', function(data) {
            process.stdout.write(data);
            arrBuffer.push(data);
        });
        bench.stderr.on('data', function(err) {
            arrErrors.push(err.toString());
        });
        bench.on('close', function(code) {
            if (code != 0) {
                console.log(Buffer.concat(arrErrors).toString());
                console.log('Process stopped with exit code', code);
                process.exit(code);
                return;
            }
            var result = Buffer.concat(arrBuffer).toString();
            data_raw = result.toString();
            data_js = getDataJs(data_raw);
            data_js.raw = data_raw;
            data_js.totalPrimeNumbers = num;
            data_js.running = false;
            if (!skipServer) {
                runServer();
            }
        });
    }

    if (enable_build) {
        rebuild(start);        
    } else {
        start();
    }

    function getDataJs(data) {
        var lines = data.split("\n");
        var results = {};
        var tables = {};
        var allTotal = 0;
        for (var i in lines) {
            var str = lines[i];
            str.replace(/^[\s]+/g, '');
            var strings = str.match(/([^\s]+) thread id.*in ([\d]+) ms$/);
            if (strings && strings.length == 3) {
                var key = strings[1];
                var value = parseFloat(strings[2]);
                tables[key] = tables[key] || {title: key, values: [], total: 0};
                tables[key].values.push(value);
                tables[key].total+=value;
                results[key] = typeof results[key] != 'undefined' ? results[key] : [];
                results[key].push(value);
                allTotal+= value;
            }
        }
        var labels = [];
        var datas = [];
        var bgColors = [];
        var borderColors = [];
        var columnDataKeys = [];
        var columnData = [];

        for (var i in results) {
            var color = getRandomRgb();
            var col = {
                data: []
            };
            labels.push(i);
            bgColors.push(color);
            borderColors.push(color);
            // borderColors.push('rgb(255,255,255)');
            var total = 0;
            for (var a in results[i]) {
                total+=results[i][a];
                columnDataKeys[a] = columnDataKeys[a] || [];
                columnDataKeys[a].push(results[i][a]);
            }
            col.backgroundColor = bgColors;
            col.borderColor = borderColors;
            col.borderWidth = 1;
            columnData.push(col);
            datas.push(total);
        }
        for (var i in columnDataKeys) {
            columnData[i].data = columnDataKeys[i];
        }
        return {
            pie: {
                labels: labels,
                datasets: [{
                    data: datas,
                    backgroundColor: bgColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            column: {
                labels: labels,
                datasets: columnData
            },
            tables: tables,
            total: allTotal
        };
    };

    function runServer() {
        data_js.rebuilding = false;
        http.createServer(function(req, res) {
            var server = url.parse(req.url, true);
            if (debug) {
                console.log(req.method, server.href);
            }
            
            if (server.pathname == '/data.js') {
                res.setHeader('Content-type', 'application/javascript; charset=utf-8');
                res.write(';(function(){window.chartData=function(){return '+JSON.stringify(data_js)+'}})()');
                res.end();
            }
            else if (server.pathname == '/run.js') {
                res.setHeader('Content-type', 'application/javascript; charset=utf-8');
                if (debug) {
                    fs.readFile(__filename, function(err, data) {
                        if (err) {
                            res.statusCode = 500;
                            res.statusMessage = 'Internal error';
                            res.write('//'+err.message);
                        }
                        else {
                            res.write(data);
                        }
                        res.end();
                    });
                } else {
                    res.write(app_js);
                    res.end();
                }
            } else if (['/index.html', '/'].indexOf(server.pathname) >= 0) {
                res.setHeader('Content-type', 'text/html; charset=utf-8');
                if (debug) {
                    fs.readFile(indexFile, function(err, data) {
                        if (err) {
                            res.statusCode = 500;
                            res.statusMessage = 'Internal error';
                            res.write(err.message);
                        } else {
                            res.write(data);
                        }
                        res.end();
                    });
                } else {
                    res.write(index_html);
                    res.end();
                }
            } else if (req.method == 'POST') {
                switch (server.pathname) {
                    case '/rebuild':
                        rebuild();
                        res.writeHead(301, {Location: '/?rebuilding=true'});
                    break;
                    case '/run':
                        if (server.query && server.query.num && server.query.num.match(/^\d+$/)) {
                            num = parseInt(server.query.num);
                        }
                        start(true);
                        res.writeHead(301, {Location: '/?running=true'});
                    break;
                    default:
                        res.writeHead(301, {Location: '/404'});
                    break;

                }
                res.end();
            } else {
                res.setHeader('Content-type', 'text/html; charset=utf-8')
                res.statusCode = 404;
                res.statusMessage = 'Not found';
                res.write('<h1>'+res.statusMessage+'</h1>');
                res.end();
            }
        }).listen(port, function() {
            console.log('server started at port', port);
        });
    }
}

;(function(type) {
    if (type == 'browser') {
        app();
    } else {
        if (process.argv.length > 2 && process.argv[2].match(/^[1-9][0-9]{1,6}$/g)) {
            var num = process.argv[2];
            var delay = typeof process.argv[3] != 'undefined' ? parseInt(process.argv[3]) : 5;
            if (process.env.TOTAL_PRIME_NUMBERS && process.env.TOTAL_PRIME_NUMBERS.match(/^\d+$/)) {
                num = parseInt(process.env.TOTAL_PRIME_NUMBERS);
            }
            if (process.env.SECOND_DELAY && process.env.SECOND_DELAY.match(/^\d+$/)) {
                delay = parseInt(process.env.SECOND_DELAY);
            }
            build(num, delay);
        } else {
            console.log('Please specify a total prime numbers. between 10 and 999999.');
        }
    }
})(typeof window != 'undefined'?'browser':'node')