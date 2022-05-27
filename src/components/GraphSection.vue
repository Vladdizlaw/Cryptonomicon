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
            maxHeightBar[Object.keys(maxHeightBar)[ind]],
        }"
      ></div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    maxHeightBar: {
      type: Object,
    },
    selected: {
      type: Object,
    },
  },
  data() {
    return {};
  },
  mounted(){
    
    window.addEventListener('resize',this.sendClientWidth)
  },
  watch:{
    selected(){
      this.sendClientWidth()
    }
  },

  methods: {
    sendClientWidth(){
      const refs={bar:this.$refs?.bar , graph:this.$refs?.graph}
      console.log(refs)
      this.$emit('refs',refs)
    },

    closeGraph() {
      this.$emit("selectedNull", null);
    },
  },
};
</script>
