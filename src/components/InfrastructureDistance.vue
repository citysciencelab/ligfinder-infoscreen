<script>
/* Component description:
    In this component the user are able to set the cut off value for the distance to the closest insfrastructure
    amenity above which they are not willing to consider the parcels. Once clicked on the "Ergebnisse anpassen"
    on the map will be only the parcels that fall into the set radius will be displayed.
*/
import {mapActions, mapGetters} from "vuex";
import {round, fallback} from "../../utils/utils";
import PureSlider from "../Filters/PureSlider.vue";
export default {
    name: "InfrastructureDistance",
    components: {PureSlider},
    data () {

        return {
            grocery: fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.grocery, 3), isNaN, 0),
            pharmacy: fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.pharmacy, 3), isNaN, 0),
            stops: fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.stops, 3), isNaN, 0),
            school: fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.school, 3), isNaN, 0),
            highway: fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.highway,3), isNaN, 0),
            infoInfrastructure: {
                state: false,
                text: "Hier können Sie die Distanzen zu den Infrastrukturdaten verändern"
            },
            title: "Distanzen zu den Infrastrukturen",
            infrastructureStyle: false,
        rules: {
            range: [
                v => Boolean(v) || "Wert erforderlich.",
                v => !isNaN(parseFloat(v)) || "Distanz muss eine Zahl sein."
            ]
        },
        units: [
            "Meter"
        ],
        profiles: [
            "Auto",
            "Rad",
            "Gehen",
            "Rollstuhl"
        ]
        };
    },
    computed: {
        ...mapGetters("Tools/LigFinder", [
            "weightingLocked",
            "distanceWeighting",
            "blockDistanceWeighting",
            "parcels",
            "clusters",
            "parcelLayer",
            "clusterLayer",
            "infrastructureData"
        ]),
        active: {
            get () {
                /* if (this.$parent.parcels.length > 0) { //IMPLEMENT State that knows if there are more than 0 parcels
                    return true
                } else {
                    return false
                } */
                return true;
            },
            set (v) {
                return v;
            }
        },
        distances () {
            // eslint-disable-next-line no-unneeded-ternary
            console.log("this.parcels",this.parcels)
            return this.parcels[0].get("distances") ? true : false;
        },
        parcelStyle: {
            get () {
                return this.$store.state.Tools.LigFinder?.parcelStyle || null;
            },
            set (v) {
                if (this.clusters.length > 0 && v === "infrastructure") {
                    this.$store.state.Tools.LigFinder?.parcelLayer.setZIndex(6000);
                    this.$store.state.Tools.LigFinder?.clusterLayer.setZIndex(-1);
                }
                else if (this.clusters.length > 0 && v === undefined){
                    this.$store.state.Tools.LigFinder?.parcelLayer.setZIndex(-1);
                    this.$store.state.Tools.LigFinder?.clusterLayer.setZIndex(6000);
                }
                this.$store.dispatch("Tools/LigFinder/updateParcelStyles", v);
            }
        },
        range: {
            get () {
                return this.$store.state.Tools?.LigFinder?.Filters?.areaRange || [0, 100];
            },
            set (range) {
                this.$store.commit("Tools/LigFinder/Filters/setAreaRange", range);
            }
        }
    },
    methods: {
        ...mapActions("Tools/LigFinder", [
            "filterInfrastructure",
            "adjustDistanceWeighting"
        ]),
        checkInfrastructurePreferences(){
            console.log("this.infrastructureData", this.infrastructureData)
            let allDefined = true;
            for (const [key, value] of Object.entries(this.infrastructureData)) {
                    if (this.infrastructureData[key].range === "undefined")
                        {
                            Radio.trigger("Alert", "alert", "Bitte alle Werte eintragen." );
                            allDefined= false;
                            break;
                        }
            }
            if (allDefined) Radio.trigger("Alert", "alert", "Erfolgreich gespeichert." );

        }
    }
};
</script>
<template>
    <v-container
        id="modifier-sliders"
        fluid
    >
        <h5>
            {{ title }}

            <v-btn
                class="ma-2"
                icon
                small
                @click="infoInfrastructure.state = true"
            >
                <v-icon>
                    info
                </v-icon>
            </v-btn>
        </h5>

        <v-snackbar
            v-model="infoInfrastructure.state"
            :timeout="100000"
            color="info"
            :top="true"
            class="snackInfo"
        >
            {{ infoInfrastructure.text }}
            <v-btn
                text
                @click="infoInfrastructure.state = false"
            >
                Schließen
            </v-btn>
        </v-snackbar>
        <v-row  align="center"
      justify="start">
            <v-col  class="mb-6" >
              Supermarkt
                </v-col>
               <v-col class="d-flex">
                        <v-text-field
                            v-model="infrastructureData.grocery.range"
                            label="Distanz"
                            :rules="rules.range"
                        />
                    </v-col>
             <v-col class="d-flex">
                        <v-select
                            v-model="infrastructureData.grocery.range_type"
                            :items="units"
                            label="Einheit"
                        />
                    </v-col>
        </v-row>
        <v-row  align="center"
      justify="start">
            <v-col  class="mb-6" >
              Apotheke
                </v-col>
               <v-col class="d-flex">
                        <v-text-field
                            v-model="infrastructureData.pharmacy.range"
                            label="Distanz"
                            :rules="rules.range"
                        />
                    </v-col>
             <v-col class="d-flex">
                        <v-select
                            v-model="infrastructureData.pharmacy.range_type"
                            :items="units"
                            label="Einheit"
                        />
                    </v-col>
        </v-row>
                <v-row align="center"
      justify="start">
            <v-col class="d-flex">
              Schulen
                </v-col>
               <v-col class="d-flex">
                        <v-text-field
                            v-model="infrastructureData.school.range"
                            label="Distanz"
                            :rules="rules.range"
                        />
                    </v-col>
             <v-col class="d-flex">
                        <v-select
                            v-model="infrastructureData.school.range_type"
                            :items="units"
                            label="Einheit"
                        />
                    </v-col>
        </v-row>
        <v-row align="center"
      justify="start">
            <v-col class="d-flex">
              Haltestellen
                </v-col>
               <v-col class="d-flex">
                        <v-text-field
                            v-model="infrastructureData.stops.range"
                            label="Distanz"
                            :rules="rules.range"
                        />
                    </v-col>
             <v-col class="d-flex">
                        <v-select
                            v-model="infrastructureData.stops.range_type"
                            :items="units"
                            label="Einheit"
                        />
                    </v-col>
        </v-row>
        <v-row align="center"
      justify="start"> 
            <v-col class="d-flex">
              Autobahnausfahrt
                </v-col>
               <v-col class="d-flex">
                        <v-text-field
                            v-model="infrastructureData.highway.range"
                            label="Distanz"
                            :rules="rules.range"
                        />
                    </v-col>
             <v-col class="d-flex">
                        <v-select
                            v-model="infrastructureData.highway.range_type"
                            :items="units"
                            label="Einheit"
                        />
                    </v-col>
        </v-row>

        <v-card-actions>
            <v-btn
                :disabled="!distances"
                @click="filterInfrastructure"
            >
                Ergebnisse Anpassen
            </v-btn>
            <v-btn
                :disabled="!distances"
                :outlined="infrastructureStyle"
                color="primary"
                dark
                @click="checkInfrastructurePreferences"
            >
                Speichern
            </v-btn>

        </v-card-actions>
    </v-container>
</template>
<style lang="less">
    #modifier-sliders {
        label {
            width: 20%;
            font-size: 75%;
        }

        .modifier-val {
            width: 60px;

            label {
                text-align: right;
            }
        }
    }


    .snackInfo {
         font-size: 14px;
    }

</style>
