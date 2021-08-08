import logo from "./logo.svg";
import "./App.css";
import MyApp from "./pages/MyApp";
import Login from "./pages/Login";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import Header from "./components/Header";
import firebase from "firebase";
import { useEffect, useState } from "react";
import covidApi from "./apis/covidApi";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
};
firebase.initializeApp(config);

function App() {
  const [data, setData] = useState({});
  useEffect(() => {
    const fetchApi = async () => {
      const statistics = await covidApi.getGlobalSummary();
      setData(statistics);
    };
    fetchApi();
  }, []);
  // Handle firebase auth changed
  useEffect(() => {
    const unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged(async (user) => {
        if (!user) {
          // user logs out, handle something here
          console.log("User is not logged in");
          return;
        }
        const token = await user.getIdToken();
        console.log("id token", token);
      });

    return () => unregisterAuthObserver();
  }, []);
  const handleButtonClick = async () => {
    const statistics = await covidApi.getGlobalSummary();
    setData(statistics);
    console.log(
      "🚀 ~ file: App.js ~ line 45 ~ handleButtonClick ~ statistics",
      statistics
    );
  };
  const handleLogout = async () => {
    await firebase.auth().signOut();
  };

  return (
    <div className="App">
      <button onClick={handleButtonClick}>fetch</button>
      <BrowserRouter>
        <Header />
        <Switch>
          <Redirect exact from="/" to="/myapp" />
          <Route path="/myapp" component={MyApp} />
          <Route path="/login" component={Login} />
        </Switch>
      </BrowserRouter>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default App;
