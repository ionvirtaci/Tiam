interface PeerConnection {
	socket: WebSocket;
	id: string;
}

const peers = new Map<string, PeerConnection>();

Deno.serve((req) => {
	if (req.headers.get('upgrade') != 'websocket') {
		return new Response(null, { status: 501 });
	}
	const { socket, response } = Deno.upgradeWebSocket(req);
	const peerId = self.crypto.randomUUID();

	socket.addEventListener('open', () => {
		peers.set(peerId, { socket: socket, id: peerId });
		console.log(`Peer ${peerId} connected.`)

		// notify peer of their id
		socket.send(JSON.stringify({ type: "yourId", id: peerId }));

		const existingPeerIds = Array.from(peers.keys()).filter(id => id !== peerId);

		if (existingPeerIds.length > 0) {
			socket.send(JSON.stringify({ type: "existingPeers", peerIds: existingPeerIds }));
		}

		// Notify other peers of the new connection
		peers.forEach(p => {
			if (p.id !== peerId) {
				p.socket.send(JSON.stringify({ type: "newPeer", peerId: peerId }));
			}
		});

	});

	socket.addEventListener('message', (event) => {
		try {
			if (typeof event.data === "string") {
				const message = JSON.parse(event.data);
				console.log(`Received message from ${peerId}:`, message);

				// All signaling messages (offer, answer, candidate) are simply relayed
				// from the sender to the specified targetId.
				if (message.targetId && peers.has(message.targetId)) {
					const targetPeer = peers.get(message.targetId)!;
					// Add senderId to the message before forwarding
					targetPeer.socket.send(JSON.stringify({ ...message, senderId: peerId }));
					console.log(`Forwarded ${message.type} from ${peerId} to ${message.targetId}`);
				} else {
					console.warn(`Target peer ${message.targetId} not found for message type ${message.type}.`);
				}
			}
		} catch (e) {
			console.error(`Error processing message from ${peerId}:`, e);
		}
	});

	socket.addEventListener('close', () => {
		console.log(`Peer ${peerId} disconnected.`);
		peers.delete(peerId);
		// Notify other peers of the disconnection
		peers.forEach(p => {
			if (p.id !== peerId) {
				p.socket.send(JSON.stringify({ type: "peerDisconnected", peerId: peerId }));
			}
		});
	})

	socket.addEventListener('error', event => {
		console.error(`WebSocket error for peer ${peerId}:`, event);
		// In case of error, treat it like a close
		peers.delete(peerId);
		peers.forEach(p => {
			if (p.id !== peerId) {
				p.socket.send(JSON.stringify({ type: "peerDisconnected", peerId: peerId }));
			}
		});
	})

	return response;
});
