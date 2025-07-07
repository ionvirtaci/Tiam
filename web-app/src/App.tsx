import {Box, Button, Container, createTheme, CssBaseline, Paper, Stack, TextField, ThemeProvider} from "@mui/material";
import {type ChangeEvent, useEffect, useState} from "react";
import {indigo, yellow} from "@mui/material/colors";
import {webSocket} from "rxjs/webSocket";
import {Subject, takeUntil} from "rxjs";
import type {MessageTypes, PeerId} from "../../shared-interfaces/SocketMessages";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: indigo[500],
      contrastText: "#fff",
    },
    secondary: {
      main: yellow[500],
      contrastText: "#000",
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "8px"
        }
      }
    }  
  }
});

const onDestroySubject = new Subject<void>();

function App() {

  useEffect(() => {
    const wsSubject = webSocket<MessageTypes>('ws://192.168.1.24:8000');

    wsSubject
        .pipe(takeUntil(onDestroySubject))
        .subscribe({
      next: msg => handleSocketMessage(msg), // Called whenever there is a message from the server.
      error: err => console.log(err), // Called if at any point WebSocket API signals some kind of error.
      complete: () => console.log('complete') // Called when connection is closed (for whatever reason).
    });

    return () => {
      onDestroySubject.next();
    }
  }, []);

  const [peers, setPeers] = useState<Array<PeerId>>([]);
  function handleSocketMessage(message: MessageTypes) {
    console.log("message", message);
    switch (message.type) {
      case "existingPeers":
        setPeers(message.peerIds);
        break;
      case "newPeer":
        setPeers([...peers, message.peerId])
        break;
      case "peerDisconnected":
        const peerIdx = peers.findIndex(peerId => message.peerId === peerId);
        if(peerIdx){
          setPeers(peers.toSpliced(peerIdx, 1));
        }
        break;
      case "yourId":
        break;
      default:
        console.warn("unhandled case", message);
    }
  }


  const [messages, setMessages] = useState<Array<string>>([]);
  const [currentMessage, setCurrentMessage] = useState<string>("");

  function handleMessageChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setCurrentMessage(event.target.value);
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent new line in single-line input
      send();
    }
  }

  function send() {
    setMessages((oldMessages) => {
      return [...oldMessages, currentMessage];
    });
    setCurrentMessage("");
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>

          <Stack sx={{ py: 1 }} spacing={2} style={{ minHeight: "100dvh", boxSizing: "border-box"}}>
            <Paper sx={{ flexGrow: 1 }} style={{ display: "flex", flexDirection: "column" }}>
              <Stack sx={{ flexGrow: 1, justifyContent: "flex-end", alignItems: "flex-end", px: 2, py: 3 }} spacing={1}>
                {messages.length > 0 ? (
                  messages.map((message, idx) => (
                    <Paper key={idx} sx={{ px: 2, py: 1, backgroundColor: "primary.light"}}>{message}</Paper>
                  ))
                ) : (
                  <Box sx={{ textAlign: "center" }}>
                    There are no messages yet.
                  </Box>
                )}
              </Stack>
            </Paper>

            <Paper sx={{ px: 2 }}>
              <p>Peers: { peers }</p>
            </Paper>

            <Stack direction="row" spacing={1}>
              <TextField placeholder="Type your message"
                variant="filled"
                autoComplete="off"
                sx={{ flexGrow: 1 }}
                value={currentMessage}
                onKeyDown={handleKeyDown}
                onChange={handleMessageChange} />
              <Button variant="contained" color="primary" sx={{ flex: "0 0 100px" }} onClick={send}>
                Send
              </Button>
            </Stack>
          </Stack>

        </Container>
      </ThemeProvider>
    </>
  );
}

export default App;
