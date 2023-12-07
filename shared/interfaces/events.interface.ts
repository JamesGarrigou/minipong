import { DataUpdate, DataMove } from './data.interface';

export interface ServerToClientEvents {
	ping: (n) => void;
	join: (id: string) => void;
	update: (data: DataUpdate) => void;
}

export interface ClientToServerEvents {
	ping: (n) => void;
	join: () => void;
	move: (dataMove: DataMove) => void;
	ballTouchPaddle: (id: string) => void;
	ballOffLimit: (id: string) => void;
}
