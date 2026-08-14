import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

const theme = createTheme();

const rootElement = document.getElementById("root");

if (!rootElement) {
	throw new Error(
		"Failed to find the root element. Please ensure 'index.html' contains a '<div id=\"root\"></div>'.",
	);
}

ReactDOM.createRoot(rootElement).render(
	<React.StrictMode>
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<App />
		</ThemeProvider>
	</React.StrictMode>,
);
