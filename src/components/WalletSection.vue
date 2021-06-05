<template>
  <div class="wallet-section">
    <kinesis-container :duration="300" perspective="2500">
      <div class="forwallets">
        <div
          @click="selected === t ? (selected = null) : (selected = t)"
          v-for="(t, i) in filteredTickers"
          :key="i"
        >
          <kinesis-element :strength="10" type="depth"
            ><div
              class="walletblock"
              :class="{ active: t === selected, disabled: t.price === '--' }"
            >
              <kinesis-element :strength="14" type="depth">
                <p>{{ t.name }}/USD</p></kinesis-element
              >
              <kinesis-element :strength="12" type="depth"
                ><p>{{ t.fullName }}</p>
              </kinesis-element>
              <kinesis-element :strength="15" type="depth">
                <h1 class="price">
                  {{ t.price }}
                </h1>
              </kinesis-element>

              <kinesis-element :strength="15" type="depth"
                ><h4 @click.stop="btnDelete(t.name)">
                  Delete
                </h4></kinesis-element
              >
            </div></kinesis-element
          >
        </div>
      </div></kinesis-container
    >
  </div>
</template>
<script>
export default {
  props: {
    filteredTickers: {
      type: Array,
    },
  },
  data() {
    return {
      selected: null,
    };
  },
  watch: {
    selected: function() {
      this.$emit("selected", this.selected);
    },
  },
  methods: {
    btnDelete(name) {
      this.$emit("btn-delete", name);
    },
  },
};
</script>
