/*
 * Module for getting and setting ID5 API configuration.
 */

const utils = require('./utils');

/**
 * @typedef {Object} Id5Config
 * @property {number} [partnerId] - ID5 Publisher ID, mandatory
 * @property {boolean|false} [debug] - enable verbose debug mode (defaulting to id5_debug query string param if present, or false)
 * @property {boolean|false} [debugBypassConsent] - Bypass consent API et local storage consent for testing purpose only
 * @property {boolean|false} [allowLocalStorageWithoutConsentApi] - Tell ID5 that consent has been given to read local storage
 * => and allowLocalStorageWithoutConsent (if enabled, then for everyone in the page), platform should not set
 * @property {number} [refreshInSeconds] - Refresh period of first-party cookie (defaulting to 7200s)
 * => Keep the lowest until now, platform should not set
 * @property {string} [partnerUserId] - User ID for the platform deploying the API, to be stored by ID5 for further cookie matching if provided
 * @property {string} [cmpApi] - API to use CMP. As of today, either 'iab' or 'static'
 * => use cached consentData, supposed to be one per page
 * @property {object} [consentData] - Consent data if cmpApi is 'static'
 * @property {function} [callback] - Function to call back when User ID is available. if callbackTimeoutInMs is not provided, will be fired only if a User ID is available.
 * => Documentation => use the provided parameter and not ID5.xxxxx
 * => setting for multiple callback ?
 * @property {number} [callbackTimeoutInMs] - Delay in ms after which the callback is guaranteed to be fired. A User ID may not yet be available at this time.
 * @property {string} [pd] - Publisher data that can be passed to help with cross-domain reconciliation of the ID5 ID, more details here: https://wiki.id5.io/x/BIAZ
 * @property {array} [tpids] - An array of third party IDs that can be passed to usersync with ID5. Contact your ID5 representative to enable this
 * @property {AbTestConfig} [abTesting] - An object defining if and how A/B testing should be enabled
 * => per partner
 *
 * => multiple instance with same partner and different PD ?
 * => multiple callback
 *
 * myID5 = ID5.init(*config);
 * myID5.refresh(consent, pd, callback, callbackTimeoutInMs);
 */

/**
 * @typedef {Object} AbTestConfig
 * @property {boolean|false} [enabled] - Enable control group
 * @property {number} [controlGroupPct] - Ratio of users in control group [0,1]
 */

export class Config {
  /** @type {Id5Config} */
  config;

  /** @type {Id5Config} */
  providedConfig;

  static configTypes = {
    debug: 'Boolean',
    debugBypassConsent: 'Boolean',
    allowLocalStorageWithoutConsentApi: 'Boolean',
    cmpApi: 'String',
    consentData: 'Object',
    refreshInSeconds: 'Number',
    partnerId: 'Number',
    partnerUserId: 'String',
    callback: 'Function',
    callbackTimeoutInMs: 'Number',
    pd: 'String',
    tpids: 'Array',
    abTesting: 'Object'
  };

  /**
   * Create configuration instance from an object containing key-value pairs
   * @param {Id5Config} options
   */
  constructor(options) {
    this.config = {
      debug: utils.getParameterByName('id5_debug').toUpperCase() === 'TRUE',
      debugBypassConsent: false,
      allowLocalStorageWithoutConsentApi: false,
      cmpApi: 'iab',
      consentData: {
        getConsentData: {
          consentData: undefined,
          gdprApplies: undefined
        },
        getVendorConsents: {}
      },
      refreshInSeconds: 7200,
      partnerId: undefined,
      partnerUserId: undefined,
      callback: undefined,
      callbackTimeoutInMs: undefined,
      pd: '',
      tpids: undefined,
      abTesting: {
        enabled: false,
        controlGroupPct: 0
      }
    };
    this.providedConfig = {};
    this.updConfig(options);
  }

  /**
   * Return current configuration
   * @returns {Id5Config} options
   */
  getConfig() {
    return this.config;
  }

  /**
   * Return configuration set by user
   * @returns {Id5Config} options
   */
  getProvidedConfig() {
    return this.providedConfig;
  }

  /**
   * Override the configuration with an object containing key-value pairs
   * @param {Id5Config} options
   */
  updConfig(options) {
    if (typeof options !== 'object') {
      utils.logError('Config options must be an object');
    }

    Object.keys(options).forEach(topic => {
      if (utils.isA(options[topic], Config.configTypes[topic])) {
        this.config[topic] = options[topic];
        this.providedConfig[topic] = options[topic];
      } else {
        utils.logError(`setConfig options ${topic} must be of type ${Config.configTypes[topic]} but was ${toString.call(options[topic])}`);
      }
    });
  }
}

export default Config;
