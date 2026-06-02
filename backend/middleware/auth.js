const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const prisma = require("../prismaClient");

require("dotenv").config();

// The correct Supabase JWKS endpoint
const client = jwksClient({
  jwksUri: `https://${process.env.SUPABASE_PROJECT_REF}.supabase.co/auth/v1/.well-known/jwks.json`,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

const requireAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Unauthorized: Missing or invalid token" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(
      token,
      getKey,
      { algorithms: ["RS256", "ES256"] },
      (err, decodedPayload) => {
        if (err) {
          return res
            .status(498)
            .json({ error: "Unauthorized: Token expired or invalid" });
        }

        const userRole = decodedPayload.app_metadata?.custom_role || "WRITER";

        req.user = {
          id: decodedPayload.sub,
          role: userRole,
        };

        next();
      },
    );
  } catch (error) {
    throw error;
  }
};

module.exports = { requireAuth };
