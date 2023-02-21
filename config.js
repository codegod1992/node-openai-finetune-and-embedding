exports.values = {
 
    /**
     * The host that this server attaches to. Normally, localhost,
     * however, if this application is hosted in a Cloud Foundry DEA
     * it picks up the value from the environment variable: VCAP_APP_HOST.
     */
    host : (process.env.VCAP_APP_HOST || 'localhost'),

    /**
     * The port that this server listens. Defaults to 3000,
     * however, if this application is hosted in a Cloud Foundry DEA
     * it picks up the value from the environment variable: VCAP_APP_PORT.
     */
    port: Number(process.env.VCAP_APP_PORT || 3000),

};
