import Head from "next/head";
import TweetEmbed from "react-tweet-embed";
import { useState, useEffect } from "react";
import BeatLoader from "react-spinners/BeatLoader"; // Loading animation
import { Modal } from 'react-responsive-modal';

export default function Home() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [tweet, setTweet] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [session, setSession] = useState(null);

  function handleLogin() {
    fetch("/api/auth/getOAuthToken")
      .then((res) => res.json())
      .then((json) => {
        const { oauth_token } = json;

        window.location.href = `https://api.twitter.com/oauth/authenticate?oauth_token=${oauth_token}`;
      });
  }

  function openModal() {
    if (!modal) {
      setModal(true);
    }
  }

  function closeModal() {
    if (modal) {
      setModal(false);
      setConfirmation("");
    }
  }

  function handleSignOut() {
    localStorage.removeItem("session");
    window.location.reload();
  }

  function getPostId(url) {
    const tokens = url.split("/");
    return tokens[tokens.length - 1];
  }

  function handleSubmit() {
    setLoading(true);
    fetch("/api/block", {
      method: "POST",
      body: JSON.stringify({
        ...session,
        post_id: getPostId(tweet),
        post_url: tweet,
      }),
    }).then(() => {
      setLoading(false);
      closeModal();
      setStep(3);
    });
  }

  useEffect(() => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    const access_token = params.get("access_token");
    const access_token_secret = params.get("access_token_secret");
    const screen_name = params.get("screen_name");
    if (screen_name && access_token_secret && access_token) {
      const sess = {
        access_token,
        access_token_secret,
        screen_name,
      };

      localStorage.setItem("session", JSON.stringify(sess));
      setSession(sess);
      setStep(1);
      window.history.replaceState(null, null, window.location.pathname);
    } else if (localStorage.getItem("session")) {
      setSession(JSON.parse(localStorage.getItem("session")));
    }
  }, []);

  function renderContent() {
    switch (step) {
      case 0:
        return (
          <div className="landing">
            <h1>
              <span>MegaBlock</span> lets you{" "}
              <span className="dangerzone">nuke</span> a tweet.
            </h1>
            <p>
              Don't like a bad tweet? Block the tweet, its author, and every
              single person who liked it—in one click.
            </p>
            <p>
              A drop by the{" "}
              <a
                href="https://genzmafia.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Gen Z Mafia
              </a>
              .
            </p>
            <small>
              <a href={"https://helloforefront.com"}>
                The best way to deploy machine learning models
              </a>
            </small>
            <TweetEmbed id="1288211237772226560" />
            <button className="get_started_button" onClick={() => setStep(1)}>
              Get Started
            </button>
          </div>
        );

      case 1:
        return (
          <div className="login_twitter landing">
            <h1>Login via Twitter</h1>
            <p>Get started by signing in with Twitter.</p>
            <p>
              We won't use your account in any other way than to{" "}
              <span className="cancel">nuke</span> the people you ask us to.
            </p>
            {!session ? (
              // Manual redirection
              <button onClick={handleLogin} className="twitter_signin">
                <img src="/twitter-256.png" alt="Twitter logo" />
                <span>Login with Twitter</span>
              </button>
            ) : (
              <div className="profile">
                <img
                  src={`https://twivatar.glitch.me/@${session.screen_name}`}
                  alt="Profile picture"
                />
                <div>
                  <span>{session.screen_name}</span>
                  <button onClick={handleSignOut}>Sign out</button>
                </div>
              </div>
            )}
            <div className="progress_buttons">
              <button onClick={() => setStep(0)}>Go back</button>
              {!session ? (
                <button className="add_positivity disabled_button" disabled>
                  Next step
                </button>
              ) : (
                <button onClick={() => setStep(2)} className="add_positivity">
                  Next step
                </button>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="login_twitter landing">
            <h1>Paste the Twitter post URL</h1>
            <p>
              MegaBlock will block the author of the tweet, and anyone who liked
              the tweet too. Be sure you want to do this.
            </p>
            <input
              type="text"
              value={tweet}
              onChange={(e) => setTweet(e.target.value)}
              className="twitter_input"
              placeholder="https://twitter.com/twitter/status/1234..."
            />
            {tweet !== "" ? <TweetEmbed id={getPostId(tweet)} /> : null}
            <div className="progress_buttons custom_bottom_margin">
              <button onClick={() => {setStep(1); setTweet("")}}>Go back</button>
              {!session && tweet == '' ? (
                <button className="add_positivity disabled_button" disabled>
                  Next step
                </button>
              ) : (
                <button onClick={openModal} className="megablock_button">
                  MegaBlock!
                </button>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="login_twitter landing">
            <h1>MegaBlock Successful</h1>
            <p>We 🅱️locked that user and everyone who liked the post!</p>
            <img className="gif" src="https://i.pinimg.com/originals/47/12/89/471289cde2490c80f60d5e85bcdfb6da.gif" alt="MegaBlock Nuke" />
            <div className="progress_buttons">
              <button onClick={() => {setStep(0); setTweet("");}}>Back Home</button>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="root">
      <Head>
        <title>MegaBlock | Nuke tweets in one click</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicon/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta
          name="description"
          content="Don't like a bad tweet? Block the tweet, its author, and every single person who liked it—in one click."
        />
        <meta property="og:type" content="website" />
        <meta
          name="og:title"
          property="og:title"
          content="MegaBlock | Nuke tweets in one click"
        />
        <meta
          name="og:description"
          property="og:description"
          content="Don't like a bad tweet? Block the tweet, its author, and every single person who liked it—in one click."
        />
        <meta property="og:site_name" content="MegaBlock.XYZ" />
        <meta property="og:url" content="https://megablock.xyz" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="MegaBlock | Nuke tweets in one click"
        />
        <meta
          name="twitter:description"
          content="Don't like a bad tweet? Block the tweet, its author, and every single person who liked it—in one click."
        />
        <meta name="twitter:site" content="https://megablock.xyz" />
        <meta
          property="og:image"
          content="https://megablock.xyz/twitterimage.png"
        />
        <meta
          name="twitter:image"
          content="https://megablock.xyz/twitterimage.png"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        ></link>
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=UA-173583190-3%22%3E" >
        </script>
        <script dangerouslySetInnerHTML={
          { __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments)}
              gtag("js", new Date());
              gtag("config", "G-8PEFF3YBHP");
          `}
        }>
        </script>
      </Head>
      <Modal open={modal} onClose={closeModal} center>
        <div className="modal__header">
          <h3>Are you sure you want to nuke this tweet?</h3>
        </div>
        <div className="modal__content">
          <p>You will block the author, all people that liked this tweet, and unfollow all of these individuals.</p>
          <input value={confirmation} onChange={e => setConfirmation(e.target.value)} placeholder="Type: I confirm I want to nuke" />
          <div>
            <button onClick={closeModal}>Cancel</button>
            {confirmation.toLowerCase() == 'i confirm i want to nuke' ? (
              <button onClick={handleSubmit} className="megablock_button">
                {!loading ? (
                  <span>MegaBlock!</span>
                ) : (
                  <CustomLoader />
                )}
              </button>
            ) : (
              <button>Enter input</button>
            )}
          </div>
        </div>
      </Modal>
      <div className="content">{renderContent()}</div>
      <style jsx global>
        {`
          html {
            background-color: rgb(243, 247, 249);
          }
          .dangerzone {
            color: rgb(243, 247, 249) !important;
            background: repeating-linear-gradient(
              45deg,
              red,
              red 10px,
              #333333 10px,
              #333333 20px
            );

            padding: 0 5px;
            border-radius: 15px;
          }
          .react-responsive-modal-overlay {
            background: rgba(0, 0, 0, 0.35);
          }
          .react-responsive-modal-modal {
            padding: 0px !important;
            border-radius: 5px;
          }
          .modal__header {
            padding: 15px;
            text-align: center;
            background-color: rgb(243, 247, 249);
            width: calc(100% - 30px);
            display: block;
            border-top-left-radius: 6px;
            border-top-right-radius: 6px;
            border-bottom: 1px solid #e7eaf3;
          }
          .modal__content {
            padding: 0px 10px;
            text-align: center;
          }
          .modal__content > p {
            max-width: 500px;
            line-height: 25px;
          }
          .modal__content > p:nth-child(2) {
            margin-block-end: 10px;
          }
          .modal__content > input {
            width: calc(100% - 20px);
            height: 36px;
            border: 1px solid #aaa;
            background-color: white;
            border-radius: 5px;
            padding-left: 5px;
            font-size: 20px;
            margin-bottom: 10px;
            color: #c00;
          }
          .modal__content > div {
            display: inline-block;
            padding-bottom: 10px;
          }
          .modal__content > div > button {
            display: inline-block;
            margin: 10px;
            font-size: 17px;
            padding: 11px 25px;
            border-radius: 6px;
            border: none;
            transition: 50ms ease-in-out;
          }
          .modal__content > div > button:nth-child(1):hover {
            opacity: 0.7;
          }
          .modal__content > div > button:focus {
            outline: none;
          }
          .cancel {
            color: rgb(224, 36, 94);
          }
          .landing > h1 {
            color: rgb(22, 32, 44);
            font-size: 45px;
            margin-block-end: 0px;
          }
          .landing > h1 > span {
            color: rgb(29, 161, 242);
          }
          .landing > p {
            color: rgb(99, 117, 131);
            font-weight: 500;
            font-size: 18px;
            max-width: 500px;
            line-height: 26.5px;
          }
          .landing > small{
          
            color: rgb(99, 117, 131);
            font-weight: 500;
            font-size: 14px;
            max-width: 500px;
            line-height: 26.5px;
          
          }
          .landing > small > a {
            color: inherit;
            text-decoration: none;
            
            transition: 100ms ease-in-out;
          }
          
          .landing > small > a:hover{
            
            border-bottom: 1px solid rgb(99, 117, 131);
            
            }
          .landing > p > a {
            color: rgb(22, 32, 44);
            text-decoration: none;
            border-bottom: 1px solid rgb(22, 32, 44);
            transition: 100ms ease-in-out;
          }
          .landing > p > a:hover {
            opacity: 0.7;
          }
          .get_started_button {
            margin-top: 10px;
            font-size: 17px;
            padding: 10px 25px;
            color: #fff;
            border: none;
            border-radius: 6px;
            transition: 100ms ease-in-out;
            background-color: rgb(29, 161, 242);
            box-shadow: 0 4px 11px rgba(29, 161, 242, 0.35);
          }
          .get_started_button:hover {
            background-color: rgb(20, 151, 232);
          }
          .twitter_signin {
            background-color: #0097ed;
            border: none;
            color: #fff;
            font-weight: 500;
            font-size: 17px;
            width: 220px;
            padding: 10px 0px;
            border-radius: 5px;
            margin: 20px 0px;
            transition: 50ms ease-in-out;
            text-decoration: none;
            display: inline-block;
          }
          .twitter_signin:hover {
            opacity: 0.7;
          }
          .twitter_signin > img {
            height: 20px;
            vertical-align: middle;
            float: left;
            padding-left: 10px;
          }
          .twitter_signin > span {
            vertical-align: middle;
          }
          .root {
            width: 100vw;
            height: 100vh;
            display: flex;
          }
          .content {
            align-items: center;
            justify-content: center;
            margin: auto;
          }
          .progress_buttons > button {
            display: inline-block;
            margin: 10px;
            font-size: 17px;
            padding: 11px 17.5px;
            border-radius: 6px;
            border: none;
            transition: 50ms ease-in-out;
          }
          .progress_buttons > button:nth-child(1):hover {
            opacity: 0.7;
          }
          .progress_buttons > button:focus {
            outline: none;
          }
          .gif {
            border-radius: 5px;
          }
          .twitter_input {
            width: calc(100% - 5px);
            height: 36px;
            border: 1px solid #aaa;
            background-color: white;
            border-radius: 5px;
            padding-left: 5px;
            font-size: 20px;
            margin-bottom: 15px;
          }
          .twitter_input:focus {
            outline: none;
          }
          .custom_bottom_margin {
            padding-bottom: 50px;
          }
          body {
            font-family: "Inter", sans-serif;
            margin: 0px;
          }
          .container > div {
            display: inline-block;
            text-align: center;
          }
          .head {
            padding: 0px 20px 40px 20px;
            width: calc(100% - 40px);
            min-height: 320px;
          }
          .landing {
            padding: 0px 25px;
          }
          .head > h1,
          .head > div > h1 {
            font-size: 55px;
            margin-block-end: 0px;
          }
          .head > h2,
          .head > div > h2 {
            margin-block-start: 5px;
          }
          .head > p,
          .head > div > p {
            color: rgb(107, 114, 128);
            font-size: 18px;
            line-height: 27px;
            max-width: 600px;
            margin: auto;
          }
          .head > p > a {
            color: #000;
            text-decoration: none;
            border-bottom: 1px solid #a550de;
          }
          .head > p > a:hover {
            opacity: 0.7;
          }
          .add_positivity {
            margin-top: 20px;
            font-size: 17px;
            padding: 11px 17.5px;
            border-radius: 6px;
            border: none;
            color: #fff;
            font-weight: 500;
            transition: 100ms ease-in-out;
            background-color: rgb(29, 161, 242);
            box-shadow: 0 4px 11px rgba(29, 161, 242, 0.35);
          }
          .add_positivity:hover {
            background-color: rgb(20, 151, 232);
          }
          .add_positivity:focus {
            outline: none;
          }
          .megablock_button {
            margin-top: 20px;
            font-size: 17px;
            padding: 11px 17.5px;
            border-radius: 6px;
            border: none;
            color: #fff;
            font-weight: 500;
            transition: 100ms ease-in-out;
            box-shadow: 0 4px 11px rgba(204, 0, 0, 0.35);
            background-color: #c00;
          }
          .megablock_button:hover {
            background-color: #d22;
          }
          .megablock_button:focus {
            outline: none;
          }
          .progress_buttons {
            margin-left: -10px !important;
          }
          .progress_buttons > button {
            display: inline-block;
            margin: 10px;
            font-size: 17px;
            padding: 11px 20px;
            border-radius: 6px;
            border: none;
            transition: 50ms ease-in-out;
          }
          .progress_buttons > button:nth-child(1):hover {
            opacity: 0.7;
          }
          .progress_buttons > button:focus {
            outline: none;
          }
          .tweets {
            min-height: calc(100vh - 300px);
            width: calc(100% - 40px);
            padding: 20px;
            background-color: #212937;
            border-top: 3px solid rgb(88, 80, 236);
          }
          .tweet {
            background-color: #fff;
            display: inline-block;
            max-width: 310px;
            padding: 10px 20px;
            border-radius: 5px;
            text-align: left;
            position: relative;
            margin: 10px;
            vertical-align: top;
          }
          .tweet > img:nth-child(1) {
            display: inline-block;
            vertical-align: middle;
            border-radius: 45px;
            height: 40px;
          }
          .pushpin {
            height: 40px;
            position: absolute;
            top: -20px;
            right: -20px;
          }
          .tweet_name {
            display: inline-block;
            font-size: 18px;
            color: rgb(88, 80, 236);
            text-decoration: none;
            transition: 50ms ease-in-out;
            vertical-align: middle;
            margin-left: 10px;
          }
          .tweet > p {
            margin-block-start: 9px;
            margin-block-end: 0px;
            font-size: 16px;
            display: block;
            line-height: 23px;
          }
          .tweet_editable {
            background-color: rgb(247, 247, 247);
            transform: translateY(20px);
            margin-bottom: 30px;
          }
          .tweet_editable > textarea {
            width: calc(100% - 10px);
            margin-top: 10px;
            border: none;
            background-color: rgb(240, 240, 240);
            border-radius: 5px;
            padding: 5px;
            font-family: "Inter", sans-serif;
            font-size: 15px;
            height: 80px;
            resize: none;
          }
          .timestamp {
            display: block;
            text-align: right;
            font-size: 14px;
            margin-block-start: 3px;
            margin-block-end: 5px;
            color: rgb(107, 114, 128);
          }
          .twitter_signin {
            background-color: #0097ed;
            border: none;
            color: #fff;
            font-weight: 500;
            font-size: 17px;
            width: 220px;
            padding: 10px 0px;
            border-radius: 5px;
            margin: 20px 0px;
            transition: 50ms ease-in-out;
            text-decoration: none;
            display: inline-block;
          }
          .twitter_signin:hover {
            opacity: 0.7;
          }
          .twitter_signin > img {
            height: 20px;
            vertical-align: middle;
            float: left;
            padding-left: 10px;
          }
          .twitter_signin > span {
            vertical-align: middle;
          }
          .profile {
            display: inline-block;
            padding: 10px;
            background-color: rgb(239, 239, 239);
            border-radius: 5px;
            min-width: 200px;
            text-align: left;
            margin: 20px 0px 10px 0px;
          }
          .profile > img {
            border-radius: 50%;
            vertical-align: middle;
            height: 40px;
          }
          .profile > div {
            display: inline-block;
            margin-left: 10px;
            vertical-align: middle;
            text-align: left;
          }
          .profile > div > span {
            display: block;
            font-weight: 500;
          }
          .profile > div > button {
            font-size: 13px;
            color: rgb(29, 161, 242);
            transition: 50ms ease-in-out;
            border: none;
            padding: 0px;
          }
          .profile > div > button:hover {
            opacity: 0.8;
          }
          .underline {
            color: #000;
            border-bottom: 1px solid #a550de;
          }
          .disabled_button {
            color: #000 !important;
            background-color: rgb(220, 220, 220);
            box-shadow: none !important;
            cursor: not-allowed;
          }
          .disabled_button:hover {
            background-color: rgb(220, 220, 220) !important;
          }
          .success_submit {
            padding-top: 30px;
          }
          .success_submit > h1 {
            margin-block-start: 0px;
          }
          .celebrate {
            font-size: 30px;
          }
          .loading-text {
            display: block;
            font-size: 30px;
            color: #fff;
          }
          @media screen and (max-width: 500px) {
            .head,
            .tweets {
              text-align: left !important;
            }
            .head {
              height: auto;
            }
          }
        `}
      </style>
    </div>
  );
}

// Loading animation
function CustomLoader() {
  return <BeatLoader
    size={6}
    color={"#fff"}
    loading={true}
  />
}