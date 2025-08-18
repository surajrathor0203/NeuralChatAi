CREATE TABLE "public"."chats" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "title" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON UPDATE cascade ON DELETE cascade
);

CREATE TABLE "public"."messages" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "chat_id" uuid NOT NULL,
    "sender" text NOT NULL,
    "content" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY ("id"),
    FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON UPDATE cascade ON DELETE cascade
);

-- Track tables with Hasura
-- This would be part of the metadata, but for instruction:
-- In Hasura Console > Data > public > chats > Track
-- In Hasura Console > Data > public > messages > Track

-- Track relationships
-- In Hasura Console > Data > public > messages > Relationships > Add Relationship
-- Relationship Type: Object Relationship
-- Relationship Name: chat
-- Reference Schema: public
-- Reference Table: chats
-- From column(s): [chat_id] -> To column(s): [id]

-- In Hasura Console > Data > public > chats > Relationships > Add Relationship
-- Relationship Type: Array Relationship
-- Relationship Name: messages
-- Reference Schema: public
-- Reference Table: messages
-- From column(s): [id] -> To column(s): [chat_id]
