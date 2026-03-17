import React, { useActionState } from "react";
import { Link } from "react-router";
import { MainLayout } from "./MainLayout.jsx";
import "./LoginPage.css";

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response;
}

export function LoginPage({ isRegistering, onLogin }) {
  const usernameInputId = React.useId();
  const emailInputId = React.useId();
  const passwordInputId = React.useId();
  const errorId = React.useId();

  const [errorMessage, formAction, isPending] = useActionState(
    async (_prevState, formData) => {
      const username = formData.get("username");
      const password = formData.get("password");

      if (isRegistering) {
        const email = formData.get("email");
        const response = await postJson("/api/users", {
          username,
          email,
          password,
        });
        if (response.ok) {
          const { token } = await response.json();
          onLogin(token);
          return null;
        }
        if (response.status === 409) {
          return "That username is already taken. Please choose a different one.";
        }
        return "Something went wrong. Please try again.";
      } else {
        const response = await postJson("/api/auth/tokens", {
          username,
          password,
        });
        if (response.ok) {
          const { token } = await response.json();
          onLogin(token);
          return null;
        }
        if (response.status === 401) {
          return "Incorrect username or password.";
        }
        return "Something went wrong. Please try again.";
      }
    },
    null,
  );

  return (
    <>
      {isRegistering ? <h2>Register a new account</h2> : <h2>Login</h2>}
      <form
        className="LoginPage-form"
        action={formAction}
        aria-describedby={errorMessage ? errorId : undefined}
      >
        <label htmlFor={usernameInputId}>Username</label>
        <input
          id={usernameInputId}
          name="username"
          required
          disabled={isPending}
        />

        {isRegistering && (
          <>
            <label htmlFor={emailInputId}>Email</label>
            <input
              id={emailInputId}
              name="email"
              type="email"
              required
              disabled={isPending}
            />
          </>
        )}

        <label htmlFor={passwordInputId}>Password</label>
        <input
          id={passwordInputId}
          name="password"
          type="password"
          required
          disabled={isPending}
        />

        {isRegistering ? (
          <p>
            Already have an account? <Link to="/login">Login here</Link>.
          </p>
        ) : (
          <p>
            Don't have an account? <Link to="/register">Register here</Link>.
          </p>
        )}

        {errorMessage && (
          <p id={errorId} role="alert" className="LoginPage-error">
            {errorMessage}
          </p>
        )}

        <input type="submit" value="Submit" disabled={isPending} />
      </form>
    </>
  );
}
