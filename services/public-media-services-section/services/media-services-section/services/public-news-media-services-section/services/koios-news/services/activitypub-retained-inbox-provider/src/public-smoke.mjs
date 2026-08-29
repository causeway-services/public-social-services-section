const ORIGIN = "https://bare-cedar-fog.561.group";
const ACTOR = `${ORIGIN}/actors/koios-news`;
const INBOX = `${ACTOR}/inbox`;
const ACCOUNT = "acct:koios-news@bare-cedar-fog.561.group";
const WEBFINGER = `${ORIGIN}/.well-known/webfinger?resource=${encodeURIComponent(ACCOUNT)}`;

function responseType(response) {
  return response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
}

async function readJson(response, label) {
  if (response.status !== 200) throw new Error(`${label} returned HTTP ${response.status}`);
  try { return await response.json(); }
  catch (error) { throw new Error(`${label} did not return JSON: ${error.message}`); }
}

export async function probePublicActivityPub({ fetchImpl = fetch, signal } = {}) {
  const actorResponse = await fetchImpl(ACTOR, {
    headers: { accept: "application/activity+json" }, redirect: "error", signal,
  });
  const actorType = responseType(actorResponse);
  if (actorType !== "application/activity+json" && actorType !== "application/ld+json") {
    throw new Error(`public actor returned unexpected content type: ${actorType ?? "absent"}`);
  }
  const actor = await readJson(actorResponse, "public actor");
  if (actor.id !== ACTOR || actor.inbox !== INBOX || !["Service", "Application"].includes(actor.type)) {
    throw new Error("public actor does not advertise the fixed Koios identity and inbox");
  }

  const webfingerResponse = await fetchImpl(WEBFINGER, {
    headers: { accept: "application/jrd+json" }, redirect: "error", signal,
  });
  if (responseType(webfingerResponse) !== "application/jrd+json") {
    throw new Error(`WebFinger returned unexpected content type: ${responseType(webfingerResponse) ?? "absent"}`);
  }
  const webfinger = await readJson(webfingerResponse, "WebFinger");
  const self = Array.isArray(webfinger.links) && webfinger.links.some((link) =>
    link?.rel === "self" && link.href === ACTOR && link.type === "application/activity+json"
  );
  if (webfinger.subject !== ACCOUNT || !Array.isArray(webfinger.aliases) || !webfinger.aliases.includes(ACTOR) || !self) {
    throw new Error("WebFinger does not bind the fixed Koios account to the public actor");
  }
  return Object.freeze({
    kind: "koios.news.activitypub-public-smoke/v1",
    actor: ACTOR,
    inbox: INBOX,
    webfingerSubject: ACCOUNT,
    actorStatus: actorResponse.status,
    webfingerStatus: webfingerResponse.status,
    mutationPerformed: false,
  });
}

export const PUBLIC_ACTIVITYPUB = Object.freeze({ origin: ORIGIN, actor: ACTOR, inbox: INBOX, account: ACCOUNT, webfinger: WEBFINGER });
