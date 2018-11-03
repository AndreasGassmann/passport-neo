/* global describe, it, expect, before */
/* jshint expr: true */
var chai = require("chai"),
  Strategy = require("../lib/strategy"),
  validParams = require("./helpers/valid-params"),
  invalidParams = require("./helpers/invalid-params");

describe("Strategy", function() {
  describe("failing authentication", function() {
    var strategy = new Strategy(function({ challengeId, address }, done) {
      return done(null, false);
    });

    var err, code;

    before(function(done) {
      chai.passport
        .use(strategy)
        .fail(function(_err, _code) {
          err = _err;
          code = _code;
          done();
        })
        .req(function(req) {
          req.body = invalidParams;
        })
        .authenticate();
    });

    it("should fail", function() {
      expect(err)
        .to.be.an("object")
        .and.have.keys("message");
      expect(err.message).to.include("signature doesn't match challenge ID");
      expect(code).to.equal(400);
    });
  });

  describe("failing authentication with info", function() {
    var strategy = new Strategy(function({ challengeId, address }, done) {
      return done(null, false, { message: "authentication failed" });
    });

    var err, code;

    before(function(done) {
      chai.passport
        .use(strategy)
        .fail(function(_err, _code) {
          err = _err;
          code = _code;
          done();
        })
        .req(function(req) {
          req.body = validParams;
        })
        .authenticate();
    });

    it("should fail", function() {
      expect(err).to.be.an("object");
      expect(err.message).to.equal("authentication failed");
    });
  });
});
