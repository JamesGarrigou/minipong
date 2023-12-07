import React from 'react';
import { board, paddle } from '../../shared/config/pong.config.ts';
import './Board.css';

export default class Board extends React.Component {
	constructor(props) {
		super(props);
		var raf;
	}

	norm(x, y) {
		return (Math.sqrt(x * x + y * y));
	}

	ballTouchPaddle(ball, player) {
		const	oldX = ball.x - 3 * ball.vx;
		var		boundedLeft;
		var		boundedRight;
		const	boundedUp = ball.y - ball.r <= player.y + paddle.height;
		const	boundedDown = ball.y + ball.r >= player.y

		if (player.position === 0)
			boundedLeft = oldX >= paddle.margin,
			boundedRight = ball.x - ball.r <= paddle.margin + paddle.width;
		else
			boundedLeft = ball.x + ball.r >= board.width - paddle.margin - paddle.width,
			boundedRight = oldX <= board.width - paddle.margin;
		return (boundedUp && boundedDown && boundedLeft && boundedRight);
	}

	reflectBall(ball, player) {
		var v = Math.hypot(ball.vx, ball.vy);
		const relativePos = ball.y - player.y - paddle.height / 2;
		var theta = relativePos / (paddle.height + ball.r) * Math.PI / 2;

		if (player.position === 1)
			theta = -theta + Math.PI;
		if (ball.kickoff)
			v = 4, ball.kickoff = false;
		v *= 1.02;
		ball.vx = v * Math.cos(theta);
		ball.vy = v * Math.sin(theta);
		ball.x += ball.vx;
		ball.y += ball.vy;
	}

	manageBallTouchPaddle(ball, player1, player2) {
		var theta;

		if (this.ballTouchPaddle(ball, player1)) {
			this.props.ballTouchPaddle("1");
			this.reflectBall(ball, player1);
		}
		if (this.ballTouchPaddle(ball, player2)) {
			this.props.ballTouchPaddle("2");
			this.reflectBall(ball, player2);
		}
	}

	manageBallOffLimits(ball) {
		const offLimitLeft = ball.x + ball.r < 0;
		const offLimitRight = ball.x + ball.r > board.width;
		const offLimitUp = ball.y - ball.r < 0;
		const offLimitDown = ball.y + ball.r > board.height;

		if (offLimitLeft) {
			this.props.ballOffLimit("2");
			ball.x = board.width / 2;
			ball.y = board.height / 2;
			ball.vx = 0;
			ball.vy = 0;
		}
		if (offLimitRight) {
			this.props.ballOffLimit("1");
			ball.x = board.width / 2;
			ball.y = board.height / 2;
			ball.vx = 0;
			ball.vy = 0;
		}
		if (offLimitUp) {
			ball.y = 2 * ball.r - ball.y;
			ball.vy = -ball.vy;
		}
		if (offLimitDown) {
			ball.y = 2 * (board.height - ball.r) - ball.y;
			ball.vy = -ball.vy;
		}
	}

	updateBall(ball, player1, player2) {
		ball.x += ball.vx;
		ball.y += ball.vy;
		this.manageBallTouchPaddle(ball, player1, player2);
		this.manageBallOffLimits(ball);
	}

	updatePaddle(player) {
		player.y += player.vy;
		if (player.y < 0) {
			player.y = 0;
			player.vy = 0;
		}
		if (player.y + paddle.height > board.height) {
			player.y = board.height - paddle.height;
			player.vy = 0;
		}
	}

	update() {
		this.updateBall(this.props.ball, this.props.player1, this.props.player2);
		this.updatePaddle(this.props.player1);
		this.updatePaddle(this.props.player2);
	}

	createGradientDragEffect(ball, drag, v, ctx) {
		const lowSpeedFilter = 0.5 * v * v / (200 + v * v) + 0.5 * v / (50 + v);
		const gradient = ctx.createRadialGradient(0, 0, ball.r / 2, 0, 0, drag);

		gradient.addColorStop(0, `rgba(255, 100, 255, ${lowSpeedFilter})`);
		gradient.addColorStop(1, "rgba(255, 100, 255, 0)");
		return (gradient);
	}

	drawBall(ball, ctx) {
		const theta = Math.atan2(-ball.vy, -ball.vx);
		const v = this.norm(ball.vx, ball.vy);
		const ballColor = "rgb(255,0,255)";
		const drag = ball.r + 3 * v;
		const gradient = this.createGradientDragEffect(ball, drag, v, ctx);

		// Draw drag effect
		ctx.translate(ball.x, ball.y);
		ctx.rotate(theta);
		ctx.fillStyle = gradient;
		ctx.fillRect(0, -ball.r, drag, 2 * ball.r);
		ctx.setTransform(1, 0, 0, 1, 0, 0);

		// Draw ball
		ctx.beginPath();
		ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fillStyle = ballColor;
		ctx.fill();
	}

	drawPaddle(player, ctx) {
		const player1Color = "rgb(255,0,0)";
		const player2Color = "rgb(0,0,255)";

		if (player.position === 0)
			ctx.translate(paddle.margin, 0),
			ctx.fillStyle = player1Color;
		else
			ctx.translate(board.width - paddle.margin - paddle.width, 0),
			ctx.fillStyle = player2Color;
		ctx.fillRect(0, player.y, paddle.width, paddle.height);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
	}

	clearCanvas(ball, ctx) {
		const v = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
		ctx.fillStyle = `rgba(0, 255, 0, ${1 - v / (500 + v)})`;
		ctx.fillRect(0, 0, board.width, board.height);
	}

	draw(ctx) {
		this.clearCanvas(this.props.ball, ctx);
		this.drawBall(this.props.ball, ctx);
		this.drawPaddle(this.props.player1, ctx);
		this.drawPaddle(this.props.player2, ctx);
	}

	renderUpdate = () => {
		const canvas = document.getElementById("BoardCanvas");
		const ctx = canvas.getContext("2d");

		this.update();
		this.draw(ctx);
		this.raf = window.requestAnimationFrame(this.renderUpdate);
	};

	componentDidMount() {
		this.renderUpdate();
	}

	componentWillUnmount() {
	}

	render() {
		return (
			<canvas id="BoardCanvas" width="600" height="300">
			</canvas>
		);
	}
}
