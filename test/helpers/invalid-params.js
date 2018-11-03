/**
 * These params should cause authorization to fail.
 * Request body for an eth address that wont match the recovered one.
 */
module.exports = {
  challengeId: "nope",
  signature:
    "d40acfdc669806b919f88065ca4614cbc1596aaf82e3b22f507fc52f73a6efa9af8a282365903646e9c63843920990f0ef803c55647dc88484d3d172a0650836",
  publickey:
    "02963fc761eb7135c4593bfc6a0af96d8588b70d8f6ef3af8549181e57772181f5"
};
