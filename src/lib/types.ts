export type Location = {
	lng: number;
	lat: number;
};

// Room types
export type Room = {
	id: string;
	name: string;
	participants: RoomParticipant[];
};

export type RoomParticipant = {
	id: string;
	name: string;
	currentLocation: Location | undefined;
	historyLocation: Location[] | undefined;
};

// Event types
export type EventType = 'join' | 'leave';

export type Event<T> = {
	type: EventType;
	data: T;
};

export type EventJoin = Event<{ sessionId: string }>;
export type EventLeave = Event<{ sessionId: string }>;

// Context types
export type RoomContext = {
	roomId?: string;
	sessionId: string;
	name?: string;
	currentLocation?: Location;
};
