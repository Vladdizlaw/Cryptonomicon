import { createApp } from "vue";
import VueKinesis from "vue-kinesis";
import App from "./App.vue";

const app = createApp(App);
app.use(VueKinesis);
app.mount("#app");
