import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/AuthContextProvider";
// import Input from "../layout/Input";
// import Button from "../layout/Button";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
export default function Login() {
  const navigate = useNavigate();
  const [userPassword, setUserPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const { authenticated, login, lastApiResponse } = useContext(AuthContext);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message
    const result = await login(userName, userPassword);

    // Check if login was successful based on API response
    if (lastApiResponse && !JSON.parse(lastApiResponse).loggedIn) {
      setErrorMessage("Invalid username or password. Please try again.");
    }
  };

  useEffect(() => {
    if (authenticated) {
      navigate("/");
    }
  }, [authenticated, navigate]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "-30%",
          padding: "2rem",
          backgroundColor: "#fff",
          borderRadius: "5%",
          boxShadow: 3,
        }}
      >
        <Typography component="h1" variant="h5">
          Login
        </Typography>

        <form
          onSubmit={handleSubmit}
          style={{ width: "100%", marginTop: "1rem" }}
        >
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage && "Invalid credentials"}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            error={!!errorMessage}
            helperText={errorMessage && "Invalid credentials"}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ marginTop: "1rem" }}
          >
            Login
          </Button>

          <Link
            to="/register"
            style={{ display: "block", textAlign: "center", marginTop: "1rem" }}
          >
            Don't have an account?{" "}
            <span className="font-bold text-blue-500">Register</span>
          </Link>
        </form>
      </Box>
    </Container>
  );
}
