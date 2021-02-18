<script>
/* Component description:
    This component is enabling a table overview of the filtered parcels in a fuzzy search,
    meaning that given the desired area not only the individual parcels are considered, but
    also the neighboring parcels, creating in that manner clusters of parcels.
    Indiividuale parcels of each cluster can also be shown in the table.
    Interaction between the table and the map is enabled.
*/
import {mapState, mapActions} from "vuex";
import ElementTable from "./ElementTable.vue";
// import Styles from "../../olStyles";


export default {
    name: "ClusterTable",
    components: {
        ElementTable
    },
    data: () => ({
        collapsed: true,
        currentId: "",
        expanded: [],
        headers: [
            {text: "Cluster ID", value: "id"},
            {text: "Gesamte Größe in m²", value: "clusterArea"},
            {text: "Anzahl der Flurstück", value: "fskCount"}
        ],
        search: "",
        sortBy: "distanceScore",
        dialog: {
            state: false,
            color: "",
            text: ""
        },
        unitMapping: {
            "meters": "m",
            "minutes": "min"
        }
    }),
    computed: {
        ...mapState([
            "parcels",
            "clusters",
            "clusterInfos",
            "parcelsInCluster",
            "parcelLayer",
            "clusterLayer",
            "parcelsInClusterLayer",
            "infrastructureLayers"
        ]),
        tableClusters () {
            return this.clusters.map(properties => {
                for (const key in properties) {
                    if (properties?.[key] !== null && properties?.[key] !== null && properties[key].color && properties[key].value) {
                        properties[key + "_color"] = properties[key].color;
                        properties[key] = properties[key].value;
                    }
                }

                return properties;
            });
        },
        selected: {
            get () {
                return this.$store.state.Tools?.LigFinder?.selectedClusters;
            },
            set (val) {
                this.$store.commit("selectedClusters", val);
            }
        }
    },
    watch: {
        // selected (curr) {
        //     curr.forEach(tableFeature => {
        //         console.log(tableFeature);
        //     });
        // },
        // parcelsInCluster () {
        //     const layer = this.parcelsInClusterLayer,
        //         source = layer.getSource();

        //     source.clear();
        //     if (Array.isArray(this.parcelsInCluster)) {
        //         this.parcelsInCluster.forEach(feature => source.addFeature(feature));
        //     }
        //     else {
        //         source.addFeatures(this.parcelsInCluster);
        //     }

        // }
    },
    methods: {
        ...mapActions([
            "downloadCSV",
            // "updateParcelStyles"
        ]),
        exportCSV () {
            const data = this.selected.length > 0 ? this.selected : this.$refs.resultsTable.$children[0].filteredItems;

            this.downloadCSV({
                data,
                filename: `Flurstuecksuche_${new Date().toLocaleDateString("de-DE")}.csv`,
                excludeProps: ["geometry", "flurst_hh", "feature"],
                replaceKeys: {
                    "flaeche": "Fläche"
                }
            });
        },
        exportSHP () {
            if (this.selected.length === 0) {
                return;
            }
            const fsks = this.selected.map(c => c.flursts);
            const query = fsks.map((c, idx) => c.map(f => f + "&cluster=" + idx).join("&fsk=")).join("&fsk=");

            window.open(BACKEND_URL + "shape?fsk=" + query, "_blank");
        },
        save () {
            this.dialog.state = true;
            this.dialog.color = "success";
            this.dialog.text = "Notiz gespeichert";
        },
        cancel () {
            this.dialog.state = true;
            this.dialog.color = "error";
            this.dialog.text = "Abgebrochen";
        },
        open () {
            this.dialog.state = true;
            this.dialog.color = "info";
            this.dialog.text = "Notiz hinzufügen...";
        },
        clicked ({item}) {
            this.$store.commit("parcelsInCluster", this.clusterInfos[item.id - 1]);
            // hacky die hack
            if (this.currentId !== item.id) {
                this.collapsed = false;
                this.currentId = item.id;
            }
            else if (this.collapsed) {
                this.collapsed = false;
            }
            else {
                this.collapsed = true;
            }
        }
    }
};
</script>
<template>
    <v-container fluid>
        <v-card flat>
            <v-card-title>
                <v-spacer />
                <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="Durchsuchen"
                    single-line
                    hide-details
                />
            </v-card-title>
            <v-data-table
                ref="resultsTable"
                v-model="selected"
                :headers="headers"
                :items="tableClusters"
                item-key="id"
                class="elevation-1"
                :expanded.sync="expanded"
                single-expand
                show-expand
                show-select
                :sort-by.sync="sortBy"
                :search="search"
                @item-expanded="clicked"
            >
                <template v-slot:expanded-item="{ headers }">
                    <td :colspan="headers.length">
                        <ElementTable />
                    </td>
                    <!-- <td :colspan="headers.length">More info about {{ item.id }}</td> -->
                </template>
                <template v-slot:[`item.comment`]="{ item }">
                    <v-edit-dialog
                        @save="save"
                        @cancel="cancel"
                        @open="open"
                    >
                        {{ item.comment }}
                        <template v-slot:input>
                            <v-text-field
                                v-model="item.comment"
                                label="..."
                                single-line
                                counter
                            />
                        </template>
                    </v-edit-dialog>
                </template>
                <template v-slot:footer>
                    <tr>
                        <td class="table-footer">
                            <v-btn
                                outlined
                                @click="exportCSV"
                            >
                                Export CSV
                                <v-icon
                                    right
                                    dark
                                >
                                    save_alt
                                </v-icon>
                            </v-btn>
                        </td>

                        <td class="table-footer">
                            <v-btn
                                outlined
                                @click="exportSHP"
                            >
                                Export SHP
                                <v-icon
                                    right
                                    dark
                                >
                                    save_alt
                                </v-icon>
                            </v-btn>
                        </td>
                    </tr>
                </template>
            </v-data-table>
            <v-snackbar
                v-model="dialog.state"
                :timeout="3000"
                :color="dialog.color"
            >
                {{ dialog.text }}
                <v-btn
                    text
                    @click="dialog.state = false"
                >
                    Schließen
                </v-btn>
            </v-snackbar>
        </v-card>
    </v-container>
</template>
<style lang="less" scoped>
    .table-footer {
        padding-top: 5px;
    }
</style>
