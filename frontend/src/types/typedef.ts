// src/types/messages.ts

// ==== FRONTEND → BACKEND ====

export type OutgoingMessage =
    | DMOutgoingMessage
    | ServerOutgoingMessage
    | ServerCreateMessage
    | ServerJoinMessage;

export type DMOutgoingMessage = {
    type: "dm";
    to: string;           // receiver username
    message: string;      // content
};

export type ServerOutgoingMessage = {
    type: "server";
    server: string;       // server name
    message: string;      // content
};

export type ServerCreateMessage = {
    type: "server-create";
    serverName: string;
    ownerName: string;
};

export type ServerJoinMessage = {
    type: "server-join";
    username: string;
    serverName: string;
};

// ==== BACKEND → FRONTEND ====

export type IncomingMessage =
    | DMIncomingMessage
    | ServerIncomingMessage
    | ErrorMessage;

export type DMIncomingMessage = {
    type: "dm";
    sender: string;
    message: string;
};

export type ServerIncomingMessage = {
    type: "server";
    sender: string;
    message: string;
};

export type ErrorMessage = {
    type: "error";
    message: string;
};
