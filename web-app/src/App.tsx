import {Box, Button, Container, createTheme, CssBaseline, Paper, Stack, TextField, ThemeProvider} from "@mui/material";
import {type ChangeEvent, useState} from "react";
import {indigo, yellow} from "@mui/material/colors";

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

function App() {

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
  };

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
