<template>
  <div class="filter" v-if="tickersLength != 0">
    <p>Filter:</p>
    <input
      type="text"
      class="filterinput"
      v-model="filter"
      @input="filterpageTo"
    />
    <div class="controlpages" v-show="tickersLength > 6">
      <button
        class="btn prevpage"
        v-if="filterpage > 1"
        @click="filterpageDecrease"
      >
        &#129128;
      </button>
      <p>{{ filterpage }} from {{ Math.round((tickersLength + 2) / 6) }}</p>
      <button
        class="btn nextpage"
        @click="filterpageIncrease"
        v-if="tickersLength / 6 > filterpage"
      >
        &#129130;
      </button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    tickersLength: { type: Number },
    filterpage: {
      type: Number,
    },
  },
  data() {
    return {
      filter: "",
    };
  },
  watch: {
    filter() {
      this.$emit("filterpage", {
        filterpage: 1,
        filter: this.filter,
      });
    },
  },
  filterpage() {
    this.$emit("filterpage", {
      filterpage: this.filterpage,
      filter: this.filter,
    });
  },
  methods: {
    filterpageToN() {
      this.$emit("filterpage", { filterpage: 1, filter: this.filter });
    },
    filterpageIncrease() {
      this.$emit("filterpage", {
        filterpage: this.filterpage +1,
        filter: this.filter,
      });
      console.log("sending increase", this.filterpage + 1);
    },
    filterpageDecrease() {
      this.$emit("filterpage", {
        filterpage: Number(this.filterpage - 1),
        filter: this.filter,
      });
    },
  },
};
</script>
