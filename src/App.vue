<script>
import Infoscreen from "@/components/Infoscreen.vue";

export default {
    name: "App",

    components: {
        Infoscreen,
    },

    data: () => ({
    //
    }),
};
</script>

<template>
    <v-app>
        <h1>Bonjour</h1>
        <Infoscreen />
    </v-app>
</template>
