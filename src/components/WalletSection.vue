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
              @click="showtarget"
            >
            <div class="walletblock_delete" @click.stop="btnDelete(t.name)">

            </div>
              <kinesis-element :strength="14" type="depth">
                <p class="walletblock_title">
                  {{ t.name }}/USD
                </p></kinesis-element
              >
              <kinesis-element :strength="12" type="depth"
                ><p class="walletblock_name">{{ t.fullName }}</p>
              </kinesis-element>
              <kinesis-element :strength="15" type="depth">
                <p class="walletblock_price">
                  {{ t.price }}
                </p>
              </kinesis-element>

              
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
    showtarget(emit) {
      console.log(emit)

    },
    btnDelete(name) {
      this.$emit("btn-delete", name);
    },
  },
};
</script>
