"use strict";

let ns;

void function(namespace) {

    let Game = (function () {

        function Game(canvas) {
            this.canvas = canvas;
            this.context = canvas.getContext("2d");
            this.running = false;
            this.timeout = null;
            this.counter = 0;
        }

        Game.prototype.input = function (keyCode) {
            if (!this.running) return;
            switch (keyCode) {
                case 38:
                    this.player.move({i:0, j:this.player.size.h/2});
                    break;
                case 40:
                    this.player.move({i:0, j:-this.player.size.h/2});
                    break;
            }
        };

        Game.prototype.paint = function () {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ball.draw(this.context);
            this.player.draw(this.context);
            this.text.draw(this.context);
        };

        Game.prototype.scored = function () {
            return this.ball.position.x < this.player.position.x &&
                (this.ball.position.y < this.player.position.y || this.ball.position.y > this.player.position.y + this.player.size.h);
        };

        Game.prototype.start = function () {
            const REFRESH_RATE = 1000/60;

            if (this.running) return;

            this.ball = new Ball({x: this.canvas.width/2, y: this.canvas.height/2}, {w: 10, h: 10}, {x: this.canvas.width, y: this.canvas.height});
            this.player = new Player({x: 0, y: (this.canvas.height - 100)/2}, {w: 10, h: 100}, {x: this.canvas.width, y: this.canvas.height});
            this.text = new Text(this.counter.toString(), "36px arial", {x:this.canvas.width/2, y:50});


			// prevent multiple timeout handlers from running at the same time
			// and from causing the ball to move faster and faster at each turn
            if (this.timeout) {
                clearTimeout(this.timeout);
            }

            let f = function () {
                this.update();
				if (this.running) this.timeout = setTimeout(f, REFRESH_RATE);
            }.bind(this);
            this.timeout = setTimeout(f, REFRESH_RATE);

            this.ball.launch();
            this.running = true;
        };

        Game.prototype.stop = function () {
            this.ball.stop();
            this.running = false;
        };

        Game.prototype.update = function () {
            this.ball.update();
            if (this.scored()) {
                this.stop();
            } else {
                this.text.update(this.ball.bounces.toString());
            }
            this.paint();
        };

        return Game;
    })();

    let Ball = (function () {

        function Ball(position, size, bounds) {
            this.position = position;
            this.size = size;
            this.bounds = bounds;
            this.velocity = {i: 0, j: 0};
            this.bounces = 0;
        }

        Ball.prototype.draw = function (context) {
            context.fillStyle = "rgba(5, 125, 250, 0.5)";
            context.fillRect(this.position.x - (this.size.w/2), this.position.y - (this.size.h/2), this.size.w, this.size.h);
        };

        Ball.prototype.launch = function () {
            function r() {
                return Math.ceil(2 + (Math.random() * 8));
            }
            this.velocity = {i: r(), j: r()};
            this.bounces = 0;
        };

        Ball.prototype.position = function () {
            return this.position;
        };

        Ball.prototype.stop = function () {
            this.velocity = {i: 0, j: 0};
        };

        Ball.prototype.update = function () {
            this.position = {x: this.position.x + this.velocity.i, y: this.position.y + this.velocity.j};
            if (this.position.x < 0 || this.position.x > this.bounds.x) {
                this.velocity.i = -this.velocity.i;
                this.bounces++;
            }
            if (this.position.y < 0 || this.position.y > this.bounds.y) {
                this.velocity.j = -this.velocity.j;
                this.bounces++;
            }
        };

        return Ball;
    })();

    let Player = (function () {

        function Player(position, size, bounds) {
            this.position = position;
            this.size = size;
            this.bounds = bounds;
        }

        Player.prototype.draw = function (context) {
            context.fillStyle = "rgba(250, 125, 5, 0.5)";
            context.fillRect(this.position.x, this.position.y, this.size.w, this.size.h);
        };

        Player.prototype.move = function (velocity) {
            this.position.x = this.position.x;
            this.position.y = this.position.y - velocity.j;
            if (this.position.y < 0) {
                this.position.y = 0;
            }
            if (this.position.y > this.bounds.y - this.size.h) {
                this.position.y = this.bounds.y - this.size.h;
            }
        };

        return Player;
    })();

    let Text = (function () {

        function Text(s, font, position) {
            this.s = s;
            this.font = font;
            this.position = position;
        }

        Text.prototype.draw = function (context) {
            let m = context.measureText(this.s);
            context.font = this.font;
            context.fillStyle = "rgba(255, 0, 0, 0.5)";
            context.fillText(this.s, this.position.x - (m.width/2), this.position.y);
        };

        Text.prototype.update = function (s) {
            this.s = s;
        };

        return Text;
    })();

    namespace.Game = Game;

}(ns || (ns = {}));


