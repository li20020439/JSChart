/******************************************************************************************************************************************************************************************************
************************************************* Eidt by:AsLand      使用时请保持本文本 **************************************************************************************************************
************************************************* 如有问题，请邮件：li20020439@qq.com   ***************************************************************************************************************
******************************************************************************************************************************************************************************************************/
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
            ContainerErr: "未指定用于呈现图片的容器或找不到指定的容器！",
            DataErr: "未提供绘图数据或数据格式存在问题！",
            StyleErr: "该类图表未实现指定的绘图样式！",
            ModeErr: "未能找到指定的图表类型！"
        }
    };
    _JSChart.PieCharts.prototype = {
        _Init: {//不同模式下的初始化处理数据的方法。
            default: function (self) {
                //求可用于画图的中心点
                var newcenter = self.config.centerpoint;
                var oldcenter = self.settings.centerpoint;
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
                //求饼状图的半径
                if (!!self.config.radii) {
                    self.settings.radii = self.config.radii;
                }
                else if (!!!self.settings.radii) {
                    var ymax = Math.floor((self.settings.height - self.settings.titleheight - fontheight * 2 - self.settings.outlinelong * 2) / 2);
                    var xmax = Math.floor((self.settings.width - self.settings.outlinelong * 2 - 100) / 2);
                    self.settings.radii = Math.min(xmax, ymax);
                }
                //求指示线的点集合
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
            classics: function (self) {
                var fontheight = Number(self.settings.font.substring(0, self.settings.font.indexOf("px"))) + 5;
                //求外部文本的最大长度
                var outlinelong = 0;
                for (var attr in self.settings.data) {
                    var textlong = (attr.length + 2) * fontheight;
                    outlinelong = Math.max(outlinelong, textlong);
                }
                self.settings.outlinelong = outlinelong;
                var newcenter = self.config.centerpoint;
                var oldcenter = self.settings.centerpoint;
                if (!!newcenter && !!newcenter.x && !!newcenter.y) {
                    self.settings.centerpoint = newcenter;
                }
                else if (!!!oldcenter || !!!oldcenter.x || !!!oldcenter.y) {
                    oldcenter = {
                        x: Math.floor((self.settings.width - self.settings.outlinelong) / 2),
                        y: Math.floor(self.settings.titleheight + (self.settings.height - self.settings.titleheight) / 2)
                    };
                    self.settings.centerpoint = oldcenter;
                }
                //求饼状图的半径
                if (!!self.config.radii) {
                    self.settings.radii = self.config.radii;
                }
                else if (!!!self.settings.radii) {
                    var ymax = Math.floor((self.settings.height - self.settings.titleheight - fontheight * 2) / 2);
                    var xmax = Math.floor((self.settings.width - self.settings.outlinelong * 3) / 2);
                    self.settings.radii = Math.min(xmax, ymax);
                }
                //求指示文本起点集合
                var outpoints = [];
                for (var index = 1; index < self.drawdata.length ; index++) {
                    var point = {
                        x: self.settings.centerpoint.x + Math.floor(Math.cos((self.drawdata[index - 1] + self.drawdata[index]) / 2) * self.settings.radii),
                        y: self.settings.centerpoint.y + Math.floor(Math.sin((self.drawdata[index - 1] + self.drawdata[index]) / 2) * self.settings.radii)
                    };
                    outpoints.push(point);
                }
                self.outpoints = outpoints;
            }

        },
        Getdrawdata: function () {//求直接用于画图的数据和文本
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
        Init: function () {//初始化操作
            var self = this;
            //画布
            if (!!!self.containerid) {
                throw "ContainerErr";
            }
            if (!!!self.canvas) {
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
            self.canvas.style.position = "relative";
            self.Getdrawdata();
            //复制属性，若未设置则应用默认值
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
            //细化初始化
            if (!!self._Init[self.settings.style]) {
                self._Init[self.settings.style](self);
            }
            else {
                throw "StyleErr";
            }
            self.config = null;
        },
        _Draw: {//画图的详细实现
            default: function (self) {
                var settings = self.settings;
                var ctx = self.canvas.getContext("2d");
                ctx.clearRect(0, 0, settings.width, settings.height);
                ctx.translate(0, 0);
                if (!!settings.title) {//标题
                    ctx.font = settings.titlefont;
                    ctx.textAlign = "center";
                    ctx.fillText(settings.title, settings.width / 2, settings.titleheight);

                }
                //指示线及文本
                var outpoints = self.outpoints;
                ctx.beginPath();
                ctx.font = settings.font;
                var charheight = Number(self.settings.font.substring(0, self.settings.font.indexOf("px"))) + 5;
                for (var index = 0; index < outpoints.length; index++) {
                    var startx = outpoints[index].start.x;
                    var starty = outpoints[index].start.y;
                    var endx = outpoints[index].end.x;
                    var endy = outpoints[index].end.y;
                    if (index == self.currentpart) {
                        var xmoved = Math.floor(Math.cos((self.drawdata[index] + self.drawdata[index + 1]) / 2) * 10);
                        var ymoved = Math.floor(Math.sin((self.drawdata[index] + self.drawdata[index + 1]) / 2) * 10);
                        startx = startx + xmoved;
                        starty = starty + ymoved;
                        endx = endx + xmoved;
                        endy = endy + ymoved;
                    }
                    ctx.moveTo(startx, starty);
                    ctx.lineTo(endx, endy);
                    if (startx <= endx) {
                        ctx.lineTo(endx + 60, endy);
                    }
                    else {
                        ctx.lineTo(endx - 60, endy);
                    }
                    ctx.stroke();
                    var texty = endy - 5;
                    if (starty < endy) {
                        texty = endy + charheight;
                    }
                    ctx.textAlign = "left";
                    if (startx > endx) {
                        ctx.textAlign = "right";
                    }
                    ctx.fillText(self.drawstrs[index], endx, texty);
                }
                //画饼图
                for (var index = 1; index < self.drawdata.length; index++) {
                    var x = settings.centerpoint.x;
                    var y = settings.centerpoint.y;
                    if (index - 1 == self.currentpart) {
                        x = settings.centerpoint.x + Math.floor(Math.cos((self.drawdata[index - 1] + self.drawdata[index]) / 2) * 10);
                        y = settings.centerpoint.y + Math.floor(Math.sin((self.drawdata[index - 1] + self.drawdata[index]) / 2) * 10);
                    }
                    ctx.beginPath();
                    ctx.fillStyle = settings.colors[index - 1];
                    ctx.moveTo(x, y)
                    ctx.arc(x, y, settings.radii, self.drawdata[index - 1], self.drawdata[index]);
                    ctx.fill();
                }
            },
            classics: function (self) {
                var settings = self.settings;
                var ctx = self.canvas.getContext("2d");
                ctx.clearRect(0, 0, settings.width, settings.height);
                ctx.translate(0, 0);
                if (!!settings.title) {//标题
                    ctx.font = settings.titlefont;
                    ctx.textAlign = "center";
                    ctx.fillText(settings.title, settings.width / 2, settings.titleheight);

                }
                var outpoints = self.outpoints;
                ctx.beginPath();
                ctx.font = settings.font;
                var charheight = Number(self.settings.font.substring(0, self.settings.font.indexOf("px"))) + 5;
                var attry = settings.titleheight + charheight;
                var attrx = settings.width + charheight - settings.outlinelong;
                var index = 0;
                for (var attr in settings.data) {
                    var startx = outpoints[index].x;
                    var starty = outpoints[index].y;
                    if (index == self.currentpart) {
                        var xmoved = Math.floor(Math.cos((self.drawdata[index] + self.drawdata[index + 1]) / 2) * 10);
                        var ymoved = Math.floor(Math.sin((self.drawdata[index] + self.drawdata[index + 1]) / 2) * 10);
                        startx = startx + xmoved;
                        starty = starty + ymoved;
                    }
                    var texty = starty - 5;
                    if (starty > settings.centerpoint.y) {
                        texty = starty + charheight;
                    }
                    ctx.textAlign = "left";
                    if (startx < settings.centerpoint.x) {
                        ctx.textAlign = "right";
                    }
                    ctx.fillStyle = "#000";
                    ctx.fillText(settings.data[attr], startx, texty);
                    ctx.textAlign = "left";
                    ctx.fillText(attr, attrx, attry);

                    var x = settings.centerpoint.x;
                    var y = settings.centerpoint.y;
                    if (index == self.currentpart) {
                        x = settings.centerpoint.x + Math.floor(Math.cos((self.drawdata[index] + self.drawdata[index + 1]) / 2) * 10);
                        y = settings.centerpoint.y + Math.floor(Math.sin((self.drawdata[index] + self.drawdata[index + 1]) / 2) * 10);
                    }
                    ctx.beginPath();
                    ctx.fillStyle = settings.colors[index];
                    ctx.moveTo(x, y)
                    ctx.arc(x, y, settings.radii, self.drawdata[index], self.drawdata[index + 1]);
                    ctx.fill();
                    ctx.fillRect(attrx - charheight + 2, attry - charheight + 7, charheight - 4, charheight - 4);

                    attry = attry + charheight;
                    index = index + 1;
                }
            }
        },
        Draw: function () {//供外部调用的作图方法
            var self = this;
            self.canvas.width = self.settings.width;
            self.canvas.height = self.settings.height;
            if (!!self._Draw[self.settings.style]) {
                self._Draw[self.settings.style](self);
            }
            var ctx = self.canvas.getContext("2d");
            ctx.beginPath();
            ctx.font = self.settings.font;
            ctx.fillStyle = "#666";
            ctx.textAlign = "right";
            ctx.fillText("by JSChart", self.settings.width, self.settings.height - 5);
        },
        Event: function () {//事件挂载，目前只实现一种动态效果
            var self = this;
            self.canvas.addEventListener("mousemove", function (e) {
                var partindex = self.Getpart(e.layerX, e.layerY);
                if (partindex != self.currentpart) {
                    self.currentpart = partindex;
                    self.Draw();
                }
            });
        },
        Getpart: function (x, y) {//获取当前光标在图的哪一个部份，外部则为-1
            var self = this;
            var part = -1;
            if (self.Isinside(x, y)) {
                var angle = Math.atan2(y - self.settings.centerpoint.y, x - self.settings.centerpoint.x);
                if (angle < 0) {
                    angle = angle + 2 * Math.PI;
                }
                for (var index = 1; index < self.drawdata.length; index++) {
                    if (angle >= self.drawdata[index - 1] && angle < self.drawdata[index]) {
                        part = index - 1;
                    }
                }
            }
            return part;
        },
        Isinside: function (x, y) {//判断光标是否在饼状图内部
            var self = this;
            var xdist = x - self.settings.centerpoint.x;
            var ydist = y - self.settings.centerpoint.y;
            var dist = xdist * xdist + ydist * ydist;
            var rdist = (self.settings.radii + 15) * (self.settings.radii + 15);
            return dist <= rdist;
        },
        Create: function () {//供外部调用的创建方法
            var self = this;
            self.Init();
            self.Draw();
            self.Event();
        },
        Redraw: function (config) {//供外部调用的重画方法
            var self = this;
            self.config = config;
            self.Init();
            self.Draw();
        }
    };
    var JSChart = window.JSChart = {
        Charts: {},
        Get: function (containerid, mode, config) {
            try {
                var self = this;
                if (!!self.Charts[containerid]) {
                    return self.Charts[containerid];
                }
                else {
                    if (!!mode && !!_JSChart[mode]) {
                        var chart = new _JSChart[mode](containerid, config);
                        chart.Create();
                        self.Charts[containerid] = chart;
                        return chart;
                    }
                    else {
                        throw "ModeErr";
                    }
                }
            }
            catch (e) {
                alert(_JSChart.ErrMsg[e]);
            }
        },
        Redraw: function (containerid, config) {
            try {
                var self = this;
                if (!!!self.Charts[containerid]) {
                    throw "ContainerErr";
                }
                else {
                    var chart = self.Charts[containerid];
                    chart.Redraw(config);
                    return chart;
                }
            }
            catch (e) {
                alert(_JSChart.ErrMsg[e]);
            }
        }
    };

})()