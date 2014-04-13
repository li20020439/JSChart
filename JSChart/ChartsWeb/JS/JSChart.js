(function () {
    var _JSChart = {
        _defaultcolors:
            ["#6699cc",
            "#663366",
            "#cccc99",
            "#990033",
            "#ccff66",
            "#ff9900",
            "#666699",
            "#660033",
            "#99cc99",
            "#993366",
            "#cccc33",
            "#666633",
            "#996600",
            "#cccc66",
            "#666600",
            "#009933",
            "#cc9900",
            "#666666"],
        _titleheight: 40,
        _titlefont: "20px Arial",
        _font: "12px Arial",
        _width: 600,
        _height: 400,

        PieCharts: function (containerid, config) {
            this.defaultconfig = {
                colors: _JSChart._defaultcolors,
                style: "default",
                titleheight: _JSChart._titleheight,
                titlefont: _JSChart._titlefont,
                font: _JSChart._font,
                width: _JSChart._width,
                height: _JSChart._height,
                outlinelong: 50,
                title: "",
            };
            this.config = config;
            this.containerid = containerid;
            this.settings = {
                width: 0,
                height: 0,
                data: {},
                style: "",
                title: "",
                colors: [],
                titleheight: 0,
                titlefont: "",
                font: "",
                centerpoint: { x: 0, y: 0 },
                radii: 0,
                outlinelong: 0
            };
            this.canvas = null;
            this.drawdata = [];
            this.drawstrs = [];
            this.starts = [];
            this.outpoints = [];
            this.currentpart = -1;
        },
        ErrMsg: {
            ContainerErr: "",
            DataErr: ""
        }
    };
    _JSChart.PieCharts.prototype = {
        _Init: {
            default: function (self) {
                var newcenter = self.config.centerpoint || {};
                var oldcenter = self.settings.centerpoint || {};
                if (!!newcenter && !!newcenter.x && !!newcenter.y) {
                    self.settings.centerpoint = newcenter;
                }
                else if (!!!oldcenter || !!!oldcenter.x || !!!oldcenter.y) {
                    var fontheight = (Number(self.settings.font.substring(0, self.settings.font.indexOf("px"))) + 5) * 2;
                    oldcenter = {
                        x: Math.floor(self.settings.width / 2),
                        y: Math.floor(self.settings.titleheight + (self.settings.height - self.settings.titleheight) / 2)
                    };
                    self.settings.centerpoint = oldcenter;
                }
                if (!!self.config.radii) {
                    self.settings.radii = self.config.radii;
                }
                else if (!!!self.settings.radii) {
                    var redii = Math.floor((self.settings.height - self.settings.titleheight - fontheight - self.settings.outlinelong * 2) / 2);
                    self.settings.radii = redii;
                }
                var outpoints = [];
                for (var index = 1; index < self.drawdata.length ; index++) {
                    var points = {
                        start: {
                            x: self.settings.centerpoint.x + Math.floor(Math.cos((self.drawdata[index - 1] + self.drawdata[index]) / 2) * self.settings.radii),
                            y: self.settings.centerpoint.y + Math.floor(Math.sin((self.drawdata[index - 1] + self.drawdata[index]) / 2) * self.settings.radii)
                        },
                        end: {
                            x: self.settings.centerpoint.x + Math.floor(Math.cos((self.drawdata[index - 1] + self.drawdata[index]) / 2) * (self.settings.radii + self.settings.outlinelong)),
                            y: self.settings.centerpoint.y + Math.floor(Math.sin((self.drawdata[index - 1] + self.drawdata[index]) / 2) * (self.settings.radii + self.settings.outlinelong))
                        }
                    };
                    outpoints.push(points);
                }
                self.outpoints = outpoints;
            },
            classics: function (self) { },

        },
        Getdrawdata: function () {
            self = this;
            if (!!self.config.data) {
                var data = self.settings.data = self.config.data;
                var sum = 0;
                for (var attr in data) {
                    if (typeof (data[attr]) != "number") {
                        throw "DataErr";
                    }
                    else {
                        sum += data[attr];
                    }
                }
                var drawdata = [];
                var drawstrs = [];
                drawdata.push(0);
                var currentval = 0;
                for (var attr in data) {
                    currentval += data[attr];
                    drawdata.push(Math.PI * 2 * currentval / sum);
                    drawstrs.push(attr + ":" + data[attr]);
                }
                self.drawdata = drawdata;
                self.drawstrs = drawstrs;
            }
            else if (!!!self.settings.data) {
                throw "DataErr";
            }

        },
        Init: function () {
            var self = this;
            if (!!!self.containerid) {
                throw "ContainerErr";
            }
            if (!!!this.canvas) {
                var container = document.getElementById(self.containerid);
                if (!!!container) {
                    throw "ContainerErr";
                }
                else if (container.nodeName.toLowerCase() != "canvas") {
                    var c = document.createElement("canvas");
                    container.appendChild(c);
                    self.canvas = c;
                }
                else {
                    self.canvas = container;
                }
            }
            self.Getdrawdata();
            for (var attr in self.defaultconfig) {
                if (!!self.config[attr]) {
                    if (typeof (self.config[attr]) != "object" || !!self.config[attr].length) {
                        self.settings[attr] = self.config[attr];
                    }
                    else {
                        self.settings[attr] = self.defaultconfig[attr];
                    }
                }
                else {
                    self.settings[attr] = self.defaultconfig[attr];
                }
            }
            if (!!self._Init[self.settings.style]) {
                self._Init[self.settings.style](self);
            }
            self.config = null;
        },
        _Draw: {
            default: function (self) {
                var settings = self.settings;
                var ctx = self.canvas.getContext("2d");
                ctx.clearRect(0, 0, settings.width, settings.height);
                ctx.translate(0, 0);
                if (!!settings.title) {
                    ctx.font = settings.titlefont;
                    ctx.textAlign = "center";
                    ctx.fillText(settings.title, settings.width / 2, settings.titleheight);

                }
                var outpoints = self.outpoints;
                ctx.beginPath();
                ctx.font = settings.font;
                ctx.textAlign = "left";
                var charheight = Number(self.settings.font.substring(0, self.settings.font.indexOf("px"))) + 5;
                for (var index = 0; index < outpoints.length; index++) {
                    ctx.moveTo(outpoints[index].start.x, outpoints[index].start.y);
                    ctx.lineTo(outpoints[index].end.x, outpoints[index].end.y);
                    ctx.lineTo(outpoints[index].end.x + 60, outpoints[index].end.y)
                    ctx.stroke();
                    var texty = outpoints[index].end.y - 5;
                    if (outpoints[index].start.y < outpoints[index].end.y) {
                        texty = outpoints[index].end.y + charheight;
                    }
                    ctx.fillText(self.drawstrs[index], outpoints[index].end.x, texty);
                }
                for (var index = 1; index < self.drawdata.length; index++) {
                    if (index - 1 != self.currentpart) {
                        ctx.beginPath();
                        ctx.fillStyle = settings.colors[index - 1];
                        ctx.moveTo(settings.centerpoint.x, settings.centerpoint.y)
                        ctx.arc(settings.centerpoint.x, settings.centerpoint.y, settings.radii, self.drawdata[index - 1], self.drawdata[index]);
                        ctx.fill();
                    }
                }
                
            },
            classics: function (self) {

            }
        },
        Draw: function () {
            var self = this;
            self.canvas.width = self.settings.width;
            self.canvas.height = self.settings.height;
            if (!!self._Draw[self.settings.style]) {
                self._Draw[self.settings.style](self);
            }
        }
    };
    var JSChart = window.JSChart = {
        Charts: {},
        Get: function (containerid, mode, config) {
            var self = this;
            if (!!self.Charts[containerid]) {
                return self.Charts[containerid];
            }
            else {
                if (!!_JSChart[mode]) {
                    var chart = new _JSChart[mode](containerid, config);
                    chart.Init();
                    chart.Draw();
                    self.Charts[containerid] = chart;
                    return chart;
                }
            }
        }
    };

})()