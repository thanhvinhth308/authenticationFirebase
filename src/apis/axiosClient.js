import axios from "axios";
import queryString from "query-string";
import firebase from "firebase";

const getFirebaseToken = async () => {
  const currentUser = firebase.auth().currentUser;
  //***** nếu chưa expired thì không cân lên google lấy,còn expired tự lên google lấy nên getIdToken() gọi nhiều k sao
  if (currentUser) return currentUser.getIdToken();

  // Logged in but current user is not fetched --> wait (10s)
  return new Promise((resolve, reject) => {
    const waitTimer = setTimeout(() => {
      reject(null);
      console.log("Reject timeout");
    }, 10000);

    const unregisterAuthObserver = firebase
      .auth()
      .onAuthStateChanged(async (user) => {
        if (!user) {
          reject(true);
        }
        //***** nếu chưa expired thì không cân lên google lấy,còn expired tự lên google lấy nên getIdToken() gọi nhiều k sao
        const token = await user?.getIdToken();
        console.log("[AXIOS] Logged in user token: ", token);
        unregisterAuthObserver();
        clearTimeout(waitTimer);
        resolve(token);
      });
  }).catch((error) => false);
};

// Set up default config for http requests here
// Please have a look at here `https://github.com/axios/axios#request- config` for the full list of configs
const axiosClient = axios.create({
  baseURL: "https://disease.sh/v3/covid-19/",
  headers: {
    "content-type": "application/json",
  },
  paramsSerializer: (params) => queryString.stringify(params),
});

axiosClient.interceptors.request.use(async (config) => {
  const token = await getFirebaseToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  }
  return {
    headers: {},
    method: config.method,
    url: "",
  };
});

axiosClient.interceptors.response.use(
  (response) => {
    if (response && response.data) {
      return response.data;
    }

    return response;
  },
  (error) => {
    // Handle errors
    throw error;
  }
);

export default axiosClient;
