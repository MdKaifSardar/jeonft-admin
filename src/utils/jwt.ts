import { jwtVerify, SignJWT } from "jose";

// Properly encode the JWT secret
const SECRET = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);

export interface TokenPayload {
  [key: string]: unknown;
}

// Function to sign a token
export const signToken = async (payload: TokenPayload): Promise<string> => {
  return (
    new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" }) // Specify the algorithm to use
      .setIssuedAt() // Set the issue time
      // .setExpirationTime("1h") // Remove expiration time to prevent automatic expiry
      .sign(SECRET)
  );
};

// Function to verify a token
export const verifyToken = async (token: string): Promise<TokenPayload> => {
  const { payload } = await jwtVerify(token, SECRET);
  return payload;
};
