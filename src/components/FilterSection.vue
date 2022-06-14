<template>
  <div class="filter" v-if="tickersLength != 0">
    <div class="controlpages">
      <button
        class="btn prevpage"
        :disabled="filterpage == 1"
        @click="filterpageDecrease"
      >
        <img src="../assets/Group.svg" alt="" />
      </button>
    </div>
    <div class="filter_input">
      <p>Filter:</p>
      <input
        type="text"
        class="filterinput"
        v-model="filter"
        @input="filterpageTo"
      />
      <p>
        {{ filterpage }} from
        {{ Math.round((tickersLength + 2) / this.allVisiblePages) }}
      </p>
    </div>

    <div class="controlpages">
      <button
        class="btn nextpage"
        @click="filterpageIncrease"
        :disabled="
          filterpage >= Math.round((tickersLength + 2) / this.allVisiblePages)
        "
      >
        <img src="../assets/Group2.svg" alt="" />
      </button>
    </div>
  </div>
</template>
<script>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
export default {
  emits: ["filterpage"],
  props: {
    tickersLength: { type: Number },
    filterpage: {
      type: Number,
    },
  },
  setup(props, { emit }) {
    const filter = ref("");
    const allVisiblePages = ref(6);
    function changeAllVisiblePages(event) {
      console.log("event", event.target.orientation);
      if (event.target.orientation == "0") {
        allVisiblePages.value = 3;
      } else {
        allVisiblePages.value = 6;
      }
    }
    function filterpageToN() {
      emit("filterpage", { filterpage: 1, filter: filter.value });
    }
    function filterpageIncrease() {
      emit("filterpage", {
        filterpage: props.filterpage + 1,
        filter: filter.value,
      });
      console.log("sending increase", props.filterpage + 1);
    }
    function filterpageDecrease() {
      emit("filterpage", {
        filterpage: Number(props.filterpage - 1),
        filter: filter.value,
      });
    }
    watch(filter, (val) => {
      emit("filterpage", { filterpage: 1, filter: val });
    });
    watch(props.filterpage, (val) => {
      emit("filterpage", { filterpage: val, filter: filter.value });
    });
    onMounted(() => {
      window.addEventListener("orientationchange", changeAllVisiblePages);
    });
    onBeforeUnmount(() => {
      window.removeEventListener("orientationchange", changeAllVisiblePages);
    });
    return {
      filter,
      allVisiblePages,
      changeAllVisiblePages,
      filterpageIncrease,
      filterpageDecrease,
      filterpageToN,
    };
  },
  // watch: {
  //   filter() {
  //     this.$emit("filterpage", {
  //       filterpage: 1,
  //       filter: this.filter,
  //     });
  //   },
  // },
  // filterpage() {
  //   this.$emit("filterpage", {
  //     filterpage: this.filterpage,
  //     filter: this.filter,
  //   });
  // },
  // methods: {

  // },
};
</script>
