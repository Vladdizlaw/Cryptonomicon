<template>
  <div v-if="selected" class="outputdisplay">
    <div v-if="selected != null" class="graph" ref="graph">
      <div
        v-for="(key, ind) in Object.keys(maxHeightBar)"
        :key="key"
        :title="key"
        :style="{ height: maxHeightBar[key] + '%' }"
        class="bar"
        ref="bar"
        :class="{
          up:
            maxHeightBar[Object.keys(maxHeightBar)[ind - 1]] <
            maxHeightBar[Object.keys(maxHeightBar)[ind]],
          down:
            maxHeightBar[Object.keys(maxHeightBar)[ind - 1]] >
            maxHeightBar[Object.keys(maxHeightBar)[ind]]
        }"
      ></div>
    </div>
  </div>
</template>
<script>
import { ref, onMounted, watchEffect } from "vue";
export default {
  props: {
    maxHeightBar: {
      type: Object
    },
    selected: {
      type: Object
    }
  },
  emits: ["refs", "selectedNull"],
  setup(props, { emit }) {
    const bar = ref(null);
    const graph = ref(null);

    function sendClientWidth() {
      const refs = { bar: bar.value, graph: graph.value };
      console.log(refs);
      emit("refs", refs);
    }

    function closeGraph() {
      emit("selectedNull", null);
    }
    onMounted(() => {
      window.addEventListener("resize", sendClientWidth);
    });
    watchEffect(props.selected, () => {
      sendClientWidth();
    });
    return {
      bar,
      graph,
      sendClientWidth,
      closeGraph
    };
  }
};
</script>
