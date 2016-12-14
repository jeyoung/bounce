"use strict";

let ns;

void function(namespace) {

    let Game = (function () {
        let $ = {};

        function paint() {
            $.context.clearRect(0, 0, $.canvas.width, $.canvas.height);
            $.ball.draw($.context);
            $.player.draw($.context);
            $.text.draw($.context); 
        };

        function Game(canvas) {
            $.canvas = canvas;
            $.context = canvas.getContext("2d");
            $.started = false;
            $.timeout = null;
            $.counter = 0;
        }

        Game.prototype.input = function (keyCode) {
            if (!$.started) return;
            switch (keyCode) {
                case 38:
                    $.player.move({i:0, j:$.player.size().h/2});
                    break;
                case 40:
                    $.player.move({i:0, j:-$.player.size().h/2});
                    break;
            }
        };

        Game.prototype.scored = function () {
            return $.ball.position().x < $.player.position().x && 
                ($.ball.position().y < $.player.position().y || $.ball.position().y > $.player.position().y + $.player.size().h);
        };

        Game.prototype.start = function () {
            const REFRESH_RATE = 1000/60;

            if ($.started) return;

            $.ball = new Ball({x: $.canvas.width/2, y: $.canvas.height/2}, {w: 10, h: 10}, {x: $.canvas.width, y: $.canvas.height});
            $.player = new Player({x: 0, y: ($.canvas.height - 100)/2}, {w: 10, h: 100}, {x: $.canvas.width, y: $.canvas.height});
            $.text = new Text($.counter.toString(), "36px arial", {x:$.canvas.width/2, y:50});


            // prevent multiple timeout handlers from running at the same
            // time and causing the ball to move faster and faster at each
            // turn
            if ($.timeout) {
                clearTimeout($.timeout);
            }

            let f = function () {
                this.update();
                $.timeout = setTimeout(f, REFRESH_RATE);
            }.bind(this);
            $.timeout = setTimeout(f, REFRESH_RATE);

            $.ball.launch();

            $.started = true;
        };

        Game.prototype.update = function () {
            $.ball.update();
            if (this.scored()) {
                $.ball.stop();
                $.started = false;
            } else {
                $.text.update($.ball.bounces().toString());
            }

            paint();
        };

        return Game;
    })();

    let Ball = (function () {
        let $ = {};

        function Ball(position, size, bounds) {
            $.position = position;
            $.size = size;
            $.bounds = bounds;
            $.velocity = {i: 0, j: 0};
            $.bounces = 0;
        }

        Ball.prototype.bounces = function () {
            return $.bounces;
        };

        Ball.prototype.draw = function (context) {
            context.fillStyle = "rgba(5, 125, 250, 0.5)";
            context.fillRect($.position.x - ($.size.w/2), $.position.y - ($.size.h/2), $.size.w, $.size.h);
        };

        Ball.prototype.launch = function () {
            function r() {
                return Math.ceil(2 + (Math.random() * 8));
            }
            $.velocity = {i: r(), j: r()};
            $.bounces = 0;
        };

        Ball.prototype.position = function () {
            return $.position;
        };

        Ball.prototype.stop = function () {
            $.velocity = {i: 0, j: 0};
        };

        Ball.prototype.update = function () {
            $.position = {x: $.position.x + $.velocity.i, y: $.position.y + $.velocity.j};
            if ($.position.x < 0 || $.position.x > $.bounds.x) {
                $.velocity.i = -$.velocity.i;
                $.bounces++;
            }
            if ($.position.y < 0 || $.position.y > $.bounds.y) {
                $.velocity.j = -$.velocity.j;
                $.bounces++;
            }
        };

        Ball.prototype.size = function () {
            return $.size;
        };

        return Ball;
    })();

    let Player = (function () {
        let $ = {};

        function Player(position, size, bounds) {
            $.position = position;
            $.size = size;
            $.bounds = bounds;
        }

        Player.prototype.draw = function (context) {
            context.fillStyle = "rgba(250, 125, 5, 0.5)";
            context.fillRect($.position.x, $.position.y, $.size.w, $.size.h);
        };

        Player.prototype.move = function (velocity) {
            $.position.x = $.position.x;
            $.position.y = $.position.y - velocity.j;
            if ($.position.y < 0) {
                $.position.y = 0;
            }
            if ($.position.y > $.bounds.y - $.size.h) {
                $.position.y = $.bounds.y - $.size.h;
            }
        };

        Player.prototype.position = function () {
            return $.position;
        };

        Player.prototype.size = function () {
            return $.size;
        };

        return Player;
    })();

    let Text = (function () {
        let $ = {};

        function Text(s, font, position) {
            $.s = s;
            $.font = font;
            $.position = position;
        }

        Text.prototype.draw = function (context) {
            let m = context.measureText($.s);
            context.font = $.font;
            context.fillStyle = "rgba(255, 0, 0, 0.5)";
            context.fillText($.s, $.position.x - (m.width/2), $.position.y);
        };

        Text.prototype.update = function (s) {
            $.s = s;
        };

        return Text;
    })();

    namespace.Game = Game;

}(ns || (ns = {}));


