import React, { useState } from "react";
import Auth from "./components/Auth";
import Notes from "./components/Notes";
import { isLoggedIn } from "./api/auth";
import "./App.css";

function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());

  return (
    <div className="App">
      {loggedIn ? (
        <Notes onLogout={() => setLoggedIn(false)} />
      ) : (
        <Auth onLogin={() => setLoggedIn(true)} />
      )}
    </div>
  );
}

export default App;
