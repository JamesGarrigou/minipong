import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets';
import {
	ServerToClientEvents,
	ClientToServerEvents,
} from '../shared/interfaces/events.interface';
import { DataMove, DataUpdate } from '../shared/interfaces/data.interface';
import { board, paddle } from '../shared/config/pong.config';
import { Server, Socket } from 'socket.io'

@WebSocketGateway(8001, { cors: true })
export class PongGateway {
	@WebSocketServer()
	public server: Server;
	private id = 1;
	private data: DataUpdate;

	@SubscribeMessage('ping')
	handleEvent(
		@MessageBody() n: number,
		@ConnectedSocket() client: Socket
	): void {
		client.emit('ping', n);
	}

	updatePlayer(player, dt) {
		player.y += player.vy * dt;
		if (player.y < 0) {
			player.vy = 0;
			player.y = 0;
		}
		if (player.y + paddle.height > board.height) {
			player.vy = 0;
			player.y = board.height - paddle.height;
		}
	}

	updateBall(ball, dt) {
		ball.x += ball.vx * dt;
		ball.y += ball.vy * dt;
		if (ball.y - ball.r < 0)
			ball.y = 2 * ball.r - ball.y,
			ball.vy = -ball.vy;
		ball.y %= 2 * board.height;
		if (ball.y + ball.r > board.height)
			ball.y = 2 * (board.height - ball.r) - ball.y,
			ball.vy = -ball.vy;
	}

	updateData(data) {
		const dt = (new Date().getTime() - data.t.getTime()) * 60 / 1000;
		this.updatePlayer(data.player1, dt);
		this.updatePlayer(data.player2, dt);
		this.updateBall(data.ball, dt);
		data.t = new Date();
	}

	@SubscribeMessage('move')
	handleEventMove(
		@MessageBody() dataMove: DataMove,
		@ConnectedSocket() client: Socket
	): void {
		if (this.id < 3)
			return ;
		const player = (dataMove.id === "1") ? this.data.player1 : this.data.player2;
		const newSpeed = 5 * Math.sign(dataMove.direction);

		this.updateData(this.data);
		player.vy = newSpeed;
		this.server.emit('update', this.data);
	}

	launchBall(ball, vx) {
		ball.x = board.width / 2;
		ball.y = board.height / 2;
		ball.vx = vx;
		ball.vy = 0;
		ball.r = 10;
		ball.kickoff = true;
	}

	@SubscribeMessage('ballOffLimit')
	handleEventBallOffLimit(
		@MessageBody() id: string,
		@ConnectedSocket() client: Socket
	): void {
		if (this.id < 3)
			return ;
		this.updateData(this.data);
		const ball = this.data.ball;
		const ballGoneLeft = ball.x + ball.r < 0;
		const ballGoneRight = ball.x - ball.r > board.width;

		if (ballGoneLeft)
			this.data.player2.score += 1,
			this.launchBall(ball, 2);
		if (ballGoneRight)
			this.data.player1.score += 1,
			this.launchBall(ball, -2);
		this.server.emit('update', this.data);
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
		if (!this.ballTouchPaddle(ball, player))
			return ;
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

	@SubscribeMessage('ballTouchPaddle')
	handleEventBallTouchPaddle(
		@MessageBody() id: string,
		@ConnectedSocket() client: Socket
	): void {
		if (this.id < 3)
			return ;
		const player = (id === "1") ? this.data.player1 : this.data.player2;

		this.updateData(this.data);
		this.reflectBall(this.data.ball, player);
		this.server.emit('update', this.data);
	}

	@SubscribeMessage('join')
	handleEventJoin(
		@ConnectedSocket() client: Socket
	): void {
		client.emit('join', `${this.id}`);
		this.id += 1;
		if (this.id < 3)
			return ;
		this.data = {
			t: new Date(),
			player1: { score: 0, y: (board.height - paddle.height) / 2, vy: 0, position: 0 },
			player2: { score: 0, y: (board.height - paddle.height) / 2, vy: 0, position: 1 },
			ball: {
				x: board.width / 2,
				y: board.height / 2,
				vx: 2,
				vy: 0,
				r: 10,
				kickoff: true,
			},
		};
		this.server.emit('update', this.data);
	}
}
