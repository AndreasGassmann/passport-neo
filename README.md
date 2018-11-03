## Neo Passport Strategy

Neo strategy for passport which authenticates the user by decoding a message
signed with the user's NEO private key.

### Setup

```js
const NeoStrategy = require("passport-neo");

/**
 * Called when authorization succeeds. Perform any additional verification here,
 * and either return the user's data (if valid), or deny authorization by
 * passing an error to the `done` callback.
 */
const onAuth = ({ challengeId, address }, done) => {
  // optional additional validation. To deny auth:
  if (!challengeId === "challenge string") {
    // Ideally you give a random challenge to each user
    done(new Error("User did not sign the right challenge."));
  }
  User.findOne({ address }, (err, user) => done(err, user));
};
const NeoStrategy = new NeoStrategy(onAuth);

passport.use(NeoStrategy);

// endpoint
app.post("/login", passport.authenticate("neo"));
```

### Usage (client-side)

```js
const Neon = require("@cityofzion/neon-js");

// The contents of the message has to be the challenge string from the server
const challengeId = 'challenge string';
const signature = Neon.wallet.sign(challengeId, neoAccount.WIF);
const handleSignature = (err, signed) => {
  if (!err) {
    const fetchOpts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }.
      body: JSON.stringify({ challengeId, signature, neoAccount.publicKey })
    };

    fetch('/login', fetchOpts).then(res => {
      if (res.status >= 200 && res.status <= 300) {
        return res.json();
      } else {
        throw Error(res.statusText);
      }
    }).then(json => {
      // Auth succeeded
    }).catch(err => {
      // Auth failed
    })
  }
};
```
