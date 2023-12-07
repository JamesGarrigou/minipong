import React from 'react';
import './Scoreboard.css';
import { scoreboard } from '../../shared/config/pong.config';

export default class Scoreboard extends React.Component {
	constructor(props) {
		super(props);
		var raf;
	}

	drawPing(ping, ctx) {
		const connectedRadius = 10;
		const connectedMargin = 2;

		// Draw grey background
		ctx.beginPath();
		ctx.arc(
			scoreboard.width / 2,
			scoreboard.height / 2,
			connectedRadius + connectedMargin,
			0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fillStyle = "rgb(20, 20, 20)";
		ctx.fill();

		// Draw red/green button
		ctx.beginPath();
		ctx.arc(
			scoreboard.width / 2,
			scoreboard.height / 2,
			connectedRadius,
			0, 2 * Math.PI, true);
		ctx.closePath();
		ctx.fillStyle = ping.connected ? "rgb(200, 0, 0)" : "rgb(0, 200, 0)";
		ctx.fill();

		// Draw ping
		ctx.font = "14px serif";
		ctx.fillStyle = "grey";
		ctx.fillText(
			`${ping.latency}ms`.padStart(5, ' '),
			scoreboard.width / 2 - 18,
			scoreboard.height * 4 / 5);
	}

	drawScore(player, ctx) {
		const fontsize = 50;
		const x = (player.position === 0)
			? scoreboard.width / 4 - fontsize / 2
			: 3 * scoreboard.width / 4 - fontsize / 2;

		ctx.font = `${fontsize}px serif`;
		ctx.fillStyle = "white";
		ctx.fillText(`${player.score}`, x, (scoreboard.height + fontsize) / 2);
	}

	drawKeys(ctx) {
		const fontsize = 20;
		const margin = 27;
		const offset1 = scoreboard.width / 3 + fontsize / 2;
		const offset2 = 2 * scoreboard.width / 3 + fontsize / 2;

		ctx.font = `${fontsize}px serif`;
		ctx.fillStyle = "white";
		ctx.fillText("🆆", margin, offset1);
		ctx.fillText("🆂", margin, offset2);
		ctx.fillText("⬆️", scoreboard.width - margin - fontsize, offset1);
		ctx.fillText("⬇️", scoreboard.width - margin - fontsize, offset2);
	}

	clearCanvas(ctx) {
		ctx.fillStyle = "rgb(0, 0, 255)"
		ctx.fillRect(0, 0, scoreboard.width, scoreboard.height);
	}

	draw = () => {
		const canvas = document.getElementById("ScoreboardCanvas");
		const ctx = canvas.getContext("2d");

		this.clearCanvas(ctx);
		this.drawPing(this.props.ping, ctx);
		this.drawScore(this.props.player1, ctx);
		this.drawScore(this.props.player2, ctx);
		this.drawKeys(ctx);
		this.raf = window.requestAnimationFrame(this.draw);
	};

	componentDidMount() {
		this.draw();
	}

	render() {
		return (
			<canvas
				id="ScoreboardCanvas"
				width={scoreboard.width}
				height={scoreboard.height}>
			</canvas>
		);
	}
}
