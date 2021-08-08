import axiosClient from "./axiosClient";
const covidApi = {
  async getGlobalSummary() {
    const data = await axiosClient.get(`/all`);
    return data;
  },
};
export default covidApi;
