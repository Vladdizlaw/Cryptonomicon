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
              <div
                class="walletblock_delete"
                @click.stop="btnDelete(t.name)"
              ></div>
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
import { ref, watch } from "vue";
export default {
  emits: ["selected", "btn-delete"],
  props: {
    filteredTickers: {
      type: Array
    }
  },
  setup(props, { emit }) {
    const selected = ref(null);
    watch(selected, () => {
      emit("selected", selected.value);
    });

    function showtarget(emit) {
      console.log(emit);
    }
    function btnDelete(name) {
      emit("btn-delete", name);
    }
    return {
      selected,
      showtarget,
      btnDelete
    };
  }
};
</script>
