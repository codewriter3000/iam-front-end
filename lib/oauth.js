const oauthBaseURL = "http://localhost:8080/oauth";

export function buildOAuthQueryString(searchParams) {
  const params = new URLSearchParams(searchParams || "");

  if (params.has("query_string")) {
    const nested = params.get("query_string") || "";
    return nested.replace(/^\?/, "");
  }

  return params.toString();
}

export function getAuthorizeURL(queryString) {
  const normalized = (queryString || "").replace(/^\?/, "");
  return normalized
    ? `${oauthBaseURL}/authorize?${normalized}`
    : `${oauthBaseURL}/authorize`;
}

export function getConsentTooltip() {
  return "Consent is skipped for trusted clients";
}
