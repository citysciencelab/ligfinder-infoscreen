<script>
/* Component description:
    This component enables the user to set his/hers preferences regarding to the the
    distance to the closest infrastructure amenities. The visualisation on the map can be 
    turned on (click on the "Layer einschalten") and turned off (click on the "Layer 
    ausschalten"). The greener the parcel, the smaller the weighted distance to the closest 
    infrastructure amenities. Weighting is done using the weighted aggregation method. The higher the weight, the greater
    the importance of this particular amenity.
*/
import {mapActions, mapGetters} from "vuex";
import {round, fallback} from "../../utils/utils";
export default {
    name: "FilterModifiers",
    data () {
        return {
            grocery: fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.grocery, 3), isNaN, 0),
            pharmacy: fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.pharmacy, 3), isNaN, 0),
            stops: fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.stops, 3), isNaN, 0),
            school: fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.school, 3), isNaN, 0),
            highway: fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.highway,3), isNaN, 0),
            infoInfrastructure: {
                state: false,
                text: "Hier können Sie die Gewichtung zu den Infrastrukturdaten verändern"
            },
            title: "Gewichtung der Infrastruktur",
            infrastructureStyle: false
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
            "parcelsInClusterLayer",
            "clusterLLayer"
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
        // grocery () {
        //     console.log("groecery", this.$store.state.Tools.LigFinder?.distanceWeighting?.grocery, 2);
        //     return fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.grocery, 2), isNaN, 0);
        // },
        // pharmacy () {
        //     return fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.pharmacy, 2), isNaN, 0);
        // },
        // school () {
        //     return fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.school, 2), isNaN, 0);
        // },
        // stops () {
        //     return fallback(round(this.$store.state.Tools.LigFinder?.distanceWeighting?.stops, 2), isNaN, 0);
        // },
        lockGrocery: {
            get () {
                return this.$store.state.Tools.LigFinder?.weightingLocked?.grocery || false;
            },
            set (lock) {
                // go trough all distanceWeighting and look which from them have weightingLocked true
                this.$store.commit("Tools/LigFinder/setWeightingLocked", {grocery: lock});
            }
        },
        lockPharmacy: {
            get () {
                return this.$store.state.Tools.LigFinder?.weightingLocked?.pharmacy || false;
            },
            set (lock) {
                // go trough all distanceWeighting and look which from them have weightingLocked true
                this.$store.commit("Tools/LigFinder/setWeightingLocked", {pharmacy: lock});
            }
        },
        lockSchool: {
            get () {
                return this.$store.state.Tools.LigFinder?.weightingLocked?.school || false;
            },
            set (lock) {
                // go trough all distanceWeighting and look which from them have weightingLocked true
                this.$store.commit("Tools/LigFinder/setWeightingLocked", {school: lock});
            }
        },
        lockStops: {
            get () {
                return this.$store.state.Tools.LigFinder?.weightingLocked?.stops || false;
            },
            set (lock) {
                // go trough all distanceWeighting and look which from them have weightingLocked true
                this.$store.commit("Tools/LigFinder/setWeightingLocked", {stops: lock});
            }
        },
        lockHighway: {
            get () {
                return this.$store.state.Tools.LigFinder?.weightingLocked?.highway || false;
            },
            set (lock) {
                // go trough all distanceWeighting and look which from them have weightingLocked true
                this.$store.commit("Tools/LigFinder/setWeightingLocked", {highway: lock});
            }
        },
        distances () {
            // eslint-disable-next-line no-unneeded-ternary
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
        }
    },
    methods: {
        ...mapActions("Tools/LigFinder", [
            "recalculateParcelInfos",
            "adjustDistanceWeighting"
        ]),
        setAll (amenity, val) {
            this.adjustDistanceWeighting([amenity, val]);
            for (const am in this.$store.state.Tools.LigFinder?.distanceWeighting) {
                this[am] = this.$store.state.Tools.LigFinder?.distanceWeighting[am];
            }
        },
        toggleInfrastructureStyle () {
            this.infrastructureStyle = !this.infrastructureStyle;

            if (this.infrastructureStyle) {
                this.parcelStyle = "infrastructure";
            }
            else {
                this.parcelStyle = null;
            }
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
        <v-row>
            <v-switch
                v-model="lockGrocery"
                name="grocery"
                class="mt-0 pt-0 lock-switch"
            />
            <v-slider
                v-model="grocery"
                :disabled=" active &&!weightingLocked.grocery"
                min="0"
                max="1"
                step="0.005"
                label="Supermärkte"
                hide-details
                @change="setAll('grocery', $event)"
            >
                <template v-slot:append>
                    <v-text-field
                        v-model="grocery"
                        :disabled=" active &&!weightingLocked.grocery"
                        min="0"
                        max="1"
                        step="0.005"
                        class="mt-0 pt-0 modifier-val"
                        hide-details
                        single-line
                        type="number"
                        @change="setAll('grocery', $event)"
                    />
                </template>
            </v-slider>
        </v-row>
        <v-row>
            <v-switch
                v-model="lockPharmacy"
                class="mt-0 pt-0 lock-switch"
            />
            <v-slider
                v-model="pharmacy"
                :disabled=" active &&!weightingLocked.pharmacy"
                min="0"
                max="1"
                step="0.005"
                label="Apotheken"
                hide-details
                @change="setAll('pharmacy', $event)"
            >
                <template v-slot:append>
                    <v-text-field
                        v-model="pharmacy"
                        :disabled=" active &&!weightingLocked.pharmacy"
                        min="0"
                        max="1"
                        step="0.005"
                        class="mt-0 pt-0 modifier-val"
                        hide-details
                        single-line
                        type="number"
                        @change="setAll('pharmacy', $event)"
                    />
                </template>
            </v-slider>
        </v-row>
        <v-row>
            <v-switch
                v-model="lockSchool"
                class="mt-0 pt-0 lock-switch"
            />
            <v-slider
                v-model="school"
                :disabled=" active &&!weightingLocked.school"
                min="0"
                max="1"
                step="0.005"
                label="Schulen"
                hide-details
                @change="setAll('school', $event)"
            >
                <template v-slot:append>
                    <v-text-field
                        v-model="school"
                        :disabled=" active &&!weightingLocked.school"
                        step="0.005"
                        min="0"
                        max="1"
                        class="mt-0 pt-0 modifier-val"
                        hide-details
                        single-line
                        type="number"
                        @change="setAll('school', $event)"
                    />
                </template>
            </v-slider>
        </v-row>
        <v-row>
            <v-switch
                v-model="lockStops"
                class="mt-0 pt-0 lock-switch"
            />
            <v-slider
                v-model="stops"
                :disabled=" active &&!weightingLocked.stops"
                class="modifier-slider"
                min="0"
                max="1"
                val="0.2"
                step="0.005"
                label="Haltstellen"
                hide-details
                @change="setAll('stops', $event)"
            >
                <template v-slot:append>
                    <v-text-field
                        v-model="stops"
                        :disabled=" active &&!weightingLocked.stops"
                        class="mt-0 pt-0 modifier-val"
                        min="0"
                        max="1"
                        step="0.005"
                        hide-details
                        single-line
                        type="number"
                        @change="setAll('stops', $event)"
                    />
                </template>
            </v-slider>
        </v-row>
        <v-row>
            <v-switch
                v-model="lockHighway"
                class="mt-0 pt-0 lock-switch"
            />
            <v-slider
                v-model="highway"
                :disabled=" active &&!weightingLocked.highway"
                class="modifier-slider"
                min="0"
                max="1"
                val="0.2"
                step="0.005"
                label="Autobahnausfahrt"
                hide-details
                @change="setAll('highway', $event)"
            >
                <template v-slot:append>
                    <v-text-field
                        v-model="highway"
                        :disabled=" active &&!weightingLocked.highway"
                        class="mt-0 pt-0 modifier-val"
                        min="0"
                        max="1"
                        step="0.005"
                        hide-details
                        single-line
                        type="number"
                        @change="setAll('highway', $event)"
                    />
                </template>
            </v-slider>
        </v-row>
        <v-card-actions>
            <v-btn
                :disabled="!distances"
                @click="recalculateParcelInfos"
            >
                Ergebnisse Anpassen
            </v-btn>

            <v-btn
                :disabled="!distances"
                :outlined="infrastructureStyle"
                :color="infrastructureStyle ? 'red' : 'primary'"
                dark
                @click="toggleInfrastructureStyle"
            >
                {{ infrastructureStyle ? 'Layer Ausschalten' : 'Layer Einschalten' }}
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
