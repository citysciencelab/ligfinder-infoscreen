<script>
/* Component description:
    This component is enabling a table overview of the filtered parcels.
    The parcels can be sorted according to the each attribute.
    Infrastructure analysis is visualised trough spider chart,
    where the distances from chosen amenities are depicted on separate axis.
    Additionally, it enables the user to export the selected parcels.
    Interaction between the table and the map is enabled.
*/
import {mapState, mapGetters, mapActions} from "vuex";
// import Styles from "../../olStyles";
import VueApexCharts from "vue-apexcharts";
// import pdf from 'vue-pdf'
// import jsPDF from 'jspdf'
// import html2canvas from 'html2canvas';
// import Canvas2Image from 'canvas2image';
// import domtoimage from 'dom-to-image';


export default {
    name: "ElementTable",
    components: {
        apexchart: VueApexCharts
    },
    data: () => ({
        infoErgebnis: {
            state: false,
            text: "Hier können Sie eine Übersicht der Ergebnisse genießen und diese exportieren"
        },
        title: "Ergebnisübersicht",
        headers: [
            {text: "Checkbox", value: "checkbox", align: " d-none"},
            {text: "Flurstück Nr.", value: "Flurst"},
            {text: "Fläche in m²", value: "flaeche"},
            {text: "Gemarkungen", value: "Gemarkungen"},
            {text: "Stadtteile", value: "Stadtteile"},
            {text: "Bezirke", value: "Bezirke"},
            {text: "IST Bruttogeschossfläche", value: "ISTBruttogeschossfläche"},
            {text: "Verhältnis", value: "Verhaeltnis"},
            {text: "SOLL Bruttogeschossfläche", value: "SOLLBruttogeschossfläche"},
            {text: "Bruttogeschossflächenpotential", value: "Bruttogeschossflächenpotential"},
            {text: "Anbindung", value: "distanceScore"},
            {text: "Distanzen", value: "distances"},
            {text: "Notiz hinzufügen", value: "comment"}
        ],
        search: "",
        sortBy: null,
        dialog: {
            state: false,
            color: "",
            text: ""
        },
        spider: {
            state: false
        },
        spiders: [],
        score: 0,
        scores: [],
        infrastructureInfo: {
            state: false,
            data: {}
        },
        spiderChartInfo: [{
            data: {},
            id: null
        }],
        infrastructureStyle: false,
        unitMapping: {
            "meters": "m",
            "minutes": "min"
        },
        series: [],
        spiderSeries: [],
        chartOptions: {
            markers: {
                size: [5],
                fillColor: ["#1976D2", "#00FFD7", "#FF007F", "#7F00FF", "#800000"]
            },
            chart: {
                height: 400,
                width: 350,
                type: "radar",
                toolbar: {
                    show: false
                }
            },
            title: {
                text: ""
            },
            legend: {
                show: true,
                showForSingleSeries: false,
                showForNullSeries: true,
                showForZeroSeries: true,
                position: "bottom",
                horizontalAlign: "center",
                floating: false,
                fontSize: "14px",
                fontFamily: "Helvetica, Arial",
                fontWeight: 400,
                formatter: undefined,
                inverseOrder: false,
                width: undefined,
                height: undefined,
                tooltipHoverFormatter: undefined,
                offsetX: 0,
                offsetY: 0,
                labels: {
                    colors: ["#1976D2", "#00FFD7", "#FF007F", "#7F00FF", "#800000"],
                    useSeriesColors: true
                },
                markers: {
                    width: 5,
                    height: 5,
                    strokeWidth: 2,
                    strokeColor: ["#1976D2", "#00FFD7", "#FF007F", "#7F00FF", "#800000"],
                    colors: ["#1976D2", "#00FFD7", "#FF007F", "#7F00FF", "#800000"],
                    fillColors: ["#1976D2", "#00FFD7", "#FF007F", "#7F00FF", "#800000"],
                    radius: 5,
                    customHTML: undefined,
                    onClick: undefined,
                    offsetX: 0,
                    offsetY: 0
                },
                itemMargin: {
                    horizontal: 5,
                    vertical: 0
                },
                onItemClick: {
                    toggleDataSeries: true
                },
                onItemHover: {
                    highlightDataSeries: true
                },
            },
            xaxis: {
                categories: ["SUPERMARKT", "AUTOBAHN", "APOTHEKE", "SCHULE", "BAHNHOF", "HALTESTELLE"]
            }
        }
    }),
    computed: {
        ...mapState([
            "parcels",
            "clusters",
            "parcelsInCluster",
            "parcelLayer",
            "parcelStyle",
            "infrastructureLayers",
            "infrastructureData",
            "mapInfo",
        ]),
        tableParcels () {
            var itemParcels = [];

            if (this.parcelsInCluster.length !== 0) {
                itemParcels = this.parcelsInCluster;
                // new layer for the parcels that are
            }
            else {
                itemParcels = this.parcels;
            }
            return itemParcels.map(properties => {

                for (const key in properties) {
                    if (properties?.[key] !== null && properties?.[key].color && properties?.[key].value) {
                        properties[key + "_color"] = properties[key].color;
                        properties[key] = properties[key].value;
                    }
                    properties["checkbox"] = 1;
                }
                return properties;
            });
        },
        selected: {
            get () {
                return this.$store.state.selectedParcels;
            },
            set (val) {
                this.$store.state.selectedParcels = val;
            }
        },
        mapSync () {
            return this.$store.state.mapSync.selectedParcels;
        }
    },
    watch: {
        selected (curr) {
            if (curr.length > 0) {
                this.tableParcels.forEach(tableFeature => {
                    if (curr.includes(tableFeature)) {

                        tableFeature.checkbox = 0;
                    }
                    else {
                        tableFeature.checkbox = 1;
                    }

                });
                this.sortBy = "checkbox";
            }
        },
        mapSync (v) {
            console.log(v);
        }
    },
    // mounted () {
    //     if (Object.values(this.$store.state.infrastructureData).map(x => parseFloat(x.range)).find(x => x === "undefined")) {
    //         console.log("not found");
    //         this.series = [[{
    //             name: "Distanz",
    //             data: []
    //         }]];
    //     }
    //     else {
    //         console.log("found");
    //         this.series = [[{
    //             name: "Distanz",
    //             data: []
    //         },
    //         {
    //             name: "Reference value",
    //             data: [Object.values(this.$store.state.infrastructureData).map(x => parseFloat(x.range))]
    //         }]];
    //     }
    // },
    methods: {
        ...mapActions("Tools/LigFinder", [
            "downloadCSV",
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
            const fsks = this.selected.map(i => i.flurst_hh).join("&fsk=");

            window.open(BACKEND_URL + "shape?fsk=" + fsks, "_blank");
        },
        exportSpiderChart () {
            console.log("selected", this.selected);
            console.log("selected.slice(3,6)", this.selected.slice(3, 6));
            // show
            this.spider.state = true;
            const referenceValue = Object.values(this.infrastructureData).map(x => parseFloat(x.range));
            
            console.log("referenceValue", referenceValue)
            this.series = [];
            this.scores = [];
            // this.spiderChartInfo = [{
            //     data: {},
            //     id: null
            // }];
            this.spiderChartInfo = [];


            this.selected.forEach(element => {
                const tmp = {};

                tmp["name"] = "Distanz";
                tmp["data"] = [];
                let i = 0,
                    singleScore = 0;

                for (const [key, value] of Object.entries(element.distances)) {
                    if (key !== "unit") {
                        tmp["data"].push(value[1]);
                        singleScore += value[1] - referenceValue[i++];
                    }
                }
                this.series.push([tmp, {
                    name: "Reference value",
                    data: Object.values(this.infrastructureData).map(x => parseFloat(x.range))
                }]);
                this.scores.push(singleScore);

                const data = {};

                data.Flurstücksnummer = element.Flurst;
                data["Fläche in m2"] = element.flaeche;
                data.Gemarkung = element.Gemarkungen;
                data.Stadtteil = element.Stadtteile;
                data.Bezirk = element.Bezirke;
                data["IST BGF"] = element.ISTBruttogeschossfläche;
                data.Bruttogeschossflächenpotential = element.Bruttogeschossflächenpotential;
                this.spiderChartInfo.push({"data": data});
            });
            console.log("spiders series", this.series);
            console.log("this.score", this.scores);
        },

        spider_export (elementID) {
            fetch(BACKEND_URL + "spider",
                {
                    mode: "cors",
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(document.getElementById(elementID).outerHTML)
                })
                .then(response => response.json())// console.log(response))//window.open("../../../../api/my.html"))
                .then(json => {
                    console.log("json", json);
                    window.open(json["result"]);
                }).catch((error) => {
                    console.log("error");
                    // Radio.trigger("Alert", "alert", "Die Verbindung zur Datenbank ist unterbrochen. Wenden Sie sich an den zuständigen Systemadministrator.");
                });
        },

        saveAs(uri, filename) {

            var link = document.createElement("a");

            if (typeof link.download === "string") {

                link.href = uri;
                link.download = filename;

                // Firefox requires the link to be in the body
                document.body.appendChild(link);

                // simulate click
                link.click();

                // remove the link when done
                document.body.removeChild(link);

            }
            else {

                window.open(uri);

            }
        },
        showCaptureRef() {
            console.log("this.$refs.capture: " + this.$refs.spiderChartToExport);
            const vc = this;

            return vc.$refs.spiderChartToExport;
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
        logItem (item) {
            console.log(item);
        },
        openInfrastructureInfo (item) {
            console.log("item", item);
            const data = item.distances;

            this.spiderChartInfo.data = [];
            const series = {};

            this.score = 0;
            console.log("this.infrastructureData", this.infrastructureData);
            const referenceValue = Object.values(this.infrastructureData).map(x => parseFloat(x.range));

            console.log("referenceValue", referenceValue);


            series["name"] = "Distanz";
            series["data"] = [];
            let i = 0;

            for (const [key, value] of Object.entries(item.distances)) {
                console.log("key", key);
                console.log("value", value);
                if (key !== "unit") {
                    console.log("key", key, "referenceValue", referenceValue[i], "i", i);
                    series["data"].push(value[1]);
                    this.score += value[1] - referenceValue[i++];
                }
            }
            console.log("score", this.score);


            for (const infrastructureType in this.infrastructureLayers) {
                const layerId = this.infrastructureLayers[infrastructureType],
                    layer = this.$store.getters["Map/layerById"](layerId)?.olLayer,
                    source = layer?.getSource(),
                    coord = data[infrastructureType]?.[0],
                    closestInfrastructure = source?.getClosestFeatureToCoordinate(coord);

                if (closestInfrastructure) {
                    data[infrastructureType][0] = closestInfrastructure.getId();
                    // this.series.data.push(data[infrastructureType][1]);
                }
            }
            this.spiderSeries = [series, {
                name: "Reference value",
                data: referenceValue
            }];
            this.$refs.spider.updateSeries([series, {
                name: "Reference value",
                data: referenceValue
            }]);

            // this.$refs.spider.updateSeries(this.series);
            // this.$refs.spider.appendSeries({
            // name: "Reference value",
            // data: [Object.values(this.infrastructureData).map(x => parseFloat(x.range))]
            // });


            this.infrastructureInfo.state = true;

            this.infrastructureInfo.data = data;
            this.spiderChartInfo[0].data = {};
            this.spiderChartInfo[0].data.Flurstücksnummer = item.Flurst;
            this.spiderChartInfo[0].data["Fläche in m2"] = item.flaeche;
            this.spiderChartInfo[0].data.Gemarkung = item.Gemarkungen;
            this.spiderChartInfo[0].data.Stadtteil = item.Stadtteile;
            this.spiderChartInfo[0].data.Bezirk = item.Bezirke;
            this.spiderChartInfo[0].data["IST BGF"] = item.ISTBruttogeschossfläche;
            this.spiderChartInfo[0].data.Bruttogeschossflächenpotential = item.Bruttogeschossflächenpotential;

        },
        triggerPotential () {
            this.infrastructureStyle = !this.infrastructureStyle;

            // if (this.infrastructureStyle) {
            //     this.parcelStyle = "potential";
            // }
            // else {
            //     this.parcelStyle = null;
            // }
        }

    }
};
</script>
<template>
    <v-container
        id="results-table"
        fluid
    >
        <!-- <h5>
            {{ title }}

            <v-btn
                class="ma-2"
                icon
                small
                @click="infoErgebnis.state = true"
            >
                <v-icon>
                    info
                </v-icon>
            </v-btn>
        </h5> -->

        <v-snackbar
            v-model="infoErgebnis.state"
            :timeout="100000"
            color="info"
            :top="true"
            class="snackInfo"
        >
            {{ infoErgebnis.text }}
            <v-btn
                outlined
                text
                @click="infoErgebnis.state = false"
            >
                Schließen
            </v-btn>
        </v-snackbar>
        <v-card flat>
            <v-card-title v-if="clusters.length === 0">
                <v-col
                    class="d-flex"
                >
                    <v-btn
                        :outlined="infrastructureStyle"
                        :color="infrastructureStyle ? 'red' : 'primary'"
                        dark
                        @click="triggerPotential"
                    >
                        {{ infrastructureStyle ? 'Potential ausblenden' : 'Potential zeigen' }}
                    </v-btn>
                </v-col>
                <v-col
                    class="d-flex"
                    justify="end"
                >
                    <v-spacer />
                    <v-text-field
                        v-model="search"
                        append-icon="mdi-magnify"
                        label="Durchsuchen"
                        single-line
                        hide-details
                    />
                </v-col>
            </v-card-title>
            <v-data-table
                ref="resultsTable"
                v-model="selected"
                :headers="headers"
                :items="tableParcels"
                item-key="Flurst"
                class="elevation-1"
                show-select
                :sort-by.sync="sortBy"
                :search="search"
            >
                <template v-slot:item.distanceScore="{ item }">
                    <v-chip
                        v-if="item.distanceScore"
                        :color="item.distanceScore_color"
                        dark
                        @click="logItem(item)"
                    >
                        ~ {{ Math.round(item.distanceScore) }} {{ unitMapping[item.distances.unit] }}
                    </v-chip>
                </template>
                <template v-slot:item.distances="{ item }">
                    <v-btn
                        v-if="item.distances"
                        @click="dialog.state = false"
                    >
                        <v-chip
                            color="primary"
                            dark
                            @click="openInfrastructureInfo(item)"
                        >
                            <v-icon>
                                layers
                            </v-icon>
                        </v-chip>
                    </v-btn>
                </template>
                <template v-slot:item.comment="{ item }">
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
                                Export shp
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
                                @click="exportSpiderChart"
                            >
                                Compare spidercharts
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
                v-model="spider.state"
                class="spiders"
                :timeout="-1"
                multi-line
                color="primary"
                tile
                light
            >
                <div id="img-out" />
                <div
                    id="spiderChartToExport"
                    ref="spiderChartToExport"
                    class="spiders"
                >
                     <table>
                    <tr>
                        <td height="350px">
                        </td>
                        <td v-for="(row, index) in selected.slice(0,3)" :key="index" id="spiders" style="text-align:center;">
                             <h5 v-if="!Number.isNaN(scores[index])" class="score"> TOTAL ABWEICHUNG: {{ Math.round(scores[index]*100)/100 }}</h5>
                            <apexchart ref="spiders" type="radar"  width="400" height="350" dataLabels.style.colors='#373d3f' :options="chartOptions" :series="series[index]"></apexchart> 
                        </td>
                    </tr>
                    <tr v-for="(val, key) in spiderChartInfo[0].data"   
                            :key="key"
                    >
                        <td style="padding-right: 2cm; padding-bottom: 2mm; font-size: 14px;">
                            {{ key }}
                        </td>
                        <td  v-for="(row, index) in selected.slice(0,3)" :key="index" style="width: auto; padding-left:2cm; padding-bottom: 2mm;  font-size: 14px; text-align:center;">
                            <p v-if="spiderChartInfo[index] !== undefined" class="ptext">{{ spiderChartInfo[index].data[key] }} </p>
                        </td>
                    </tr>
                    <tr v-if="selected.length > 3">
                        <td height="350px">
                        </td>
                        <td v-for="(row, index2) in selected.slice(3,6)" :key="index2" id="spiders" style="text-align:center;">
                             <h5 v-if="!Number.isNaN(scores[index2+3])" class="score">TOTAL ABWEICHUNG:   {{ Math.round(scores[index2+3]*100)/100 }}</h5>
                            <apexchart type="radar"  width="400" height="350" dataLabels.style.colors='#373d3f' :options="chartOptions" :series="series[index2+3]"></apexchart> 
                        </td>
                    </tr>
                    <tr  v-if="selected.length > 3" v-for="(val, key2) in spiderChartInfo[0].data"   
                            :key="key2"
                    >
                        <td style="padding-right: 2cm; padding-bottom: 2mm; font-size: 14px;">
                            {{ key2 }}
                        </td>
                        <td  v-for="(row, index2) in selected.slice(3,6)" :key="index2" style="width: auto; padding-left:2cm; padding-bottom: 2mm;  font-size: 14px; text-align:center;">
                            <p v-if="spiderChartInfo[index2+3] !== undefined" class="ptext"> {{ spiderChartInfo[index2+3].data[key2] }}</p>
                        </td>
                    </tr>



                    <tr v-if="selected.length > 6">
                        <td height="350px">
                        </td>
                        <td v-for="(row, index) in selected.slice(6,9)" :key="index" id="spiders" style="text-align:center;">
                             <h5 v-if="!Number.isNaN(scores[index+6])" class="score">TOTAL ABWEICHUNG:  {{ Math.round(scores[index+6]*100)/100 }}</h5>
                            <apexchart type="radar"  width="400" height="350" dataLabels.style.colors='#373d3f' :options="chartOptions" :series="series[index+6]"></apexchart> 
                        </td>
                    </tr>
                    <tr v-if="selected.length > 6" v-for="(val, key) in spiderChartInfo[0].data"   
                            :key="key"
                    >
                        <td style="padding-right: 2cm; padding-bottom: 2mm; font-size: 14px;">
                            {{ key }}
                        </td>
                        <td  v-for="(row, index) in selected.slice(6,9)" :key="index" style="width: auto; padding-left:2cm; padding-bottom: 2mm;  font-size: 14px; text-align:center;">
                             <p v-if="spiderChartInfo[index+6] !== undefined" class="ptext">{{ spiderChartInfo[index+6].data[key] }}</p>
                        </td>
                    </tr>
              </table>
                    <v-btn
                        outlined
                        text
                        class="button"
                        @click="spider.state = false"
                    >
                        Schließen
                    </v-btn>
                    <v-btn
                        outlined
                        text
                        class="button"
                        @click="spider_export('spiderChartToExport')"
                    >
                        Export
                    </v-btn>
                </div>
            </v-snackbar>
            <v-snackbar
                v-model="dialog.state"
                :timeout="3000"
                :color="dialog.color"
            >
                {{ dialog.text }}
                <v-btn
                    class="button"
                    text
                    @click="dialog.state = false"
                >
                    Schließen
                </v-btn>
            </v-snackbar>
            <v-snackbar
                v-model="infrastructureInfo.state"
                :timeout="-1"
                color="primary"
                light
            >
                <div id="singleSpiderChartToExport">
                    <p class="score">
                        TOTAL ABWEICHUNG: {{ Math.round(score*100)/100 }}
                    </p>
                    <apexchart
                        ref="spider"
                        type="radar"
                        width="400"
                        height="350"
                        data-labels-style-colors="#373d3f"
                        :options="chartOptions"
                        :series="spiderSeries"
                    />

                    <table>
                        <tr
                            v-for="(val, key) in spiderChartInfo[0].data"
                            :key="key"
                        >
                            <td style="padding-right: 2cm; padding-bottom: 2mm; font-size: 14px;">
                                {{ key }}
                            </td>
                            <td style="width: 50%; padding-right: 2cm; padding-bottom: 2mm;  font-size: 14px;">
                                {{ val }}
                            </td>
                        </tr>
                    </table>
                </div>
                <v-btn
                    text
                    @click="infrastructureInfo.state = false"
                >
                    Schließen
                </v-btn>
                <v-btn
                    id="button"
                    outlined
                    text
                    @click="spider_export('singleSpiderChartToExport')"
                >
                    Export
                </v-btn>
            </v-snackbar>
        </v-card>
    </v-container>
</template>
<style lang="less">
    #results-table {
        .table-footer {
            padding-top: 5px;
        }

        .primary {
            max-width: 100%;
            width: auto;
            max-height: 90%;
            height: auto;
            overflow-y: auto;
            display: block;
        }

        .v-button {
            float: right;
            font-size: 20px;
            border: outset;
        }
        .score {
            background-color: white;
            align-items: end;
            text-align: center;
            font-weight: bold;
            width: auto;
            float: none;
            padding: 10px;
            border-radius: 25px;
        }
         .ptext {
            margin-bottom: 0px;
            color: black;
        }
    }
</style>
