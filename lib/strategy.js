/**
 * Module dependencies.
 */
var passport = require("passport-strategy"),
  util = require("util"),
  Neon = require("@cityofzion/neon-js");

/**
 * `Strategy` constructor.
 *
 * The web3 strategy works by having the user sign a message using web3 using
 * their ethereum address. We take the signed message and use `ecrecover` to
 * decode the address it was signed with. If the decoded address matches the
 * address they are trying to sign in with, we authorize the user.
 *
 * Applications must supply a `onAuth` callback which is passed the user's ETH
 * address, the message they were asked to sign, and the signed message. You
 * may optionally perform additional verification in the callback, and if the
 * user is valid then you call the calback which is passed to `onAuth` which
 * will log the user in. You must pass the user object to this callback, or
 * pass an `err` argument if the login should fail.
 *
 * Examples:
 * const onAuth = function (req, address, msg, signed, done) {
 *   User.findOne({ address }, function (err, user) {
 *     done(err, user);
 *   });
 * }
 * const web3Strategy = new Web3Strategy(onAuth);
 * passport.use(web3Strategy);
 *
 * @param {Object} options
 * @param {Function} onAuth
 * @api public
 */
class Strategy extends passport.Strategy {
  constructor(options, onAuth) {
    if (typeof options == "function") {
      onAuth = options;
      options = {};
    }
    if (!onAuth) {
      throw new TypeError("NeoStrategy requires an onAuth callback");
    }

    super();
    this._onAuth = onAuth;
    this.name = "neo";
  }

  /**
   * Authenticate request based on the contents of a form submission.
   *
   * @param {Object} req
   * @api protected
   */
  authenticate(req, options = {}) {
    const credentials = this.getCredentials(req);

    if (!credentials) {
      const err = {
        message: options.badRequestMessage || "Missing credentials"
      };
      return this.fail(err, 400);
    }

    const { challengeId, signature, publickey } = credentials;

    let scriptHash = Neon.wallet.getScriptHashFromPublicKey(publickey);
    let address = Neon.wallet.getAddressFromScriptHash(scriptHash);

    let challengeSignatureValid = Neon.wallet.verify(
      challengeId,
      signature,
      publickey
    );

    if (!challengeSignatureValid) {
      const err = {
        message: "Invalid credentials (signature doesn't match challenge ID)"
      };
      return this.fail(err, 400);
    }

    const done = (err, user, info) => {
      if (err) {
        return this.error(err);
      }
      if (!user) {
        return this.fail(info);
      }
      this.success(user, info);
    };

    try {
      const authParams = { challengeId, signature, publickey };

      this._onAuth({ challengeId, address }, done, req, authParams);
    } catch (ex) {
      return this.error(ex);
    }
  }

  /**
   * Get the required auth params from request body, or fallback to query if
   * not provided in body, but provided in query
   * @param {Object} req
   * @return {Object}
   */
  getCredentials(req) {
    const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
    const hasAll = (obj, keys) => obj && keys.every(k => has(obj, k));

    const { body, query } = req;

    const paramKeys = ["challengeId", "signature", "publickey"];

    if (hasAll(body, paramKeys)) {
      return body;
    } else if (hasAll(query, paramKeys)) {
      return query;
    }

    return null;
  }
}

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
