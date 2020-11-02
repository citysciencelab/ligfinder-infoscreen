<script>
import ElementTable from "@/components/ElementTable.vue";
import ClusterTable from "@/components/ClusterTable.vue";

export default {
    name: "Infoscreen",
    components: {
        ElementTable,
        ClusterTable
    },
    data: () => ({
        parentOrigin: process.env.VUE_MAINSCREEN_ORIGIN
    }),
    computed: {
        isClustered () {
            return this.$store.state.clusters?.length > 0;
        },
        selectedParcels () {
            return this.$store.state.selectedParcels;
        },
        selectedClusters () {
            return this.$store.state.selectedClusters;
        }
    },
    watch: {
        selectedParcels (curr) {
            this.postMessage("selectedParcels", curr.map(f => f.flurst_hh), "map-sync");
        },
        selectedClusters (curr) {
            console.log(curr);
            this.postMessage("selectedClusters", curr, "map-sync");
        }
    },
    created () {
        console.log(this.parentOrigin);
        window.addEventListener("message", this.onMessage);
        window.store = this.$store;
    },
    methods: {
        onMessage (msg) {
            if (msg.data?.type === "store") {
                console.log(msg.data.path, msg.data.payload);
                this.$store.commit(msg.data.path, msg.data.payload);
            }
        },
        postMessage (path, payload, type = "store") {
            window.opener.postMessage({
                path,
                payload,
                type
            }, this.parentOrigin);
        },
    }
};
</script>
<template>
    <v-main>
        <ElementTable v-if="!isClustered" />
        <ClusterTable v-else-if="isClustered" />
    </v-main>
</template>
<style lang="scss">
</style>
