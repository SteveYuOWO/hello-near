import "regenerator-runtime/runtime";
import React, { useState } from "react";
import { login, logout } from "./utils";
import "./global.css";
import SteveIcon from "./assets/icon.png";
import NearIcon from "./assets/logo-white.svg";

import getConfig from "./config";
import Loading from "./loading";
const { networkId } = getConfig(process.env.NODE_ENV || "development");

export default function App() {
  const [loading, setLoading] = useState(false);
  // use React Hooks to store greeting in component state
  const [greeting, set_greeting] = React.useState();

  // when the user has not yet interacted with the form, disable the button
  const [buttonDisabled, setButtonDisabled] = React.useState(true);

  // after submitting the form, we want to show Notification
  const [showNotification, setShowNotification] = React.useState(false);

  // The useEffect hook can be used to fire side-effects during render
  // Learn more: https://reactjs.org/docs/hooks-intro.html
  React.useEffect(
    () => {
      // in this case, we only care to query the contract when signed in
      if (window.walletConnection.isSignedIn()) {
        // window.contract is set by initContract in index.js
        window.contract
          .get_greeting({ account_id: window.accountId })
          .then((greetingFromContract) => {
            set_greeting(greetingFromContract);
          });
      }
    },

    // The second argument to useEffect tells React when to re-run the effect
    // Use an empty array to specify "only run on first render"
    // This works because signing into NEAR Wallet reloads the page
    []
  );

  // if not signed in, return early with sign-in prompt
  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <div className="center">
          <img src={SteveIcon} width="250px" height="250px" />
          <img src={NearIcon} width="250px" height="250px" />
        </div>
        <h1>Near Space</h1>
        <p
          style={{
            textAlign: "right",
          }}
        >
          ———— Build by Steve Yu
        </p>
        <p>
          Hello, near. my name is steve yu. I am happy to participate in this
          challenge. I am a front-end developer. I'm learning rust language and
          near api for this challenge, I'm not very good at it but I'm
          enthusiastic about it. Here is my front-end work this time, hope you
          like it.
        </p>
        <p>Go ahead and click the button below to try it out:</p>
        <p style={{ textAlign: "center", marginTop: "2.5em" }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    );
  }

  return (
    <>
      {loading && <Loading />}
      <main className={loading && "blur"}>
        <div
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            fontWeight: "bold",
          }}
        >
          <div className="center">
            <div style={{ marginRight: "20px" }}>{accountId}</div>
            <button onClick={logout}>logout</button>
          </div>
        </div>
        <div className="center">
          <img src={SteveIcon} width="250px" height="250px" />
          <img src={NearIcon} width="250px" height="250px" />
        </div>

        <form
          onSubmit={async (event) => {
            event.preventDefault();

            setLoading(true);

            // get elements from the form using their id attribute
            const { fieldset, greeting } = event.target.elements;

            // hold onto new user-entered value from React's SynthenticEvent for use after `await` call
            const newGreeting = greeting.value;

            // disable the form while the value gets updated on-chain
            fieldset.disabled = true;

            try {
              // make an update call to the smart contract
              await window.contract.set_greeting({
                // pass the value that the user entered in the greeting field
                message: newGreeting,
              });
            } catch (e) {
              alert(
                "Something went wrong! " +
                  "Maybe you need to sign out and back in? " +
                  "Check your browser console for more info."
              );
              throw e;
            } finally {
              // re-enable the form, whether the call succeeded or failed
              fieldset.disabled = false;
            }

            // update local `greeting` variable to match persisted value
            set_greeting(newGreeting);

            // show Notification
            setShowNotification(true);

            setLoading(false);

            // remove Notification again after css animation completes
            // this allows it to be shown again next time the form is submitted
            setTimeout(() => {
              setShowNotification(false);
            }, 11000);
          }}
        >
          <fieldset id="fieldset">
            <label
              htmlFor="greeting"
              style={{
                display: "block",
                margin: "1.5em 0",
              }}
            >
              Please input the
              <strong>"Hello World"</strong> and try to click{" "}
              <strong>Submit button</strong>.
            </label>
            <div style={{ display: "flex" }}>
              <input
                autoComplete="off"
                defaultValue={greeting}
                id="greeting"
                onChange={(e) => setButtonDisabled(e.target.value === greeting)}
                style={{ flex: 1 }}
              />
              <button
                disabled={buttonDisabled}
                style={{
                  borderRadius: "0 5px 5px 0",
                  border: "2px solid white",
                  borderLeft: "none",
                }}
              >
                Submit
              </button>
            </div>
          </fieldset>
        </form>
        {greeting !== "None" && (
          <div className="said">
            <p>{window.accountId}</p>
            <p htmlFor="greeting">&nbsp; said, "{greeting}"</p>
          </div>
        )}
      </main>
      {showNotification && <Notification />}
    </>
  );
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`;
  return (
    <aside className="notification">
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.accountId}`}
      >
        {window.accountId}
      </a>
      {
        " " /* React trims whitespace around tags; insert literal space character when needed */
      }
      called method: 'set_greeting' in contract:{" "}
      <a
        target="_blank"
        rel="noreferrer"
        href={`${urlPrefix}/${window.contract.contractId}`}
      >
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  );
}
