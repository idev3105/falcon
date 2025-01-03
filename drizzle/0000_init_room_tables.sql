CREATE TABLE "room_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"room_id" text NOT NULL,
	"current_location" json,
	"history_location" json
);
--> statement-breakpoint
CREATE TABLE "room" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "room_participant" ADD CONSTRAINT "room_participant_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE no action ON UPDATE no action;