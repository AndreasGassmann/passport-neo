/* global describe, it, expect, before */
/* jshint expr: true */

var chai = require("chai"),
  Strategy = require("../lib/strategy"),
  validParams = require("./helpers/valid-params"),
  invalidParams = require("./helpers/valid-params");

describe("Strategy", function() {
  describe("handing a request where a known challenge has been used", function() {
    let validChallenges = ["challenge"];
    var strategy = new Strategy(function({ challengeId, address }, done) {
      if (!validChallenges.includes(challengeId)) {
        return done(null, false);
      }
      if (address) {
        return done(null, { id: "1234", address }, { scope: "read" });
      }
      return done(null, false);
    });

    var user, info;

    before(function(done) {
      chai.passport
        .use(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.body = validParams;
        })
        .authenticate();
    });

    it("should supply user", function() {
      expect(user).to.be.an("object");
      expect(user.id).to.equal("1234");
      expect(user.address).to.equal("Adc4jT59RjDLdXbBni6xzg6SEcLVhHZ5Z9");
    });

    it("should supply info", function() {
      expect(info).to.be.an("object");
      expect(info.scope).to.equal("read");
    });
  });

  describe("handing a request where an unknown known challenge has been used", function() {
    let validChallenges = ["test"];
    var strategy = new Strategy(function({ challengeId, address }, done) {
      if (!validChallenges.includes(challengeId)) {
        return done(new Error("unknown challenge ID"));
      }
      if (address) {
        return done(null, { id: "1234", address }, { scope: "read" });
      }
      return done(null, false);
    });

    var err;

    before(function(done) {
      chai.passport
        .use(strategy)
        .error(function(e) {
          err = e;
          done();
        })
        .req(function(req) {
          req.query = validParams;
        })
        .authenticate();
    });

    it("should error", function() {
      expect(err).to.be.an.instanceof(Error);
      expect(err.message).to.equal("unknown challenge ID");
    });
  });
});
