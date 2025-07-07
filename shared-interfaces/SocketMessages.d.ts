type PeerId =  `${string}-${string}-${string}-${string}-${string}`;

export interface CurrentUserID {
    type: "yourId",
    id: PeerId
}

export interface ExistingPeers {
    type: "existingPeers";
    peerIds: Array<PeerId>;
}

export interface NewPeer {
    type: "newPeer";
    peerId: PeerId;
}

export interface PeerDisconnected {
    type: "peerDisconnected";
    peerId: PeerId;
}