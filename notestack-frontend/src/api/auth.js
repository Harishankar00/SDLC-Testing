import CONFIG from "../config";

const COGNITO_URL = `https://cognito-idp.${CONFIG.COGNITO_REGION}.amazonaws.com/`;

async function cognitoRequest(action, params) {
  const response = await fetch(COGNITO_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-amz-json-1.1",
      "X-Amz-Target": `AWSCognitoIdentityProviderService.${action}`,
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (data.__type) {
    throw new Error(data.message || data.__type);
  }
  return data;
}

export async function signUp(email, password, name) {
  return cognitoRequest("SignUp", {
    ClientId: CONFIG.COGNITO_CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
    ],
  });
}

export async function confirmSignUp(email, code) {
  return cognitoRequest("ConfirmSignUp", {
    ClientId: CONFIG.COGNITO_CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
  });
}

export async function signIn(email, password) {
  const result = await cognitoRequest("InitiateAuth", {
    AuthFlow: "USER_PASSWORD_AUTH",
    ClientId: CONFIG.COGNITO_CLIENT_ID,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
    },
  });

  const tokens = result.AuthenticationResult;
  localStorage.setItem("idToken", tokens.IdToken);
  localStorage.setItem("accessToken", tokens.AccessToken);
  localStorage.setItem("refreshToken", tokens.RefreshToken);

  return tokens;
}

export function signOut() {
  localStorage.removeItem("idToken");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function getIdToken() {
  return localStorage.getItem("idToken");
}

export function isLoggedIn() {
  return !!localStorage.getItem("idToken");
}

export function getUserFromToken() {
  const token = getIdToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return { email: payload.email, name: payload.name, sub: payload.sub };
  } catch {
    return null;
  }
}
