import Vue from "vue";
import Vuex from "vuex";
import {generateMutations} from "@/store/generators.js";

Vue.use(Vuex);

const initialState = {
    activeSelectComponent: "SelectFeatures",
    parcels: [],
    parcelsBackup: [],
    clustersBackup: [],
    clusters: [],
    buildings: [],
    parcelsInCluster: [],
    selectedParcels: [],
    selectedClusters: [],
    parcelLayer: null,
    clusterLayer: null,
    buildingLayer: null,
    parcelsInClusterLayer: null,
    clusterInfos: [],
    rawFeaturesAktuell: [],
    infoLayers: {
        "Mittelzentrum": "14530",
        "Oberzentrum": "6933",
        "Festgestellte Bebauungspläne (PLIS)": "1561",
        "Bebauungspläne im Verfahren": "1562",
        "Wohnbauflächenpotential in Hamburg": "1532",
        "Tatsächliche Nutzung": "2442"
    },
    parcelStyle: null,
    infrastructureData: {
        grocery: {
            locations: [],
            range_type: "Meter",
            range: "undefined",
            profile: "Gehen",
            intervals: 5
        },
        highway: {
            locations: [],
            range_type: "Meter",
            range: "undefined",
            profile: "Gehen",
            intervals: 5
        },
        pharmacy: {
            locations: [],
            range_type: "Meter",
            range: "undefined",
            profile: "Gehen",
            intervals: 5
        },
        school: {
            locations: [],
            range_type: "Meter",
            range: "undefined",
            profile: "Gehen",
            intervals: 5
        },
        stations: {
            locations: [],
            range_type: "Meter",
            range: "undefined",
            profile: "Gehen",
            intervals: 5
        },
        stops: {
            locations: [],
            range_type: "Meter",
            range: "undefined",
            profile: "Gehen",
            intervals: 5
        }
    },
    mapSync: {
        selectedParcels: [],
        selectedClusters: []
    }
};

export default new Vuex.Store({
    state: {
        ...initialState
    },
    getters: {
        getByPath: state => path => {
            const pathArr = path.split("/");
            let stateVal = state;

            pathArr.forEach(key => {
                if (stateVal) {
                    stateVal = stateVal[key];
                }
            });

            return stateVal;
        }
    },
    mutations: {
        ...generateMutations(initialState)
    },
    actions: {}
});
